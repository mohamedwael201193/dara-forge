import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { ethers } from "ethers";

export default async function handler(req: any, res: any) {
  const { action } = req.query;

  if (action === "health") {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.OG_EVM_RPC!);
      const wallet = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
      const broker = await createZGComputeNetworkBroker(wallet as any);

      const listFn = (broker as any).inference?.listService?.bind((broker as any).inference)
        ?? (broker as any).listService?.bind(broker);
      const services = listFn ? await listFn() : [];

      res.status(200).json({ ok: true, servicesCount: services?.length ?? 0 });
    } catch (err: any) {
      console.error("Health check failed:", err);
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  } else if (action === "chat") {
    try {
      const { prompt } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });

      const provider = new ethers.JsonRpcProvider(process.env.OG_EVM_RPC!);
      const wallet = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
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