// ============================================================
// AI-ENGINE v2.1 — Prompt side (talks to Lilly or Karen)
// Updated: 3.5.2026 — Karen (Anthropic) provider support
// ai-engine-url    — the AI endpoint URL. One place, one truth.
// ai-engine-send   — provider-aware (endpoint, headers, system)
// ai-engine-reader — handles both Lilly and Karen response shapes
// ai-engine-router — passes provider through, Karen tool result format
// ============================================================

// @@@ BEGIN ai-engine @@@

// --- ai-engine-url ---
// The AI endpoint URL. One place, one truth.
// Pick your provider: 'lilly' (OpenAI) or 'karen' (Anthropic)
function aiEngineURL(provider) {
    const providers = {
        lilly: {
            name: 'Lilly (OpenAI)',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o',
            apiKey: 'YOUR-OPENAI-KEY-HERE',
            authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
            systemInMessages: true   // OpenAI: system goes inside messages array
        },
        karen: {
            name: 'Karen (Anthropic)',
            endpoint: 'https://api.anthropic.com/v1/messages',
            model: 'claude-sonnet-4-20250514',
            apiKey: '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',
            authHeader: (key) => ({
                'x-api-key': key,
                'anthropic-version': '2023-06-01'
            }),
            systemInMessages: false  // Anthropic: system is a top-level field
        }
    };
    return providers[provider] || providers.lilly;
}


// --- ai-engine-send ---
// Send grower's question + tool list to AI provider
// Provider-aware: handles OpenAI and Anthropic request shapes
async function aiEngineSend(userMessage, conversationHistory, toolDefinitions, apiKey, provider) {
    const url = aiEngineURL(provider);

    const systemPrompt = 'You are a CropManage assistant for growers. ' +
                         'You help with irrigation records and water budgets. ' +
                         'Always call get_token first before any API calls. ' +
                         'Keep answers short — field workers dont have time.';

    let body;

    if (provider === 'karen') {
        // Anthropic: system is top-level, messages exclude system role
        // tool definitions use input_schema (not inputSchema)
        const karenTools = toolDefinitions.map(t => ({
            name: t.function ? t.function.name : t.name,
            description: t.function ? t.function.description : t.description,
            input_schema: t.function ? t.function.parameters : (t.input_schema || t.inputSchema || {})
        }));

        const messages = [...conversationHistory];
        if (userMessage) messages.push({ role: 'user', content: userMessage });

        body = {
            model: url.model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
            tools: karenTools
        };
    } else {
        // OpenAI: system inside messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
        ];
        if (userMessage) messages.push({ role: 'user', content: userMessage });

        body = {
            model: url.model,
            messages: messages,
            tools: toolDefinitions,
            tool_choice: 'auto'
        };
    }

    const response = await fetch(url.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...url.authHeader(apiKey)
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (provider === 'karen') {
        return data;                    // Anthropic returns top-level { content: [...] }
    }
    return data.choices[0].message;    // OpenAI returns choices[0].message
}


// --- ai-engine-reader ---
// Read AI response — answer or tool call?
// Handles both Lilly (OpenAI) and Karen (Anthropic) response shapes
function aiEngineReader(aiMessage, provider) {
    if (provider === 'karen') {
        // Anthropic: content[] with type "tool_use" or type "text"
        const content = aiMessage.content || [];
        const toolUses = content.filter(b => b.type === 'tool_use');

        if (toolUses.length > 0) {
            return {
                type: 'tool_call',
                calls: toolUses.map(t => ({
                    id: t.id,
                    toolName: t.name,
                    params: t.input   // already an object — no JSON.parse needed
                }))
            };
        }

        const textBlock = content.find(b => b.type === 'text');
        return {
            type: 'text',
            content: textBlock ? textBlock.text : ''
        };
    }

    // OpenAI (Lilly): tool_calls[].function.name
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        return {
            type: 'tool_call',
            calls: aiMessage.tool_calls.map(call => ({
                id: call.id,
                toolName: call.function.name,
                params: JSON.parse(call.function.arguments)  // OpenAI sends a string
            }))
        };
    }

    return {
        type: 'text',
        content: aiMessage.content
    };
}


// --- ai-engine-router ---
// Call the right tool via mcp-engine, send result back to AI
// Loops until AI gives a final text answer
// Provider-aware: Karen tool results use a different message format
async function aiEngineRouter(userMessage, toolDefinitions, apiKey, provider, serverTarget) {
    const conversationHistory = [];
    let maxLoops = 10;

    let aiMessage = await aiEngineSend(userMessage, conversationHistory, toolDefinitions, apiKey, provider);

    while (maxLoops > 0) {
        const parsed = aiEngineReader(aiMessage, provider);

        if (parsed.type === 'text') {
            return { answer: parsed.content, history: conversationHistory };
        }

        conversationHistory.push(
            provider === 'karen'
                ? { role: 'assistant', content: aiMessage.content }
                : aiMessage
        );

        for (const call of parsed.calls) {
            const staged = mcpEngineStaging(serverTarget || 'local', call.toolName, call.params);
            const result = await mcpEngineSend(staged);

            if (provider === 'karen') {
                // Anthropic: tool result goes back as a user message with tool_result block
                conversationHistory.push({
                    role: 'user',
                    content: [{
                        type: 'tool_result',
                        tool_use_id: call.id,
                        content: JSON.stringify(result)
                    }]
                });
            } else {
                // OpenAI: tool result is its own role
                conversationHistory.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify(result)
                });
            }
        }

        aiMessage = await aiEngineSend('', conversationHistory, toolDefinitions, apiKey, provider);
        maxLoops--;
    }

    return {
        answer: 'Reached maximum steps. Please try a simpler request.',
        history: conversationHistory
    };
}

// @@@ END ai-engine @@@
