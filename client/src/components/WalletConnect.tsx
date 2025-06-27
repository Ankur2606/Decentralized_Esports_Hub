import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet, isConnected, loading } = useWeb3();

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="text-cyan-400 font-medium">
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <div className="text-gray-400 text-xs">Connected</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={loading}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {loading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}