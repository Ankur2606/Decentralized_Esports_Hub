import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Loader2, Rocket, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";

interface DeploymentStatus {
  deployed: number;
  total: number;
  contracts: {
    predictionMarket?: string;
    fanTokenDAO?: string;
    skillShowcase?: string;
    courseNFT?: string;
    marketplace?: string;
  };
  isComplete: boolean;
}

const contractNames = {
  predictionMarket: "Prediction Market",
  fanTokenDAO: "Fan Token DAO",
  skillShowcase: "Skill Showcase",
  courseNFT: "Course NFT",
  marketplace: "Marketplace"
};

export default function AdminPanel() {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected } = useWebSocket();

  const { data: deploymentStatus, isLoading } = useQuery<DeploymentStatus>({
    queryKey: ["/api/admin/deployment-status"],
    refetchInterval: 5000, // Check status every 5 seconds
  });

  const deployMutation = useMutation({
    mutationFn: () => fetch("/api/admin/deploy-contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(res => res.json()),
    onSuccess: () => {
      setIsDeploying(true);
      toast({
        title: "Deployment Started",
        description: "Contract deployment has begun. This may take several minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to start contract deployment",
        variant: "destructive",
      });
    },
  });

  // Listen for WebSocket deployment events
  useEffect(() => {
    if (!connected) return;

    const handleDeploymentCompleted = () => {
      setIsDeploying(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deployment-status"] });
      toast({
        title: "Deployment Complete",
        description: "All contracts have been deployed successfully!",
      });
    };

    const handleDeploymentFailed = (data: any) => {
      setIsDeploying(false);
      toast({
        title: "Deployment Failed",
        description: data.error || "Contract deployment failed",
        variant: "destructive",
      });
    };

    // In a real implementation, you'd subscribe to WebSocket events here
    // For now, we'll rely on the polling query
    
    return () => {
      // Cleanup WebSocket listeners
    };
  }, [connected, queryClient, toast]);

  const handleDeploy = () => {
    deployMutation.mutate();
  };

  const progressPercentage = deploymentStatus 
    ? (deploymentStatus.deployed / deploymentStatus.total) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading deployment status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel - Contract Deployment
          </CardTitle>
          <CardDescription>
            Deploy and manage smart contracts on Chiliz Spicy Testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deployment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Deployment Progress</span>
              <span className="text-sm text-muted-foreground">
                {deploymentStatus?.deployed || 0} / {deploymentStatus?.total || 5} contracts
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          {/* Contract Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(contractNames).map(([key, name]) => {
              const address = deploymentStatus?.contracts[key as keyof typeof deploymentStatus.contracts];
              const isDeployed = !!address;
              
              return (
                <Card key={key} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{name}</h4>
                      {isDeployed && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {address?.slice(0, 8)}...{address?.slice(-6)}
                        </p>
                      )}
                    </div>
                    <Badge variant={isDeployed ? "default" : "secondary"}>
                      {isDeployed ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {isDeployed ? "Deployed" : "Pending"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Deployment Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDeploy}
              disabled={deployMutation.isPending || isDeploying || deploymentStatus?.isComplete}
              className="flex-1"
            >
              {deployMutation.isPending || isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : deploymentStatus?.isComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  All Contracts Deployed
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Contracts
                </>
              )}
            </Button>
            
            {deploymentStatus?.isComplete && (
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/deployment-status"] })}
              >
                Refresh Status
              </Button>
            )}
          </div>

          {/* Deployment Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Deployment Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Contracts will be deployed to Chiliz Spicy Testnet</li>
              <li>• Deployment uses your configured admin wallet address</li>
              <li>• Process may take 5-10 minutes to complete</li>
              <li>• Contract addresses will be automatically saved</li>
              <li>• App restart required after deployment</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}