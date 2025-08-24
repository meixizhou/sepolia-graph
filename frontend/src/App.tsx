import React, { useEffect, useMemo, useState } from "react";
import { ethers, parseEther } from "ethers";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ======== 环境变量 ========
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL as string;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "string", name: "content", type: "string" }],
    name: "writeData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address payable", name: "to", type: "address" }],
    name: "transferEth",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// ======== GraphQL 查询 ========
const GET_DATA = gql`
  query GetRecords($first: Int = 20) {
    records(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      sender
      content
      timestamp
    }
    transfers(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      sender
      to
      amount
      timestamp
    }
  }
`;

function DataList() {
  const { data, loading, error, refetch } = useQuery(GET_DATA, { fetchPolicy: "network-only" });

  useEffect(() => {
    const t = setInterval(() => refetch(), 15000);
    return () => clearInterval(t);
  }, [refetch]);

  if (loading) return <p className="text-gray-500">⏳ 正在加载数据…</p>;
  if (error) return <p className="text-red-500">❌ 子图查询出错：{String(error)}</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📌 写入数据记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.records.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg bg-gray-50">
              <p>
                <span className="font-mono text-sm">{r.sender}</span> 写入 →{" "}
                <span className="font-semibold">{r.content}</span>
              </p>
              <small className="text-gray-500">
                {new Date(Number(r.timestamp) * 1000).toLocaleString()}
              </small>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💸 转账记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.transfers.map((t: any) => (
            <div key={t.id} className="p-3 border rounded-lg bg-gray-50">
              <p>
                <span className="font-mono text-sm">{t.sender}</span> →{" "}
                <span className="font-mono text-sm">{t.to}</span>  
                <span className="ml-2 font-semibold">{ethers.formatEther(t.amount)} ETH</span>
              </p>
              <small className="text-gray-500">
                {new Date(Number(t.timestamp) * 1000).toLocaleString()}
              </small>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AppInner() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>(""); // 新增输入地址状态
  const [content, setContent] = useState<string>("");

  const apollo = useMemo(() => new ApolloClient({ uri: SUBGRAPH_URL, cache: new InMemoryCache() }), []);

  useEffect(() => {
    if ((window as any).ethereum) {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(p);
    }
  }, []);

  async function connect() {
    if (!provider) return alert("未检测到 MetaMask");
    const accs = await provider.send("eth_requestAccounts", []);
    const s = await provider.getSigner();
    setSigner(s);
    setAccount(accs[0]);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 11155111) {
      alert("请切换到 Sepolia 网络");
    }
  }

  async function sendToZero() {
    if (!signer) return alert("请先连接钱包");
    if (!toAddress || !ethers.isAddress(toAddress)) return alert("请输入有效的地址");
    const val = parseEther(amount || "0");
    if (val <= 0n) return alert("金额必须大于 0");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
      const tx = await contract.transferEth(toAddress, { value: val });
      await tx.wait();
      alert(`已发送，交易哈希：${tx.hash}`);
    } catch (err: any) {
      console.error(err);
      alert("交易失败，请检查金额、地址或网络");
    }
  }

  async function writeOnchain() {
    if (!signer) return alert("请先连接钱包");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.writeData(content);
    await tx.wait();
    setContent("");
    alert(`数据已上链，交易哈希：${tx.hash}`);
  }

  return (
    <ApolloProvider client={apollo}>
      <div className="max-w-3xl mx-auto py-10 px-6 font-sans space-y-8">
        <h1 className="text-3xl font-bold text-center">🚀 Sepolia Graph DApp</h1>

        <div className="flex justify-center">
          <Button onClick={connect}>
            {account ? `已连接：${account.slice(0, 6)}…${account.slice(-4)}` : "🔗 连接 MetaMask"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1️⃣ 向指定地址转账</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="输入接收地址"
              />
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00005"
              />
              <Button onClick={sendToZero}>发送</Button>
            </div>
            <p className="text-gray-500 text-sm">
              ⚠️ 提示：请确保地址正确且账户有 Sepolia ETH。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2️⃣ 数据上链（触发事件）</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入要写入的内容"
            />
            <Button onClick={writeOnchain} disabled={!content}>
              写入
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3️⃣ 从 The Graph 读回展示</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList />
          </CardContent>
        </Card>
      </div>
    </ApolloProvider>
  );
}


export default function App() {
  return <AppInner />;
}
