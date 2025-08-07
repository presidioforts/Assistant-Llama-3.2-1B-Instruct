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

# 🌍 Universal Markdown Showcase

> **Purpose**  
> Stress-test *every* part of your renderer in one go.  
> — *DevOps AI Assistant*

---

## 1. Basic Text Styles

- **Bold**  
- *Italic*  
- ***Bold & Italic***  
- ~~Strikethrough~~  
- <u>Underline (HTML-only)</u>  
- <kbd>Ctrl</kbd>+<kbd>C</kbd> inline `code`

### Emoji & Escapes

| 😀 | 🤖 | 🇮🇳 | &#128176; |
|---|---|---|---|

---

## 2. Lists

### 2.1 Unordered

* Bullet
  * Nested
    * Deep nest

### 2.2 Ordered

1. First
   1. Child
      1. Grand-child
2. Second

### 2.3 Task List

- [x] Sample checked
- [ ] Sample unchecked
- [ ] ~~Deprecated task~~

---

## 3. Links & Images

Inline link: [OpenAI](https://openai.com)  
Reference link: [DevDocs][devdocs]  

![Placeholder Image](https://via.placeholder.com/150 "Alt Text")

[devdocs]: https://devdocs.io

---

## 4. Tables

| SKU | Description              | Qty | Price |
|-----|--------------------------|----:|------:|
| 001 | **Premium** Plan         |  10 | $9.99 |
| 002 | _Basic_ Plan <br>*(SALE)*|   5 | ~~$4.99~~ **$2.99** |

> <sup>Table footnote: prices in USD.</sup>

---

## 5. Blockquotes

> A single-level quote
>
>> A nested quote  
>> containing **bold** and `code`

---

## 6. Code Fences

```bash
# Shell (bash)
curl https://api.example.com/v1/products
```

```json
{
  "id": 123,
  "name": "Sample",
  "inStock": true
}
```

```python
def hello(name: str) -> str:
    return f"Hello, {name}!"
```

```javascript
export const sum = (a, b) => a + b;
```

```yaml
services:
  web:
    image: nginx:1.27
    ports: ["80:80"]
```

```dockerfile
FROM python:3.11-slim
COPY . /app
CMD ["python", "main.py"]
```

```diff
- old line
+ new line
```

---

## 7. Diagrams & Math

```mermaid
flowchart LR
    A[User] -->|Clicks| B(UI)
    B --> C{Render}
    C -->|OK| D[Done]
```

Inline math: $E = mc^2$  
Block math:

```math
\int_{0}^{\pi} \sin(x)\,dx = 2
```

---

## 8. HTML Blocks (optional support)

<details>
  <summary>Click to reveal hidden text</summary>
  <p>Surprise! 🎉</p>
</details>

---

## 9. Footnotes & Citations

Here is a fact that needs a footnote.[^1]

[^1]: Footnote **definition** with *markdown* inside.

---

## 10. Horizontal Rules & Breaks

Rule above  
---  
Hard&nbsp;break  
Next&nbsp;line

---

## 11. Mixed Heading Levels

### H3
#### H4
##### H5
###### H6

---

## 12. Callouts (GitHub-style)

> [!NOTE]  
> This is a **note** callout.

> [!TIP]  
> Tips can include `code`.

> [!WARNING]  
> **Warnings** grab attention.

---

## 13. Custom Containers (Pandoc/GFM)

:::info
This is an *informational* container.
:::

:::danger
Handle **with care**!
:::

---

## 14. International Text

- English: Hello, world!
- Español: ¡Hola, mundo!
- 中文: 你好，世界！
- العربية: مرحبًا بالعالم
- தமிழ்: வணக்கம், உலகம்!

---

## 15. End-to-End Checklist ✅

1. Rendering completes with no crashes.
2. All elements styled reasonably.
3. Scroll performance remains smooth.
4. Clipboard copy preserves raw markdown.

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


# 🌍 Universal Markdown Showcase

> **Purpose**  
> Stress-test *every* part of your renderer in one go.  
> — *DevOps AI Assistant*

---

## 1. Basic Text Styles

- **Bold**  
- *Italic*  
- ***Bold & Italic***  
- ~~Strikethrough~~  
- <u>Underline (HTML-only)</u>  
- <kbd>Ctrl</kbd>+<kbd>C</kbd> inline `code`

### Emoji & Escapes

| 😀 | 🤖 | 🇮🇳 | &#128176; |
|---|---|---|---|

---

## 2. Lists

### 2.1 Unordered

* Bullet
  * Nested
    * Deep nest

### 2.2 Ordered

1. First
   1. Child
      1. Grand-child
2. Second

### 2.3 Task List

- [x] Sample checked
- [ ] Sample unchecked
- [ ] ~~Deprecated task~~

---

## 3. Links & Images

Inline link: [OpenAI](https://openai.com)  
Reference link: [DevDocs][devdocs]  

![Placeholder Image](https://via.placeholder.com/150 "Alt Text")

[devdocs]: https://devdocs.io

---

## 4. Tables

| SKU | Description              | Qty | Price |
|-----|--------------------------|----:|------:|
| 001 | **Premium** Plan         |  10 | $9.99 |
| 002 | _Basic_ Plan <br>*(SALE)*|   5 | ~~$4.99~~ **$2.99** |

> <sup>Table footnote: prices in USD.</sup>

---

## 5. Blockquotes

> A single-level quote
>
>> A nested quote  
>> containing **bold** and `code`

---

## 6. Code Fences

```bash
# Shell (bash)
curl https://api.example.com/v1/products
```

```json
{
  "id": 123,
  "name": "Sample",
  "inStock": true
}
```

```python
def hello(name: str) -> str:
    return f"Hello, {name}!"
```

```javascript
export const sum = (a, b) => a + b;
```

```yaml
services:
  web:
    image: nginx:1.27
    ports: ["80:80"]
```

```dockerfile
FROM python:3.11-slim
COPY . /app
CMD ["python", "main.py"]
```

```diff
- old line
+ new line
```

---

## 7. Diagrams & Math

```mermaid
flowchart LR
    A[User] -->|Clicks| B(UI)
    B --> C{Render}
    C -->|OK| D[Done]
```

Inline math: $E = mc^2$  
Block math:

```math
\int_{0}^{\pi} \sin(x)\,dx = 2
```

---

## 8. HTML Blocks (optional support)

<details>
  <summary>Click to reveal hidden text</summary>
  <p>Surprise! 🎉</p>
</details>

---

## 9. Footnotes & Citations

Here is a fact that needs a footnote.[^1]

[^1]: Footnote **definition** with *markdown* inside.

---

## 10. Horizontal Rules & Breaks

Rule above  
---  
Hard&nbsp;break  
Next&nbsp;line

---

## 11. Mixed Heading Levels

### H3
#### H4
##### H5
###### H6

---

## 12. Callouts (GitHub-style)

> [!NOTE]  
> This is a **note** callout.

> [!TIP]  
> Tips can include `code`.

> [!WARNING]  
> **Warnings** grab attention.

---

## 13. Custom Containers (Pandoc/GFM)

:::info
This is an *informational* container.
:::

:::danger
Handle **with care**!
:::

---

## 14. International Text

- English: Hello, world!
- Español: ¡Hola, mundo!
- 中文: 你好，世界！

---

## 15. End-to-End Checklist ✅

1. Rendering completes with no crashes.
2. All elements styled reasonably.
3. Scroll performance remains smooth.
4. Clipboard copy preserves raw markdown.

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
        level = data.get('level')
        if level == 'extended':
            return EXTENDED_MD
        if level == 'mock':
            return MOCK_MD
        return BASIC_MD
    # If OpenAI-style payload with messages list
    if isinstance(data, dict) and 'messages' in data:
        last_user = next((m for m in reversed(data['messages']) if m.get('role')=='user'), None)
        if last_user and isinstance(last_user.get('content'), str):
            text = last_user['content'].lower()
            if any(word in text for word in ('extended', 'full')):
                return EXTENDED_MD
            if any(word in text for word in ('mock', 'showcase', 'universal')):
                return MOCK_MD
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