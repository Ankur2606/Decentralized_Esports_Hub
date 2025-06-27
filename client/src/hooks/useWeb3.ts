import { useState, useEffect } from "react";

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [fanTokenBalance, setFanTokenBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Simulate wallet connection (in real app, would use Web3 provider)
  const connectWallet = async () => {
    setLoading(true);
    try {
      // Simulate wallet connection
      const mockAddress = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";
      setAccount(mockAddress);
      
      // Fetch user data from API
      const response = await fetch(`/api/user/${mockAddress}`);
      if (response.ok) {
        const userData = await response.json();
        setBalance(userData.user.chzBalance || "125.45");
        setFanTokenBalance(userData.user.fanTokenBalance || "1250");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setFanTokenBalance("0");
  };

  // Auto-connect on mount (simulate persistent connection)
  useEffect(() => {
    connectWallet();
  }, []);

  return {
    account,
    balance,
    fanTokenBalance,
    loading,
    connectWallet,
    disconnectWallet,
    isConnected: !!account
  };
}
