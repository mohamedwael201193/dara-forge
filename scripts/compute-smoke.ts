import { config } from "dotenv";
import {
  analyzeWithAI,
  ensureLedger,
  listServices,
} from "../src/server/compute/broker.js";

// Load environment variables from .env file
config();

(async () => {
  try {
    console.log("🚀 Starting 0G Compute smoke test...\n");

    // Step 1: Ensure ledger is funded
    console.log("📊 Ensuring ledger is funded...");
    await ensureLedger(0.02);
    console.log("✅ Ledger ready\n");

    // Step 2: List available services
    console.log("� Listing available services...");
    const services = await listServices();
    console.log(`✅ Found ${services.length} services:`);
    services.forEach((s: any, i: number) => {
      console.log(`  ${i + 1}. ${s.model || "Unknown Model"} @ ${s.provider}`);
    });
    console.log("");

    if (!services.length) {
      console.error("❌ No services available");
      return;
    }

    // Step 3: Test AI analysis
    console.log("🤖 Testing AI analysis...");
    const testPrompt =
      "Hello from DARA Forge! Please provide a brief overview of blockchain technology and its benefits for scientific research.";

    console.log("📤 Sending request...");
    const result = await analyzeWithAI(testPrompt);

    console.log("\n🎉 Analysis completed successfully!");
    console.log(`Model: ${result.model}`);
    console.log(`Provider: ${result.provider}`);
    console.log(`Verified: ${result.verified ? "✅ YES" : "❌ NO"}`);
    console.log(`Chat ID: ${result.chatID}`);
    console.log(`Response length: ${result.answer.length} characters`);
    console.log("\n📝 AI Response:");
    console.log("─".repeat(60));
    console.log(
      result.answer.slice(0, 300) + (result.answer.length > 300 ? "..." : "")
    );
    console.log("─".repeat(60));

    console.log("\n✅ Smoke test completed successfully!");
  } catch (error) {
    console.error("\n❌ Smoke test failed:", error);
    process.exit(1);
  }
})();
