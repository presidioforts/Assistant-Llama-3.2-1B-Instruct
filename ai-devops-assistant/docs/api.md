# DevOps AI Assistant - API Documentation

## Base URL

Development: `http://localhost:8000`
Production: `https://your-domain.com/api`

## Authentication

Currently, the API does not require authentication. This can be extended in future versions.

## Endpoints

### Health Check

Check if the backend service and AI model are ready.

**Endpoint**: `GET /v1/health`

**Request**: None

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Codes**:
- `200 OK`: Service is healthy and model is loaded
- `503 Service Unavailable`: Service is unhealthy or model not loaded

**Response (Unhealthy)**:
```json
{
  "status": "unhealthy",
  "error": "Model not loaded"
}
```

---

### Chat Completions

Send messages to the AI assistant and receive responses.

**Endpoint**: `POST /v1/chat/completions`

**Request Headers**:

Content-Type: application/json

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How do I fix this CI error?"
    }
  ]
}
```

**Request Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Array of message objects |
| `messages[].role` | String | Yes | Role of the message sender (`"user"` or `"assistant"`) |
| `messages[].content` | String | Yes | Content of the message |

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Here's how you can fix the CI error:\n\n1. Check your build logs for specific error messages\n2. Verify your dependencies are correctly specified\n3. Ensure your test environment matches your production environment\n\nCould you share the specific error message you're seeing?"
      }
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Successful response
- `400 Bad Request`: Invalid request format or missing required fields
- `500 Internal Server Error`: Server error during processing
- `503 Service Unavailable`: AI model not available

**Error Response Examples**:

**400 Bad Request**:
```json
{
  "error": "Missing 'messages' in request body"
}
```

**503 Service Unavailable**:
```json
{
  "error": "Model not loaded"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

## Message Format

The API uses a conversation format where each message has a role and content:

### Message Roles

- `"user"`: Messages from the human user
- `"assistant"`: Messages from the AI assistant

### Example Conversation

**Request**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is Kubernetes?"
    },
    {
      "role": "assistant", 
      "content": "Kubernetes is a container orchestration platform..."
    },
    {
      "role": "user",
      "content": "How do I create a deployment manifest?"
    }
  ]
}
```

This maintains conversation context across multiple exchanges.

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing:

- Per-IP rate limiting
- User-based quotas
- Request size limits

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error description",
  "details": "Additional error details (optional)"
}
```

## Client Implementation Examples

### JavaScript (Axios)

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Health check
async function checkHealth() {
  try {
    const response = await apiClient.get('/v1/health');
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
}

// Send chat message
async function sendMessage(messages) {
  try {
    const response = await apiClient.post('/v1/chat/completions', {
      messages: messages
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'API request failed');
  }
}

// Example usage
async function example() {
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.error('API is not healthy');
    return;
  }

  const messages = [
    { role: 'user', content: 'How do I deploy to Kubernetes?' }
  ];

  try {
    const response = await sendMessage(messages);
    console.log('AI Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Python (Requests)

```python
import requests

class DevOpsAssistantClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def check_health(self):
        try:
            response = requests.get(f"{self.base_url}/v1/health")
            return response.json().get("status") == "healthy"
        except:
            return False
    
    def send_message(self, messages):
        try:
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                json={"messages": messages},
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {e}")

# Example usage
client = DevOpsAssistantClient()

if client.check_health():
    messages = [
        {"role": "user", "content": "How do I set up a CI/CD pipeline?"}
    ]
    response = client.send_message(messages)
    print("AI Response:", response)
else:
    print("API is not healthy")
```

### cURL Examples

**Health Check**:
```bash
curl -X GET http://localhost:8000/v1/health
```

**Chat Completion**:
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do I set up a CI/CD pipeline with Jenkins?"
      }
    ]
  }'
```

## Configuration

### Environment Variables

The API behavior can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host address |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Enable debug mode |
| `MODEL_NAME` | `meta-llama/Llama-3.2-1B-Instruct` | Hugging Face model name |
| `MAX_NEW_TOKENS` | `512` | Maximum tokens to generate |
| `TEMPERATURE` | `0.7` | Generation temperature (0.0-2.0) |
| `MAX_INPUT_LENGTH` | `2048` | Maximum input token length |

## Best Practices

### Request Optimization
- Keep conversation history reasonable (last 10-20 exchanges)
- Use clear, specific questions for better responses
- Include relevant context in your messages

### Error Handling
- Always check API health before making requests
- Implement retry logic for transient failures
- Handle timeout scenarios gracefully

### Performance
- Reuse HTTP connections when possible
- Cache health check results for short periods
- Consider request queuing for high-volume applications

## OpenAPI Specification

Future versions will include a complete OpenAPI (Swagger) specification for automatic client generation and interactive documentation.

## Versioning

The API uses version prefixes (`/v1/`) to maintain backward compatibility. Future versions will be released as `/v2/`, etc.

## Support

For issues and questions:
- Check the main README.md for setup instructions
- Review the architecture documentation for system details
- Submit issues on the project repository