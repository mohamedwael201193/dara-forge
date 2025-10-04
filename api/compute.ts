import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { getZgComputeBroker } from "../src/server/compute/broker.js";

// In-memory store for request results
const store: Record<string, any> = 
  (globalThis as any).__OGC_STORE__ || ((globalThis as any).__OGC_STORE__ = {});

/**
 * Utility function for error responses
 */
function bad(res: VercelResponse, code: number, msg: string) {
  return res.status(code).json({ ok: false, error: msg });
}

/**
 * Official 0G Compute API
 * 
 * Supports the following actions:
 * - GET /api/compute?action=health - Get broker health status
 * - GET /api/compute?action=diagnostics - Get detailed diagnostics
 * - POST /api/compute?action=topup - Add credits to account
 * - POST /api/compute?action=analyze - Run AI analysis
 * - GET /api/compute?action=result&id=<jobId> - Get analysis result
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || "health");
    console.log(`[Compute API] ${req.method} request with action: ${action}`);

    // GET requests
    if (req.method === "GET") {
      const broker = getZgComputeBroker();
      
      switch (action) {
        case "health": {
          try {
            const health = await broker.getHealthStatus();
            return res.status(200).json(health);
          } catch (error) {
            return res.status(500).json({
              status: 'error',
              error: error instanceof Error ? error.message : 'Health check failed'
            });
          }
        }

        case "diagnostics": {
          try {
            const diagnostics = await broker.getDiagnostics();
            return res.status(200).json(diagnostics);
          } catch (error) {
            return res.status(500).json({
              status: 'error',
              error: error instanceof Error ? error.message : 'Diagnostics failed'
            });
          }
        }

        case "result": {
          const id = String(req.query.id || "");
          if (!id) return bad(res, 400, "Missing job id");
          
          const data = store[id];
          if (!data) return bad(res, 404, "Job result not found");
          
          return res.status(200).json({ ok: true, ...data });
        }

        default:
          return bad(res, 400, `Unknown GET action: ${action}`);
      }
    }

    // POST requests
    if (req.method === "POST") {
      const broker = getZgComputeBroker();
      
      switch (action) {
        case "topup": {
          const { amount } = req.body || {};
          if (!amount) return bad(res, 400, "Missing amount parameter");
          
          try {
            const txHash = await broker.addCredit(String(amount));
            const account = await broker.getAccount();
            
            return res.status(200).json({
              ok: true,
              txHash,
              account,
              message: `Added ${amount} OG credits`
            });
          } catch (error) {
            return res.status(500).json({
              ok: false,
              error: error instanceof Error ? error.message : 'Topup failed'
            });
          }
        }

        case "analyze": {
          const { text, root, model = "deepseek" } = req.body || {};
          
          if (!text && !root) {
            return bad(res, 400, "Provide text and/or root parameter");
          }
          
          try {
            // Get available services
            const services = await broker.listServices();
            
            if (services.length === 0) {
              return bad(res, 503, "No compute services available");
            }
            
            // Find service by model preference
            const preferredService = services.find((s: any) => 
              s.name.toLowerCase().includes(String(model).toLowerCase())
            ) || services[0];
            
            console.log(`[Compute API] Using service: ${preferredService.name}`);
            
            // Prepare content for analysis
            const content = [
              root ? `Dataset Merkle Root: ${root}` : null,
              text || null
            ].filter(Boolean).join("\n\n");
            
            // Create analysis request
            const response = await broker.createRequest(preferredService.name, content);
            
            // Extract result from response
            let answer: string;
            let usage: any = null;
            
            if (typeof response === 'string') {
              answer = response;
            } else if (response?.choices?.[0]?.message?.content) {
              answer = response.choices[0].message.content;
              usage = response.usage;
            } else if (response?.text) {
              answer = response.text;
            } else {
              answer = JSON.stringify(response);
            }
            
            // Store result
            const jobId = randomUUID();
            store[jobId] = {
              ok: true,
              model: preferredService.name,
              provider: preferredService.provider,
              root: root || null,
              verified: true, // 0G SDK handles verification
              content: answer,
              usage,
              timestamp: new Date().toISOString()
            };
            
            return res.status(200).json({
              ok: true,
              jobId,
              service: preferredService.name,
              provider: preferredService.provider
            });
            
          } catch (error) {
            console.error("[Compute API] Analysis error:", error);
            return res.status(500).json({
              ok: false,
              error: error instanceof Error ? error.message : 'Analysis failed'
            });
          }
        }

        default:
          return bad(res, 400, `Unknown POST action: ${action}`);
      }
    }

    // Method not allowed
    res.setHeader("Allow", "GET, POST");
    return bad(res, 405, "Method Not Allowed");

  } catch (error) {
    console.error("[Compute API] Unexpected error:", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}