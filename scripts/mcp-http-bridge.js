#!/usr/bin/env node
/**
 * MCP HTTP Bridge for rednote-mcp
 * Bridges stdio MCP server to HTTP endpoint
 */

const http = require('http');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const PORT = process.env.MCP_PORT || 18060;
const MCP_COMMAND = 'rednote-mcp';
const MCP_ARGS = [];

// Store active MCP processes
const mcpProcesses = new Map();
let processId = 0;

class MCPBridge {
  constructor() {
    this.mcp = null;
    this.buffer = '';
    this.ready = false;
    this.pendingRequests = new Map();
  }

  start() {
    return new Promise((resolve, reject) => {
      console.log(`[MCP Bridge] Starting ${MCP_COMMAND}...`);
      
      this.mcp = spawn(MCP_COMMAND, MCP_ARGS, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.mcp.stdout.on('data', (data) => {
        const chunk = data.toString();
        this.buffer += chunk;
        
        // Try to parse complete JSON-RPC messages
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const msg = JSON.parse(line);
              if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
                const { resolve: res } = this.pendingRequests.get(msg.id);
                this.pendingRequests.delete(msg.id);
                res(msg);
              }
            } catch (e) {
              // Not a complete JSON message
            }
          }
        }
      });

      this.mcp.stderr.on('data', (data) => {
        console.error(`[MCP stderr] ${data.toString()}`);
      });

      this.mcp.on('error', (err) => {
        console.error(`[MCP Error] ${err.message}`);
        reject(err);
      });

      this.mcp.on('exit', (code) => {
        console.log(`[MCP Exit] Code: ${code}`);
        this.ready = false;
      });

      // Send initialize request
      const initMsg = {
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'mcp-http-bridge', version: '1.0.0' }
        }
      };

      this.mcp.stdin.write(JSON.stringify(initMsg) + '\n');
      
      // Set timeout for initialization
      setTimeout(() => {
        this.ready = true;
        console.log('[MCP Bridge] Ready!');
        resolve();
      }, 2000);
    });
  }

  callTool(toolName, args) {
    return new Promise((resolve, reject) => {
      if (!this.ready || !this.mcp) {
        return reject(new Error('MCP not ready'));
      }

      const id = ++processId;
      const msg = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Tool call timeout'));
      }, 60000);

      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this.mcp.stdin.write(JSON.stringify(msg) + '\n');
    });
  }
}

// Global bridge instance
let bridge = null;

async function getBridge() {
  if (!bridge) {
    bridge = new MCPBridge();
    await bridge.start();
  }
  return bridge;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/mcp') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      console.log(`[MCP Request] ${request.method}`);

      const mcpBridge = await getBridge();

      // Handle tools/call
      if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        const result = await mcpBridge.callTool(name, args);
        
        // Format as SSE response (matching expected format)
        const sseResponse = `event: message\ndata: ${JSON.stringify(result)}\n\n`;
        
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        res.write(sseResponse);
        res.end();
        return;
      }

      // Handle tools/list
      if (request.method === 'tools/list') {
        // For now, return available tools from rednote-mcp
        const tools = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: [
              {
                name: 'publish_content',
                description: 'Publish content to Xiaohongshu',
                inputSchema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    tags: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['title', 'content']
                }
              },
              {
                name: 'search_notes',
                description: 'Search Xiaohongshu notes',
                inputSchema: {
                  type: 'object',
                  properties: {
                    keywords: { type: 'string' },
                    limit: { type: 'number' }
                  }
                }
              }
            ]
          }
        };
        res.writeHead(200);
        res.end(JSON.stringify(tools));
        return;
      }

      // Default: forward to MCP
      const result = await mcpBridge.callTool(request.params?.name, request.params?.arguments);
      res.writeHead(200);
      res.end(JSON.stringify(result));

    } catch (err) {
      console.error(`[HTTP Error] ${err.message}`);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌉 MCP HTTP Bridge listening on http://127.0.0.1:${PORT}/mcp`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (bridge?.mcp) {
    bridge.mcp.kill();
  }
  server.close(() => {
    process.exit(0);
  });
});
