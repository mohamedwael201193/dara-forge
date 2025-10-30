import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";

const EXPLORER_URL =
  import.meta.env.VITE_OG_EXPLORER || "https://chainscan.0g.ai";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const PASSPORT_CONTRACT = import.meta.env.VITE_RESEARCH_PASSPORT_CONTRACT;

interface MintPassportButtonProps {
  researchData: {
    cid: string;
    anchorHash?: string;
    analysisResults?: any;
    fileName?: string;
    timestamp?: string;
  };
  onSuccess?: (tokenId: string, txHash: string) => void;
}

export function MintPassportButton({
  researchData,
  onSuccess,
}: MintPassportButtonProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAINNET_CHAIN_ID = 16661;

  // Prepare metadata URI (could be IPFS or on-chain data)
  const metadataUri = JSON.stringify({
    name: `DARA Research Passport #${Date.now()}`,
    description: `Research data verified and anchored on 0G Chain`,
    image: "ipfs://QmYourImageCID", // TODO: Generate unique image per research
    attributes: [
      { trait_type: "Storage CID", value: researchData.cid },
      {
        trait_type: "Anchor Hash",
        value: researchData.anchorHash || "pending",
      },
      { trait_type: "File Name", value: researchData.fileName || "unknown" },
      {
        trait_type: "Timestamp",
        value: researchData.timestamp || new Date().toISOString(),
      },
      { trait_type: "Network", value: "0G Mainnet" },
      { trait_type: "Verified", value: "true" },
    ],
  });

  const handleMint = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!PASSPORT_CONTRACT) {
      setError("Research Passport contract not configured");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      console.log("[Mint] Calling backend API to mint iNFT...");
      console.log("[Mint] Recipient:", address);

      const response = await fetch(`${API_BASE_URL}/api/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: address,
          metadataUri,
          researchData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Minting failed");
      }

      console.log("[Mint] ✅ Minting successful!", result.result);

      setTxHash(result.result.txHash);
      setMintedTokenId(result.result.tokenId);
      onSuccess?.(result.result.tokenId, result.result.txHash);
    } catch (err: any) {
      console.error("[Mint] ❌ Error:", err);
      setError(err.message || "Minting failed");
    } finally {
      setIsMinting(false);
    }
  };

  if (mintedTokenId) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Research Passport Minted!
          </CardTitle>
          <CardDescription>
            Your research has been immortalized as an iNFT on 0G Chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Token ID</p>
              <p className="font-mono font-semibold">#{mintedTokenId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contract</p>
              <p className="font-mono text-xs truncate">{PASSPORT_CONTRACT}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() =>
                window.open(`${EXPLORER_URL}/tx/${txHash}`, "_blank")
              }
            >
              <span>View Transaction</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() =>
                window.open(
                  `${EXPLORER_URL}/address/${PASSPORT_CONTRACT}`,
                  "_blank"
                )
              }
            >
              <span>View Contract</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>NFT Metadata:</strong>
              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify(JSON.parse(metadataUri), null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Mint Research Passport iNFT
        </CardTitle>
        <CardDescription>
          Create an on-chain certificate of your verified research data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Research Summary</h4>
          <div className="space-y-1 text-muted-foreground">
            <p>
              <strong>Storage CID:</strong>{" "}
              <span className="font-mono text-xs">{researchData.cid}</span>
            </p>
            {researchData.anchorHash && (
              <p>
                <strong>Anchor Hash:</strong>{" "}
                <span className="font-mono text-xs">
                  {researchData.anchorHash}
                </span>
              </p>
            )}
            {researchData.fileName && (
              <p>
                <strong>File:</strong> {researchData.fileName}
              </p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="border-purple-500/50 bg-purple-500/10">
          <AlertDescription className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">🎁</span>
              <div>
                <strong className="text-purple-400">
                  Gasless Minting by DARA
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  Focus on research, not transaction fees. DARA covers the gas
                  cost so you can mint instantly after verification. The iNFT is
                  yours - full ownership, zero cost.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleMint}
          disabled={!isConnected || isMinting}
          className="w-full"
          size="lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting iNFT...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Mint Research Passport
            </>
          )}
        </Button>

        {!isConnected && (
          <Alert>
            <AlertDescription>
              Please connect your wallet to mint an iNFT
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✅ Creates ERC-7857 compliant intelligent NFT</p>
          <p>🎁 Gasless minting - DARA pays transaction fees</p>
          <p>🔗 Permanently links research data to blockchain</p>
          <p>👤 You own the iNFT - full control and transferability</p>
          <p>
            • Contract: <span className="font-mono">{PASSPORT_CONTRACT}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
