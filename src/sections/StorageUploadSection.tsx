import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOgUpload } from "@/hooks/useOgUpload";
import { cn } from "@/lib/utils";
import React from "react";

function fmtKB(n: number) { return `${(n / 1024).toFixed(2)} KB`; }

export function StorageUploadSection() {
  const { uploadFiles } = useOgUpload();
  const [files, setFiles] = React.useState<File[]>([]);
  const [status, setStatus] = React.useState<"idle" | "preparing" | "registering" | "checking" | "done" | "error">("idle");
  const [root, setRoot] = React.useState<string>("");
  const [gatewayUrl, setGatewayUrl] = React.useState<string>("");
  const [proofUrl, setProofUrl] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    setRoot(""); setGatewayUrl(""); setProofUrl(""); setError(""); setStatus("idle");
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      setFiles(list);
      setRoot(""); setGatewayUrl(""); setProofUrl(""); setError(""); setStatus("idle");
    }
  }

  async function handleUpload() {
    try {
      if (!files.length) return;
      setStatus("preparing");
      // simulate steps for UX; server call is atomic
      setTimeout(() => setStatus("registering"), 300);
      setTimeout(() => setStatus("checking"), 1000);

      const out = await uploadFiles(files);
      if (!out.ok || !out.root) {
        setError(out.error || "Upload failed");
        setStatus("error");
        return;
      }
      setRoot(out.root);
      if (out.gatewayUrl) setGatewayUrl(out.gatewayUrl);
      if (out.proofUrl) setProofUrl(out.proofUrl);
      setStatus("done");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      setStatus("error");
    }
  }

  async function handleAnchor() {
    if (!root) return;
    const body = { rootHash: root, manifestHash: root, projectId: "dara-forge" };
    const r = await fetch("/api/anchor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.ok) alert(j.error || "Anchor failed");
    else window.open(j.explorerUrl, "_blank");
  }

  const total = files.reduce((a, f) => a + f.size, 0);

  return (
    <section className="py-16 px-4 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white">Upload Research Datasets</h2>
          <p className="text-slate-300 mt-2">Securely upload to 0G Storage with cryptographic proofs and verifiable retrieval.</p>
        </div>

        <Card className="bg-slate-900/60 border-slate-700 shadow-xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white">0G Storage Upload</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "rounded-xl border-2 border-dashed p-8 text-center transition",
                "bg-slate-800/40 border-slate-700 hover:border-blue-400"
              )}
            >
              <p className="text-slate-300 mb-3">Drag & drop files here or choose from device</p>
              <input type="file" multiple onChange={onInput} className="block w-full text-slate-200" />
              <div className="mt-4 text-sm text-slate-400">Selected: {files.length} file(s) • {fmtKB(total)}</div>
            </div>

            {files.length > 0 && (
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-200 font-medium mb-2">Files</p>
                <ul className="space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li key={i} className="flex justify-between text-slate-300">
                      <span className="truncate">{f.name}</span>
                      <span className="text-slate-400">{fmtKB(f.size)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={cn("rounded-lg p-3 border", status !== "idle" ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Upload prepared</p>
              </div>
              <div className={cn("rounded-lg p-3 border", ["registering","checking","done"].includes(status) ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Registration transaction complete</p>
              </div>
              <div className={cn("rounded-lg p-3 border", ["checking","done"].includes(status) ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Waiting for checking file metadata…</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-500" onClick={handleUpload} disabled={!files.length || status === "preparing"}>
                Upload to 0G Storage
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => { setFiles([]); setStatus("idle"); setError(""); }}>
                Clear
              </Button>
            </div>

            {error && <div className="text-red-400 text-sm">Upload failed: {error}</div>}

            {root && (
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 space-y-3">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Merkle Root</p>
                  <code className="text-slate-100 break-all">{root}</code>
                </div>
                <div className="flex flex-wrap gap-3">
                  {gatewayUrl && <a className="px-3 py-2 rounded bg-slate-700 text-slate-100 hover:bg-slate-600" href={gatewayUrl} target="_blank">Download</a>}
                  {proofUrl && <a className="px-3 py-2 rounded bg-slate-700 text-slate-100 hover:bg-slate-600" href={proofUrl} target="_blank">Download with Proof</a>}
                  <a className="px-3 py-2 rounded bg-slate-700 text-slate-100 hover:bg-slate-600" href={`https://storagescan-galileo.0g.ai/files?root=${encodeURIComponent(root)}`} target="_blank">View on StorageScan</a>
                  <Button className="bg-purple-600 hover:bg-purple-500" onClick={handleAnchor}>Anchor on 0G Chain</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}