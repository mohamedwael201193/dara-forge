import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function TestMintButton() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testMintAPI = async () => {
    setLoading(true);
    setResult("Testing...");

    try {
      console.log("[Test] Calling mint API...");

      const response = await fetch(`${API_BASE_URL}/api/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "0x1dF8e57ea7A6A3bB554E13412b27d4d26BBA851B", // Test address
          metadataUri: JSON.stringify({
            name: "Test NFT",
            description: "Testing mint API",
            attributes: [],
          }),
          researchData: {
            cid: "test-cid",
            fileName: "test.txt",
          },
        }),
      });

      console.log("[Test] Response status:", response.status);

      const data = await response.json();
      console.log("[Test] Response data:", data);

      if (response.ok && data.ok) {
        setResult(
          `✅ Success!\nToken ID: ${data.result.tokenId}\nTx Hash: ${data.result.txHash}`
        );
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("[Test] Error:", error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Test Mint API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testMintAPI} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test Mint API"}
        </Button>

        {result && (
          <pre className="text-xs bg-muted p-4 rounded whitespace-pre-wrap">
            {result}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
