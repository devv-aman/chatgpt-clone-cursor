# Chat API Documentation

This document describes the Chat Stream SSE and History API endpoints.

## Overview

The Chat API provides:

- SSE-based streaming chat with OpenAI integration
- User-specific OpenAI API key management (encrypted storage)
- Chat history and session management
- Stream control (start/stop)

## Architecture

```
┌─────────────┐     POST /chat/stream      ┌──────────────┐
│   Frontend  │ ─────────────────────────► │   Backend    │
│             │ ◄───────────────────────── │              │
│             │     SSE: session, content  │              │
└─────────────┘     done, error            └──────┬───────┘
                                                  │
                                                  ▼
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         ▼
              ┌──────────┐                            ┌──────────────┐
              │  Redis   │ ◄──────────────────────►   │   OpenAI     │
              │ (stream  │                            │   API        │
              │ tracking)│                            └──────────────┘
              └──────────┘
                    │
                    ▼
              ┌──────────────┐
              │   Supabase   │
              │ (messages &  │
              │   chats)     │
              └──────────────┘
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Environment Variables

Required environment variables for the chat API:

```env
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=<32-character-encryption-key>
```

---

## Endpoints

### Settings

#### Save OpenAI API Key

Securely stores the user's OpenAI API key (AES-256-GCM encrypted).

```bash
curl -X POST http://localhost:3000/api/v1/settings/openai-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "message": "OpenAI API key saved successfully"
}
```

**Error (400 - Invalid key format):**

```json
{
  "success": false,
  "error": {
    "message": "Invalid OpenAI API key format",
    "code": "SET_6002",
    "statusCode": 400
  }
}
```

#### Check OpenAI API Key Status

```bash
curl -X GET http://localhost:3000/api/v1/settings/openai-key \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "OpenAI API key exists",
  "data": {
    "hasKey": true
  }
}
```

#### Delete OpenAI API Key

```bash
curl -X DELETE http://localhost:3000/api/v1/settings/openai-key \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "OpenAI API key deleted successfully"
}
```

---

### Chat Streaming

#### Start Chat Stream

Initiates an SSE stream for chat completion. Creates a new chat session if `chatId` is not provided.

```bash
curl -X POST http://localhost:3000/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Hello, how are you?",
    "model": "gpt-5.2",
    "chatId": "optional-existing-chat-uuid"
  }'
```

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| message | string | Yes | - | User message to send |
| model | string | No | gpt-5.2 | OpenAI model to use |
| chatId | uuid | No | - | Existing chat session ID |

**SSE Response Events:**

1. **Session Event** (first chunk):

```
data: {"type":"session","chatId":"uuid","streamId":"uuid"}
```

2. **Content Events** (streaming):

```
data: {"type":"content","delta":"Hello"}
data: {"type":"content","delta":"! How"}
data: {"type":"content","delta":" can I help?"}
```

3. **Done Event** (completion):

```
data: {"type":"done","messageId":"uuid"}
```

4. **Error Event** (on failure):

```
data: {"type":"error","message":"OpenAI API error occurred"}
```

**Error (400 - No API Key):**

```json
{
  "success": false,
  "error": {
    "message": "Please set your OpenAI API key first",
    "code": "SET_6001",
    "statusCode": 400
  }
}
```

#### Stop Active Stream

Stops a running stream and its background process. Partial content is saved.

```bash
curl -X POST http://localhost:3000/api/v1/chat/stream/<streamId>/stop \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

**Error (404 - Stream not found):**

```json
{
  "success": false,
  "error": {
    "message": "Stream not found",
    "code": "STR_7001",
    "statusCode": 404
  }
}
```

---

### Chat History

#### List User Chats

```bash
curl -X GET "http://localhost:3000/api/v1/chats?limit=20&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| limit | number | 50 | 100 | Number of chats to return |
| offset | number | 0 | - | Number of chats to skip |

**Response (200):**

```json
{
  "success": true,
  "message": "Chats fetched successfully",
  "data": {
    "chats": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "New Chat",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
      }
    ],
    "total": 15
  }
}
```

#### Get Single Chat

```bash
curl -X GET http://localhost:3000/api/v1/chats/<chatId> \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Chat fetched successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "New Chat",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null
  }
}
```

#### Get Chat Messages

```bash
curl -X GET "http://localhost:3000/api/v1/chats/<chatId>/messages?limit=50&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| limit | number | 50 | 100 | Number of messages to return |
| offset | number | 0 | - | Number of messages to skip |

**Response (200):**

```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "chat_id": "uuid",
        "role": "user",
        "content": "Hello, how are you?",
        "model_id": null,
        "model_name": null,
        "tokens_used": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "deleted_at": null
      },
      {
        "id": "uuid",
        "chat_id": "uuid",
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?",
        "model_id": "gpt-5.2",
        "model_name": "gpt-5.2",
        "tokens_used": null,
        "created_at": "2024-01-01T00:00:01.000Z",
        "updated_at": "2024-01-01T00:00:01.000Z",
        "deleted_at": null
      }
    ],
    "total": 2
  }
}
```

---

## Error Codes

| Code     | Description                   |
| -------- | ----------------------------- |
| SET_6001 | OpenAI API key not set        |
| SET_6002 | Invalid OpenAI API key format |
| STR_7001 | Stream not found              |
| STR_7002 | Stream already stopped        |
| STR_7003 | Stream error                  |

---

## Frontend Integration

### Consuming SSE Stream

```typescript
const startChat = async (message: string, chatId?: string) => {
  const response = await fetch("/api/v1/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, chatId }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let currentChatId: string;
  let currentStreamId: string;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));

        switch (event.type) {
          case "session":
            currentChatId = event.chatId;
            currentStreamId = event.streamId;
            break;
          case "content":
            // Append delta to UI
            appendToMessage(event.delta);
            break;
          case "done":
            // Stream completed
            onComplete(event.messageId);
            break;
          case "error":
            // Handle error
            onError(event.message);
            break;
        }
      }
    }
  }
};
```

### Stopping a Stream

```typescript
const stopStream = async (streamId: string) => {
  await fetch(`/api/v1/chat/stream/${streamId}/stop`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

---

## Background Persistence

The chat API is designed to persist messages even if the frontend disconnects:

1. When streaming starts, a background process is created
2. The process continues streaming from OpenAI regardless of client connection
3. The complete response is saved to the database
4. User can fetch chat history later with `/chats/:chatId/messages`

This ensures no data loss during network interruptions.
