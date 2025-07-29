from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import pathlib
import logging
import json  # enable writing feedback payloads to disk

app = Flask(__name__)
CORS(app)
logger = app.logger

MOCK_MD = """Below is a **mock** markdown answer containing real code blocks for UI testing.

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "8080:8080"
```

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python","main.py"]
```

```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/")
def root():
    return jsonify(status="ok")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
```

```mermaid
graph TD
    A[Commit] -->|CI| B(Build)
    B --> C(Docker Push)
    C --> D(Deploy)
```

| Environment | URL | Replicas | Notes |
|-------------|-----|----------|-------|
| dev | dev.example.com | 1 | Auto-reload |
| staging | staging.example.com | 2 | QA only |
| prod | example.com | 4 | 24/7 |
"""

BASIC_MD = """### Basic Markdown Example

Here's a **basic** response with three code blocks.

```yaml
a: 1
b: 2
```

```dockerfile
FROM alpine:3.19
CMD [\"echo\",\"hello\"]
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