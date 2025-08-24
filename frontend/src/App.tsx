
import React, { useEffect, useMemo, useState } from "react";
import { ethers, ZeroAddress, parseEther } from "ethers";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";

// ======== 环境变量 ========
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL as string; // 例如：https://api.thegraph.com/subgraphs/name/<user>/datavault-sepolia
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "content", "type": "string" }
    ],
    "name": "writeData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address payable", "name": "to", "type": "address" }
    ],
    "name": "transferEth",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
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

function RecordsList() {
  const { data, loading, error, refetch } = useQuery(GET_RECORDS, { fetchPolicy: "network-only" });
  console.log(data, 'data=========')
  useEffect(() => {
    const t = setInterval(() => refetch(), 50000);
    return () => clearInterval(t);
  }, [refetch]);

  if (loading) return <p>加载中…</p>;
  if (error) return <p>子图查询出错：{String(error)}</p>;

  return (
    <ul>
      {data.records.map((r: any) => (
        <li key={r.id}>
          <code>{r.sender}</code> ： {r.content} （{new Date(Number(r.timestamp) * 1000).toLocaleString()}）
        </li>
      ))}
    </ul>
  );
}

function DataList() {
  const { data, loading, error, refetch } = useQuery(GET_DATA, { fetchPolicy: "network-only" });

  useEffect(() => {
    const t = setInterval(() => refetch(), 15000);
    return () => clearInterval(t);
  }, [refetch]);

  if (loading) return <p>加载中…</p>;
  if (error) return <p>子图查询出错：{String(error)}</p>;

  return (
    <div>
      <h3>📌 写入数据记录</h3>
      <ul>
        {data.records.map((r: any) => (
          <li key={r.id}>
            <code>{r.sender}</code> 写入 → {r.content}  
            <small>（{new Date(Number(r.timestamp) * 1000).toLocaleString()}）</small>
          </li>
        ))}
      </ul>

      <h3>💸 转账记录</h3>
      <ul>
        {data.transfers.map((t: any) => (
          <li key={t.id}>
            <code>{t.sender}</code> 转给 <code>{t.to}</code> → {ethers.formatEther(t.amount)} ETH  
            <small>（{new Date(Number(t.timestamp) * 1000).toLocaleString()}）</small>
          </li>
        ))}
      </ul>
    </div>
  );
}


function AppInner() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.00005");
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

    // 确保在 sepolia 网络
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 11155111) {
      alert("请切换到 Sepolia 网络");
    }
  }

// async function sendToZero() {
//   if (!signer) return alert("请先连接钱包");
//   console.log(amount, 'amount=======')
//   const val = Number(amount || "0");
//   console.log(val, 'val=====')
//   if (val < 0) return alert("金额必须大于 0");

//   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

//   try {
//     // ⚠️ ZeroAddress 可以换成测试地址，避免实际丢失 ETH
//     const tx = await contract.transferEth('0x98A3031b62DD564Cda850134a4A5034A80C2756b', { value: val });
//     await tx.wait();
//     alert(`已发送，交易哈希：${tx.hash}`);
//   } catch (err: any) {
//     console.error(err);
//     alert("transferEth 交易失败，请检查金额或网络");
//   }
// }

// async function sendToZero() {
//   if (!signer) return alert("请先连接钱包");

//   if (!amount || parseFloat(amount) <= 0) return alert("金额必须大于 0");

//   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//   try {
//     const tx = await contract.transferEth('0x98A3031b62DD564Cda850134a4A5034A80C2756b', { value: parseEther(amount) });
//     await tx.wait();
//     alert(`已发送，交易哈希：${tx.hash}`);
//   } catch (err: any) {
//     console.error(err);
//     alert("转账失败，请检查金额或网络");
//   }
// }

// async function sendToZero() {
//   if (!signer) return alert("请先连接钱包");

//   const val = parseEther(amount); // amount 是字符串，如 "0.00001"
//   if (val <= 0n) return alert("金额必须大于 0");

//   const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

//   try {
//     const tx = await contract.transferEth('0x98A3031b62DD564Cda850134a4A5034A80C2756b', { value: val });
//     await tx.wait();
//     alert(`已发送，交易哈希：${tx.hash}`);
//   } catch (err: any) {
//     console.error(err);
//     alert("转账失败，请检查金额或网络");
//   }
// }

// import { parseEther } from "ethers";

async function sendToZero() {
  if (!signer) return alert("请先连接钱包");

  const val = parseEther(amount || "0");
  if (val <= 0n) return alert("金额必须大于 0");

  // ⚠️ 测试时不要用 ZeroAddress，换成你控制的账户地址
  const toAddress = "0x98A3031b62DD564Cda850134a4A5034A80C2756b";

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
    console.log(CONTRACT_ADDRESS,'CONTRACT_ADDRESS===')
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.writeData(content);
    await tx.wait();
    setContent("");
    alert(`数据已上链，交易哈希：${tx.hash}`);
  }

  return (
    <ApolloProvider client={apollo}>
      <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
        <h1>Sepolia Graph </h1>
        <button onClick={connect}>{account ? `已连接：${account.slice(0,6)}…${account.slice(-4)}` : "连接 MetaMask"}</button>

        <h2>1) 向 Zero Address 转账</h2>
        <div>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00005" /> ETH &nbsp;
          <button onClick={sendToZero}>发送</button>
          <p style={{opacity:0.7}}>提示：这是演示 gas 消耗的交易，请使用极小金额并确保账户有 Sepolia ETH。</p>
        </div>

        <h2>2) 数据上链（触发事件）</h2>
        <div>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="输入要写入的内容" style={{ width: "70%" }} />
          <button onClick={writeOnchain} disabled={!content}>写入</button>
        </div>

        <h2>3) 从 The Graph 读回展示</h2>
        {/* <RecordsList /> */}
        <DataList />
      </div>
    </ApolloProvider>
  );
}

export default function App() {
  return <AppInner />;
}
