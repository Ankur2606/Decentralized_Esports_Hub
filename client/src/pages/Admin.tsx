import { useWeb3 } from "@/hooks/useWeb3";
import AdminPanel from "@/components/AdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { ADMIN_ADDRESS } from "@/lib/constants";

export default function Admin() {
  const { account } = useWeb3();
  
  const isAdmin = account?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Wallet Connection Required</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to access the admin panel.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="text-muted-foreground">
                Admin privileges required to access this page.
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Connected: {account?.slice(0, 8)}...{account?.slice(-6)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage smart contracts and platform administration
          </p>
        </div>

        <AdminPanel />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Information
            </CardTitle>
            <CardDescription>
              Current admin session details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Admin Address:</span>
                <span className="text-sm font-mono">{account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Network:</span>
                <span className="text-sm">Chiliz Spicy Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Privileges:</span>
                <span className="text-sm">Contract Deployment, Video Verification, Event Resolution</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}