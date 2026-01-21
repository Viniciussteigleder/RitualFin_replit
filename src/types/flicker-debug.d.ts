export {};

declare global {
  interface Window {
    __flickerDebug?: {
      version: 1;
      enabled: boolean;
      startWindow: (label: string) => void;
      endWindow: () => any | null;
      getListenerInventory: () => Record<string, unknown>;
      getCompositingReport: () => unknown;
      recordReactCommit: (record: unknown) => void;
    };
  }
}

