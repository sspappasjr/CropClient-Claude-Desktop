# Karen Install & Test Plan
Date: 3.5.2026

## What
Install and verify KarenKey (Anthropic API key) in the AI engine.

## Steps
1. Get KarenKey from console.anthropic.com → API Keys → Create Key
2. Paste KarenKey into ai-engine.js → aiEngineURL → karen.apiKey
3. Sync same KarenKey into Client-AI-Component.js → aiEngineURL → karen.apiKey
4. Test with curl ping (below)

## Test Ping (proven 3.5.2026)
```bash
curl -s -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: KarenKey" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":50,"messages":[{"role":"user","content":"Say hello in one word"}]}'
```

## Expected Response
```json
{"model":"claude-sonnet-4-20250514","content":[{"type":"text","text":"Hello!"}],"stop_reason":"end_turn"}
```

## Result
- Karen responded "Hello!" — key is live and verified.
- Model: claude-sonnet-4-20250514
- Files updated: ai-engine.js (line 29), Client-AI-Component.js (line 98)
