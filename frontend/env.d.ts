///<reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUBGRAPH_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  // 👆 add all your custom env variables here (must start with VITE_)
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
