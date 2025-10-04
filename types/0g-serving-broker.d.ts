// Global type declarations for @0glabs/0g-serving-broker
declare module "@0glabs/0g-serving-broker" {
  export function createZGComputeNetworkBroker(wallet: any): Promise<ZGComputeNetworkBroker>;
  
  export interface ZGComputeNetworkBroker {
    ledger: {
      getLedger(): Promise<{
        totalBalance: bigint;
        locked: bigint;
      }>;
      addLedger(amount: string): Promise<any>;
    };
    inference: {
      getServiceMetadata(providerAddress: string): Promise<{
        endpoint: string;
      }>;
      getRequestHeaders(providerAddress: string, content: string): Promise<Record<string, string>>;
      processResponse(providerAddress: string, response: string): Promise<boolean>;
    };
  }
}