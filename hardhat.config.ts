
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || ""; // Alchemy/Infura/自建节点
const PK = process.env.DEPLOYER_PRIVATE_KEY || "";      // 部署私钥（测试钱包）

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: PK ? [PK] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
