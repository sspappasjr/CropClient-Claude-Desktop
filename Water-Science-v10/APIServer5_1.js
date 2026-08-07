/**
 * APIServer5.1.js — CropManage MCP Server
 * Base: APIServer5.0.js, with the inline CropManage API block replaced by
 * the api-water-science.js injection (same tokens, proven offline/CORS-
 * tested in the browser first) — see @@@@ API_COMPONENT INJECTION POINT.
 * Run: npm install && node APIServer5.1.js | Port: 3101
 *
 * irrigation-component.js is injected below (reset_table, read_meter,
 * create_next_irrigation, update_record) — extracted from
 * mybestdemo/CropClient-Dashboard.html (1.5), not rewritten. Self-seeds
 * irrigation/irrigation_snapshot tables from the same 26 hardcoded records
 * on first call. Everything else in this file — CropManage and JSON-file
 * tools — is unchanged from the uploaded APIServer3.4.1.js.
 */

const readline = require('readline');
const express = require('express');
const cors = require('cors');

class MCPServer {
    constructor() {
        this.tools = new Map();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }

    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }

    async handleRequest(request) {
        const { id, method, params } = request;

        try {
            switch (method) {
                case 'initialize':
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            protocolVersion: '2024-11-05',
                            serverInfo: {
                                name: 'cropclient-api-mcp-server',
                                version: '5.0'
                            },
                            capabilities: {
                                tools: {}
                            }
                        }
                    };

                case 'tools/list':
                    const toolsList = Array.from(this.tools.values()).map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    }));
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: { tools: toolsList }
                    };

                case 'tools/call':
                    const toolName = params.name;
                    const tool = this.tools.get(toolName);

                    if (!tool) {
                        throw new Error(`Tool not found: ${toolName}`);
                    }

                    const result = await tool.handler(params.arguments || {});

                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2)
                                }
                            ]
                        }
                    };

                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    start() {
        this.rl.on('line', async (line) => {
            if (!line.trim()) return;

            try {
                const request = JSON.parse(line);
                const response = await this.handleRequest(request);
                console.log(JSON.stringify(response));
            } catch (error) {
                console.log(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: 'Parse error: ' + error.message
                    }
                }));
            }
        });

        process.stderr.write('APIServer5.1 started - stdio mode\n');
    }
}

// Create server instance
const server = new MCPServer();

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// Src: ./api-water-science.js — same tokens proven in the browser
// (offline/CORS-tested), same TOKEN_SCRIPTS table, requireable.
// ========================================

const apiWaterTools = require('./api-water-science.js')();
apiWaterTools.forEach(tool => server.registerTool(tool));


// ========================================
// @@@@ MCP TOOLS: JSON FILE SERVICES v1.2 @@@@
// ========================================

const jsonFileTools = [
  {
    name: "json_write",
    description: "Write a JSON file on the MCP server.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" }, data: {} },
      required: ["filepath", "data"]
    },
    handler: async (args) => {
      const result = await writeJSON(args.filepath, args.data);
      return { success: true, message: `Wrote ${args.filepath}`, ...result };
    }
  },
  {
    name: "json_read",
    description: "Read a JSON file from the MCP server.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const exists = await fileExists(args.filepath);
      if (!exists) return { success: false, filepath: args.filepath, fileNotFound: true, message: "File not found" };
      const data = await readJSON(args.filepath);
      return { success: true, filepath: args.filepath, data };
    }
  },
  {
    name: "json_update",
    description: "Update a JSON file by shallow-merging.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" }, updates: {} },
      required: ["filepath", "updates"]
    },
    handler: async (args) => {
      await updateJSON(args.filepath, args.updates);
      return { success: true, message: `Updated ${args.filepath}` };
    }
  },
  {
    name: "json_delete",
    description: "Delete a JSON file.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const result = await deleteJSON(args.filepath);
      return { success: true, ...result };
    }
  },
  {
    name: "json_list",
    description: "List JSON files in a directory.",
    inputSchema: {
      type: "object",
      properties: { directory: { type: "string", default: "." } },
      required: []
    },
    handler: async (args) => {
      const dir = args.directory || ".";
      const files = await listJSONFiles(dir);
      return { success: true, directory: dir, files };
    }
  },
  {
    name: "json_exists",
    description: "Check whether a JSON file exists.",
    inputSchema: {
      type: "object",
      properties: { filepath: { type: "string" } },
      required: ["filepath"]
    },
    handler: async (args) => {
      const exists = await fileExists(args.filepath);
      return { success: true, filepath: args.filepath, exists };
    }
  },
  {
    name: "data_operation",
    description: "Generic JSON table operation using {action, table, data}.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "read | write | update | delete" },
        table: { type: "string" },
        data: {}
      },
      required: ["action", "table"]
    },
    handler: async (args) => await handleDataOperation(args.action, args.table, args.data)
  }
];

// Register all tools
jsonFileTools.forEach(tool => server.registerTool(tool));

// ========================================
// @@@@ IRRIGATION_COMPONENT INJECTION POINT @@@@
// Source: ./MCP-Water-Tools.js — in-memory rebuild of irrigation-component.js.
// No handleDataOperation dependency — these four tokens own their own in-memory
// record list and never touch disk. irrigation-component.js is retired, not deleted.
// ========================================
const irrigationTools = require('./MCP-Water-Tools.js')();
irrigationTools.forEach(tool => server.registerTool(tool));

// ========================================
// HTTP BRIDGE (Express + CORS)
// ========================================

const app = express();
const PORT = process.env.PORT || 3101;

app.use(cors());
app.use(express.json());

// ========================================
// @@@@ JSON FILE SERVICES (SERVER-SIDE) v1.2 @@@@
// ========================================

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_DIR = process.env.CROPCLIENT_DATA_DIR
  ? path.resolve(process.env.CROPCLIENT_DATA_DIR)
  : path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try { await fsp.mkdir(DATA_DIR, { recursive: true }); } catch (_) {}
}

function sanitizeRelPath(p) {
  if (typeof p !== 'string' || !p.trim()) throw new Error("filepath must be a non-empty string");
  const rel = p.replace(/\\/g, '/').replace(/^\/+/, '');
  if (rel.includes('..')) throw new Error("Invalid filepath: '..' is not allowed");
  return rel;
}

function resolveDataPath(relPath) {
  const rel = sanitizeRelPath(relPath);
  const full = path.resolve(DATA_DIR, rel);
  const base = path.resolve(DATA_DIR);
  if (!full.startsWith(base)) throw new Error("Invalid filepath (outside data directory)");
  return full;
}

async function fileExists(relPath) {
  const full = resolveDataPath(relPath);
  try { await fsp.access(full, fs.constants.F_OK); return true; } catch { return false; }
}

async function readJSON(relPath) {
  const full = resolveDataPath(relPath);
  const raw = await fsp.readFile(full, 'utf-8');
  return JSON.parse(raw);
}

async function writeJSON(relPath, data) {
  const full = resolveDataPath(relPath);
  await ensureDataDir();
  const dir = path.dirname(full);
  await fsp.mkdir(dir, { recursive: true });
  const jsonText = JSON.stringify(data, null, 2);
  await fsp.writeFile(full, jsonText, 'utf-8');
  return { filepath: relPath, bytes: Buffer.byteLength(jsonText, 'utf-8') };
}

function shallowMerge(target, updates) {
  if (target && typeof target === 'object' && !Array.isArray(target) &&
      updates && typeof updates === 'object' && !Array.isArray(updates)) {
    return { ...target, ...updates };
  }
  return updates;
}

async function updateJSON(relPath, updates) {
  const exists = await fileExists(relPath);
  if (!exists) throw new Error(`File not found: ${relPath}`);
  const current = await readJSON(relPath);
  const merged = shallowMerge(current, updates);
  await writeJSON(relPath, merged);
  return { filepath: relPath };
}

async function deleteJSON(relPath) {
  const full = resolveDataPath(relPath);
  const exists = await fileExists(relPath);
  if (!exists) return { filepath: relPath, deleted: false };
  await fsp.unlink(full);
  return { filepath: relPath, deleted: true };
}

async function listJSONFiles(relDir = '.') {
  await ensureDataDir();
  const rel = sanitizeRelPath(relDir === '.' ? '' : relDir);
  const fullDir = resolveDataPath(rel || '');
  const entries = await fsp.readdir(fullDir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map(e => (rel ? `${rel}/${e.name}` : e.name));
}

async function handleDataOperation(action, table, data) {
  if (!table || typeof table !== 'string') return { success: false, error: "table is required" };
  const filename = `${table}.json`;
  try {
    if (action === 'read') {
      const exists = await fileExists(filename);
      if (!exists) return { success: false, error: `Table '${table}' not found.`, table, fileNotFound: true };
      const result = await readJSON(filename);
      return { success: true, data: result, table };
    }
    if (action === 'write') {
      await writeJSON(filename, data);
      return { success: true, message: `${filename} written successfully`, table };
    }
    if (action === 'update') {
      const exists = await fileExists(filename);
      if (!exists) return { success: false, error: `Table '${table}' not found.`, table, fileNotFound: true };
      await updateJSON(filename, data);
      return { success: true, message: `${filename} updated successfully`, table };
    }
    if (action === 'delete') {
      const result = await deleteJSON(filename);
      return { success: true, ...result, table };
    }
    return { success: false, error: `Unknown action '${action}'.`, table };
  } catch (error) {
    return { success: false, error: error.message, table };
  }
}

// Health check
app.get('/ping', (req, res) => {
    res.json({
        status: 'alive',
        server: 'CropClient APIServer5.1',
        mode: 'standalone',
        timestamp: new Date().toISOString(),
        tools: apiWaterTools.length + jsonFileTools.length + irrigationTools.length
    });
});

// List tools — include inputSchema so clients (mcp-engine, AI) can validate all tools
app.get('/tools', (req, res) => {
    const toolList = [...apiWaterTools, ...jsonFileTools, ...irrigationTools].map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
    }));
    res.json({ tools: toolList });
});

// Call a tool
app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    try {
        const tool = [...apiWaterTools, ...jsonFileTools, ...irrigationTools].find(t => t.name === toolName);
        if (!tool) return res.status(404).json({ success: false, error: `Tool not found: ${toolName}` });
        const result = await tool.handler(args);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start HTTP server
app.listen(PORT, () => {
    console.log('CropClient APIServer v5.1 — ready');
    console.log(`APIServer5.1 running on port ${PORT}`);
    console.log(`Tools available: ${apiWaterTools.length + jsonFileTools.length + irrigationTools.length}`);
});

// Start stdio MCP server (standalone only)
if (!process.env.IISNODE_VERSION) {
    server.start();
}
