import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useConnect, useActiveAccount, useDisconnect, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/lib/thirdweb";
import { useState } from "react";

export default function WalletConnect() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const wallet = createWallet("io.metamask");
      await connect(async () => {
        await wallet.connect({
          client: client,
        });
        return wallet;
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (wallet) {
        await disconnect(wallet);
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="text-cyan-400 font-medium">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </div>
          <div className="text-gray-400 text-xs">Connected</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}