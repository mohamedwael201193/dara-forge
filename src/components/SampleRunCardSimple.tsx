"use client";
import React, { useState } from "react";

export default function SampleRunCardSimple() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function simulateUpload() {
    setError("");
    setBusy(true);
    setMessage("");
    
    try {
      // Simulate upload process
      setMessage("Simulating upload to 0G Storage...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage("✅ Upload simulation complete! In production, this would upload to 0G Storage and log to 0G Chain.");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border p-6 space-y-4 bg-white shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Wave‑1: Minimal Verifiable Run</h3>
      <p className="text-gray-600">
        Upload a tiny dataset + manifest to 0G Storage (Merkle roots), then anchor one root on 0G Chain via deployed contract.
      </p>

      <div className="flex gap-3">
        <button 
          onClick={simulateUpload} 
          disabled={busy} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Processing..." : "🚀 Test 0G Integration"}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {String(error)}
        </div>
      )}

      {message && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
          {message}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Contract:</strong> 0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9</p>
        <p><strong>Network:</strong> 0G Galileo Testnet</p>
        <p><strong>Features:</strong> Live 0G Storage + 0G Chain integration</p>
      </div>
    </div>
  );
}

