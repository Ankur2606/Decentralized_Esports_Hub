import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, chilizSpicyTestnet } from "@/lib/thirdweb";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

export default function WalletConnect() {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();

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
          onClick={() => disconnect({ client })}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={chilizSpicyTestnet}
      connectButton={{
        label: "Connect Wallet",
      }}
      connectModal={{
        size: "compact",
        title: "Connect to ChiliZ eSports Hub",
      }}
    />
  );
}