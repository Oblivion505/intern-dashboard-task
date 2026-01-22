# API Server

Express API server running on Bun, providing device and reading management endpoints.

## Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Get All Devices
```bash
curl http://localhost:3001/devices
```

### Get Device Readings
```bash
# Get readings for device ID 1, default limit (20)
curl http://localhost:3001/devices/1/readings

# Get readings with custom limit
curl http://localhost:3001/devices/1/readings?limit=10
```

### Create Reading (Not Implemented - Candidate Task)
```bash
# This endpoint currently returns 501 Not Implemented
# It is part of the candidate's assignment to implement this endpoint
curl -X POST http://localhost:3001/devices/1/readings \
  -H "Content-Type: application/json" \
  -d '{"powerUsageKw": 25.5}'

# Expected behavior after implementation:
# - Validate device exists (404 if not found)
# - Validate body: { powerUsageKw: number >= 0, timestamp?: string }
# - Generate id for new reading
# - Return 201 with saved reading
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "message": "Error message",
    "details": {}
  }
}
```

