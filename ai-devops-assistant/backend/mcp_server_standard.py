#!/usr/bin/env python3
"""
Standardised MCP Server for **DevOps AI Assistant** (HTTP Mode)
──────────────────────────────────────────────────────────────
*   JSON‑RPC 2.0 compliant
*   FastAPI + async httpx  ⇒ non‑blocking, production‑ready
*   Exposes `initialize`, `tools/list`, `tools/call`, **and** `tools/cancel`
*   Streams partial completions when the backend supports it (SSE / chunked)
*   Transparently falls back to non‑streaming if the backend does not support it
*   Secure by default: env‑based config, restrictive CORS, structured logging
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional, AsyncGenerator

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

###############################################################################
# ── Settings & logging ────────────────────────────────────────────────────── #
###############################################################################

@dataclass(frozen=True)
class Settings:
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    model_name: str = os.getenv("MODEL_NAME", "llama-3.2-1b-instruct")
    request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "120"))
    allow_origins: str = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost")
    default_port: int = int(os.getenv("PORT", "7373"))
    llm_stream: bool = os.getenv("LLM_STREAM", "1") == "1"  # toggle streaming


settings = Settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("mcp-server")

###############################################################################
# ── FastAPI bootstrap ─────────────────────────────────────────────────────── #
###############################################################################

app = FastAPI(title="DevOps AI Assistant – MCP Server", version="1.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allow_origins.split(",")],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

###############################################################################
# ── MCP core implementation ───────────────────────────────────────────────── #
###############################################################################

class MCPServer:
    """Core MCP logic separated from FastAPI plumbing."""

    # ------------------------------------------------------------------ utils

    @staticmethod
    def _make_response(*, id_: Any, result: Optional[Any] = None, error: Optional[Dict] = None) -> Dict:
        if error is not None:
            return {"jsonrpc": "2.0", "id": id_, "error": error}
        return {"jsonrpc": "2.0", "id": id_, "result": result}

    # ---------------------------------------------------------------- handlers

    def handle_initialize(self, req: Dict) -> Dict:
        return self._make_response(
            id_=req["id"],
            result={
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}, "resources": {}},
                "serverInfo": {"name": "DevOps AI Assistant", "version": "1.5.0"},
            },
        )

    def handle_tools_list(self, req: Dict) -> Dict:
        tools = [
            {
                "name": "ask_devops_question",
                "description": "Ask questions about infrastructure, deployment, monitoring, and best practices",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "question": {"type": "string", "description": "Your DevOps question"}
                    },
                    "required": ["question"],
                },
            }
        ]
        return self._make_response(id_=req["id"], result={"tools": tools})

    # --------------------------- LLM call helpers -----------------------------

    async def _call_llm(self, question: str) -> AsyncGenerator[str, None]:
        """Yield text pieces from the LLM, streaming if the backend supports it."""

        chat_payload = {
            "model": settings.model_name,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a DevOps AI Assistant. Help with infrastructure, deployment, monitoring, security, and DevOps best practices.",
                },
                {"role": "user", "content": question},
            ],
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": settings.llm_stream,
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout) as client:
            if settings.llm_stream:
                # Use streaming endpoint
                async with client.stream(
                    "POST",
                    f"{settings.backend_url}/v1/chat/completions",
                    json=chat_payload,
                    timeout=None,
                ) as resp:
                    resp.raise_for_status()
                    ctype = resp.headers.get("content-type", "")
                    if "text/event-stream" not in ctype:
                        # Backend ignored stream flag, fall back to JSON once
                        data = await resp.json()
                        yield data["choices"][0]["message"]["content"]
                        return
                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            payload = json.loads(data)
                            delta = (
                                payload["choices"][0].get("delta", {}).get("content")
                                or payload["choices"][0]["message"].get("content")
                            )
                            if delta:
                                yield delta
                        except Exception as exc:
                            logger.debug("Malformed SSE line: %s (%s)", line, exc)
            else:
                # Non‑streaming path
                resp = await client.post(
                    f"{settings.backend_url}/v1/chat/completions",
                    json=chat_payload,
                    timeout=None,
                )
                resp.raise_for_status()
                data = resp.json()
                yield data["choices"][0]["message"]["content"]

    # ---------------------------------------------------------------- tools

    async def handle_tools_call(self, req: Dict) -> StreamingResponse | Dict:
        name = req.get("params", {}).get("name")
        if name != "ask_devops_question":
            return self._make_response(id_=req["id"], error={"code": -32601, "message": f"Unknown tool: {name}"})

        question = req["params"].get("arguments", {}).get("question", "").strip()
        if not question:
            return self._make_response(id_=req["id"], error={"code": -32602, "message": "'question' is required"})

        logger.info("Processing question (%s chars)…", len(question))

        async def _jsonrpc_stream():  # type: () -> AsyncGenerator[bytes, None]
            buffer = ""
            async for chunk in self._call_llm(question):
                buffer += chunk
                yield (
                    json.dumps(
                        {
                            "jsonrpc": "2.0",
                            "id": req["id"],
                            "result": {"type": "partial", "text": buffer},
                        }
                    ).encode() + b"\n"
                )
            yield json.dumps(
                {
                    "jsonrpc": "2.0",
                    "id": req["id"],
                    "result": {"type": "text", "text": buffer},
                }
            ).encode()

        return StreamingResponse(_jsonrpc_stream(), media_type="application/json-stream")

    def handle_tools_cancel(self, req: Dict) -> Dict:
        logger.info("Cancellation requested for id=%s (noop)", req.get("params", {}).get("id"))
        return self._make_response(id_=req["id"], result=None)


###############################################################################
# ── Request router ────────────────────────────────────────────────────────── #
###############################################################################

mcp = MCPServer()

METHOD_TABLE = {
    "initialize": mcp.handle_initialize,
    "tools/list": mcp.handle_tools_list,
    "tools/call": mcp.handle_tools_call,
    "tools/cancel": mcp.handle_tools_cancel,
}


@app.post("/mcp")
async def mcp_entrypoint(request: Request):
    try:
        envelope: Dict[str, Any] = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON body")

    method = envelope.get("method")
    handler = METHOD_TABLE.get(method)
    if not handler:
        # Unknown method – return JSON‑RPC error, but HTTP 200 (per spec)
        return JSONResponse(
            {
                "jsonrpc": "2.0",
                "id": envelope.get("id"),
                "error": {"code": -32601, "message": f"Unknown method: {method}"},
            },
            status_code=200,
        )

    try:
        if asyncio.iscoroutinefunction(handler):
            return await handler(envelope)
        return handler(envelope)
    except httpx.HTTPError as exc:
        logger.exception("Backend error: %s", exc)
        return JSONResponse(
            mcp._make_response(
                id_=envelope.get("id"),
                error={"code": -32002, "message": "Backend unavailable"},
            ),
            status_code=200,
        )
    except Exception as exc:
        logger.exception("Internal error: %s", exc)
        raise HTTPException(status_code=500, detail="Internal server error")

###############################################################################
# ── Health‑check ──────────────────────────────────────────────────────────── #
###############################################################################

@app.get("/health")
async def health():
    """Simple liveness endpoint and config echo (non‑sensitive)."""
    return {
        "status": "healthy",
        "backend": settings.backend_url,
        "model": settings.model_name,
        "port": settings.default_port,
    }

###############################################################################
# ── CLI entry‑point ───────────────────────────────────────────────────────── #
###############################################################################

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start DevOps AI Assistant MCP Server")
    parser.add_argument("--host", default="0.0.0.0", help="Bind address")
    parser.add_argument("--port", type=int, default=settings.default_port, help="Port to listen on")
    parser.add_argument("--workers", type=int, default=1, help="Number of Uvicorn worker processes")
    args = parser.parse_args()

    uvicorn.run(
        "mcp_server_standard:app",
        host=args.host,
        port=args.port,
        workers=args.workers,
        log_level="info",
    )
