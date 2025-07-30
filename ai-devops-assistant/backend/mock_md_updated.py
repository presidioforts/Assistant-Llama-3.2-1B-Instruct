from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import pathlib
import logging
import json  # enable writing feedback payloads to disk

app = Flask(__name__)
CORS(app)
logger = app.logger

# ------------------------------------------------------------------
# RICH MOCK MARKDOWN PAYLOAD (updated)
# ------------------------------------------------------------------
MOCK_MD = """# Mock Markdown Test Suite

This single answer exercises **nearly every common GitHub‑Flavored Markdown feature** so your UI can render them all in one shot.

---

## 1 . Headings, emphasis & inline items

### H3 *italic* **bold** ***bold‑italic*** ~~strike~~ ==highlight==
Inline `code`, superscript x^2^, subscript H~2~O, emoji :rocket:, and math $E = mc^2$.

> Blockquote with  
> **bold text** inside.

---

## 2 . Lists

1. Ordered list item
2. Another item  
   1. Nested sub‑item  
   2. Second sub‑item

- Unordered item
  - Nested bullet
    - Deeper

- [x] Task done
- [ ] Task open

---

## 3 . Links & images

[Inline link](https://example.com) and autolink <https://example.org>.

![Alt text](https://via.placeholder.com/150 "demo image")

---

## 4 . Code fences (3 languages + diff)

```yaml
version: "3.8"
services:
  web:
    build: .
    ports: ["8080:8080"]
```

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
CMD ["python","main.py"]
```

```python
def hello() -> str:
    return "hello, world"
```

```diff
- print("old")
+ print("new")
```

---

## 5 . Mermaid diagrams (flowchart + sequence)

```mermaid
graph TD
    A[Commit] -->|CI| B(Build)
    B --> C(Docker Push)
    C --> D(Deploy)
```

```mermaid
sequenceDiagram
  participant Dev
  participant CI
  Dev->>CI: push code
  CI-->>Dev: status
```

---

## 6 . Tables

| Env  | URL                 | Replicas | Notes       |
|:---- |:------------------- | --------:| ----------- |
| dev  | dev.example.com     |        1 | Auto‑reload |
| stage| stage.example.com   |        2 | QA only     |
| prod | example.com         |        4 | 24×7        |

---

## 7 . Collapsible details & raw HTML

<details>
<summary>Click to expand raw HTML</summary>
<p><strong>Surprise!</strong> Your renderer must allow&nbsp;<code>&lt;details&gt;</code>.</p>
</details>

---

## 8 . Footnote & definition list

Here’s a statement that needs a footnote.[^1]

Term
: Definition list entry

[^1]: Footnote text appears at the bottom.
"""

# ------------------------------------------------------------------
# BASIC & EXTENDED PAYLOADS (unchanged)
# ------------------------------------------------------------------
BASIC_MD = """### Basic Markdown Example

Here's a **basic** response with three code blocks.

```yaml
a: 1
b: 2
```

```dockerfile
FROM alpine:3.19
CMD ["echo","hello"]
```

```python
print('basic example')
```

| Lang | File |
|------|------|
| YAML | docker-compose.yml |
| Docker | Dockerfile |
| Python | app.py |
"""

comprehensive_path = pathlib.Path(__file__).parent / 'comprehensive_test_prompt.md'
if comprehensive_path.exists():
    EXTENDED_MD = comprehensive_path.read_text(encoding='utf-8')
else:
    EXTENDED_MD = MOCK_MD

# ------------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------------
@app.route('/v1/health')
def health():
    return jsonify(status='healthy', provider='mock-md')

def choose_content(data):
    # If direct level param present
    if isinstance(data, dict) and 'level' in data:
        return EXTENDED_MD if data.get('level') == 'extended' else BASIC_MD
    # If OpenAI-style payload with messages list
    if isinstance(data, dict) and 'messages' in data:
        last_user = next((m for m in reversed(data['messages']) if m.get('role')=='user'), None)
        if last_user and isinstance(last_user.get('content'), str):
            text = last_user['content'].lower()
            if 'extended' in text or 'full' in text:
                return EXTENDED_MD
        return BASIC_MD
    # default
    return BASIC_MD

@app.route('/v1/chat/completions', methods=['POST'])
@app.route('/troubleshoot', methods=['POST'])
def completions():
    data = request.get_json(force=True)
    content = choose_content(data)
    return jsonify({
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content
                }
            }
        ],
        "timestamp": datetime.datetime.utcnow().isoformat() + 'Z'
    })

@app.route('/v1/feedback', methods=['POST'])
def feedback():
    data = request.get_json(force=True)
    logger.info("[FEEDBACK] %s", data)
    # Persist feedback to a JSONL file (one JSON object per line)
    try:
        with open('mock_feedback.jsonl', 'a', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False) + '\n')
    except Exception as e:
        logger.error('Failed to write feedback to mock_feedback.jsonl: %s', e)
    return jsonify({'status':'logged'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)