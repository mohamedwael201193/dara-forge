import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { randomUUID } from "crypto";
import { ethers } from "ethers";

// Simple in-memory store for job results (stateless runtime-safe approach)
const store: Record<string, any> = (globalThis as any).__OGC_STORE__ || ((globalThis as any).__OGC_STORE__ = {});

export default async function handler(req: any, res: any) {
  const { action } = req.query;
  console.log('[COMPUTE API] Action:', action, 'Method:', req.method);

  if (action === "health") {
    try {
      const rpcUrl = process.env.OG_RPC_URL || process.env.OG_EVM_RPC || "https://evmrpc-testnet.0g.ai";
      const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY || process.env.OG_PRIVATE_KEY;
      
      if (!privateKey) {
        return res.status(500).json({ ok: false, error: "Missing OG_COMPUTE_PRIVATE_KEY or OG_PRIVATE_KEY" });
      }
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const broker = await createZGComputeNetworkBroker(wallet as any);

      const listFn = (broker as any).inference?.listService?.bind((broker as any).inference)
        ?? (broker as any).listService?.bind(broker);
      const services = listFn ? await listFn() : [];

      res.status(200).json({ ok: true, servicesCount: services?.length ?? 0 });
    } catch (err: any) {
      console.error("Health check failed:", err);
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  } else if (action === "result") {
    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ ok: false, error: "Missing job id" });
    const data = store[id];
    if (!data) return res.status(404).json({ ok: false, error: "Not found" });
    return res.status(200).json({ ok: true, ...data });
  } else if (action === "analyze") {
    try {
      const { text, root, model = "llama-3.3-70b-instruct", temperature = 0.2 } = req.body || {};
      if (!text && !root) return res.status(400).json({ ok: false, error: "Provide text and/or root" });

      const rpcUrl = process.env.OG_RPC_URL || process.env.OG_EVM_RPC || "https://evmrpc-testnet.0g.ai";
      const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY || process.env.OG_PRIVATE_KEY;
      
      if (!privateKey) {
        return res.status(500).json({ ok: false, error: "Missing OG_COMPUTE_PRIVATE_KEY or OG_PRIVATE_KEY" });
      }
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const broker: any = await createZGComputeNetworkBroker(wallet as any);

      const listFn = broker.inference?.listService?.bind(broker.inference) ?? broker.listService?.bind(broker);
      const services = listFn ? await listFn() : [];
      if (!services?.length) return res.status(503).json({ ok: false, error: "No compute services available" });

      // Pick a service that matches the model
      const svc = services.find((s: any) => (s.model || "").toLowerCase().includes(String(model).toLowerCase())) || services[0];
      const providerAddress = svc.provider;
      
      const getMeta = broker.inference?.getServiceMetadata?.bind(broker.inference) ?? broker.getServiceMetadata?.bind(broker);
      const { endpoint, model: providerModel } = await getMeta(providerAddress);

      const ack = broker.inference?.acknowledgeProviderSigner?.bind(broker.inference) ?? broker.acknowledgeProviderSigner?.bind(broker);
      if (ack) await ack(providerAddress);

      const content = {
        messages: [
          { role: "system", content: "You are a research assistant. Produce concise, factual summaries." },
          {
            role: "user",
            content: [
              root ? `Dataset Merkle Root: ${root}` : null,
              "Task: Summarize the dataset or given text.",
              text ? `User text:\n${text}` : null
            ].filter(Boolean).join("\n\n")
          }
        ],
        temperature
      };

      const getHeaders = broker.inference?.getRequestHeaders?.bind(broker.inference) ?? broker.getRequestHeaders?.bind(broker);
      const headers = await getHeaders(providerAddress, content);

      const r = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ model: providerModel, ...content })
      });
      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        return res.status(r.status).json({ ok: false, error: `Provider error: ${errText}` });
      }
      
      const payload: any = await r.json();
      const resultText = payload?.choices?.[0]?.message?.content || payload?.text || JSON.stringify(payload);

      const processResp = broker.inference?.processResponse?.bind(broker.inference) ?? broker.processResponse?.bind(broker);
      let verified = false;
      if (processResp) { 
        try { 
          await processResp(providerAddress, resultText, payload?.id); 
          verified = true;
        } catch {} 
      }

      const jobId = randomUUID();
      store[jobId] = {
        model: providerModel,
        provider: providerAddress,
        root: root || null,
        verified,
        content: resultText,
        usage: payload?.usage || null,
        ts: Date.now()
      };

      return res.status(200).json({ ok: true, jobId });
    } catch (err: any) {
      console.error("Analyze API error:", err);
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  } else if (action === "chat") {
    try {
      const { prompt } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });

      const rpcUrl = process.env.OG_RPC_URL || process.env.OG_EVM_RPC || "https://evmrpc-testnet.0g.ai";
      const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY || process.env.OG_PRIVATE_KEY;
      
      if (!privateKey) {
        return res.status(500).json({ error: "Missing OG_COMPUTE_PRIVATE_KEY or OG_PRIVATE_KEY" });
      }
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const broker: any = await createZGComputeNetworkBroker(wallet as any);

      const listFn = broker.inference?.listService?.bind(broker.inference) ?? broker.listService?.bind(broker);
      const services = listFn ? await listFn() : [];
      if (!services?.length) return res.status(503).json({ error: "No providers available" });

      const providerAddress = process.env.OG_PROVIDER_ADDRESS || services[0].provider;
      const getMeta = broker.inference?.getServiceMetadata?.bind(broker.inference) ?? broker.getServiceMetadata?.bind(broker);
      const { endpoint, model } = await getMeta(providerAddress);

      const ack = broker.inference?.acknowledgeProviderSigner?.bind(broker.inference) ?? broker.acknowledgeProviderSigner?.bind(broker);
      if (ack) await ack(providerAddress);

      const getHeaders = broker.inference?.getRequestHeaders?.bind(broker.inference) ?? broker.getRequestHeaders?.bind(broker);
      const headers = await getHeaders(providerAddress, prompt);

      const r = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] })
      });
      if (!r.ok) throw new Error(`Provider returned ${r.status}: ${await r.text().catch(() => "")}`);

      const data: any = await r.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      const processResp = broker.inference?.processResponse?.bind(broker.inference) ?? broker.processResponse?.bind(broker);
      if (processResp) { try { await processResp(providerAddress, text, data?.id); } catch {} }

      res.status(200).json({ text, raw: data });
    } catch (err: any) {
      console.error("Chat API error:", err);
      res.status(500).json({ error: String(err?.message || err) });
    }
  } else {
    res.status(400).json({ error: "Invalid action. Use ?action=health or ?action=chat" });
  }
}