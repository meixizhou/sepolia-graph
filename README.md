
# Sepolia + MetaMask + The Graph Demo

端到端最小项目：
1) 使用 MetaMask 在 **Sepolia** 向 Zero Address 转账（消耗 gas）。
2) 将数据写入合约触发事件。
3) 用 **The Graph** 索引事件并在前端读回展示。

## 快速开始

### 0. 准备
- 安装 Node.js 18+
- 安装 pnpm 或 npm/yarn
- 准备 Sepolia RPC（Infura/Alchemy）和测试币

### 1. 合约部署
```bash
cp .env.example .env
# 编辑 .env，填入 SEPOLIA_RPC_URL 与 DEPLOYER_PRIVATE_KEY

pnpm i  # 或 npm i / yarn
pnpm run build
pnpm run deploy:sepolia
# 记录输出的合约地址
```

### 2. 创建/部署子图（Hosted Service 示例）
```bash
cd subgraph
pnpm i
# 如未登录： graph auth --product hosted-service <ACCESS_TOKEN>
# 替换 subgraph.yaml 中的 address 为部署的合约地址（或用脚本注入）

pnpm run codegen
pnpm run build
pnpm run deploy
# 获得 GraphQL 查询端点 URL
```

### 3. 前端运行
```bash
cd ../frontend
cp .env.example .env
# 将 VITE_SUBGRAPH_URL 与 VITE_CONTRACT_ADDRESS 替换为你的值

pnpm i
pnpm run dev
# 浏览器打开本地地址，连接 MetaMask，切换到 Sepolia
```

## 结构
- `contracts/DataVault.sol`：写事件的合约
- `scripts/deploy.ts`：Hardhat 部署脚本
- `subgraph/`：The Graph 子图（AssemblyScript 映射）
- `frontend/`：React + Vite + Apollo Client + ethers v6 前端

> 提示：转账给 Zero Address 仅用于示例，请使用极小金额。



