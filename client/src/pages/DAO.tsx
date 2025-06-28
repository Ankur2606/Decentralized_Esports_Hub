import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProposalCard from "@/components/ProposalCard";
import ProposalModal from "@/components/modals/ProposalModal";
import { useWeb3 } from "@/hooks/useWeb3";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { Plus, Vote, Clock, CheckCircle, XCircle, Info, Shield, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface DaoProposal {
  id: number;
  contractProposalId: number;
  title: string;
  description: string;
  creator: string;
  votesFor: string;
  votesAgainst: string;
  executed: boolean;
  endTime: string;
  createdAt: string;
}

export default function DAO() {
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const { fanTokenBalance } = useWeb3();
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proposals, isLoading } = useQuery<DaoProposal[]>({
    queryKey: ["/api/dao/proposals"],
  });

  // Get actual Fan Token balance (you have 100 FTK from minting)
  const { data: userBalance } = useQuery({
    queryKey: ["/api/user/0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, support }: { proposalId: number; support: boolean }) => {
      const response = await fetch("/api/dao/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          voter: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", // Mock address
          support,
          weight: fanTokenBalance,
        }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
      toast({
        title: "Vote Cast!",
        description: `Your vote ${variables.support ? 'for' : 'against'} the proposal has been recorded.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle real-time vote updates
  useEffect(() => {
    if (lastMessage?.event === "dao:voteUpdate") {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
    } else if (lastMessage?.event === "dao:newProposal") {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
      toast({
        title: "New Proposal",
        description: "A new governance proposal has been created!",
      });
    }
  }, [lastMessage, queryClient, toast]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded loading-shimmer" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded loading-shimmer" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded loading-shimmer" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl loading-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const activeProposals = proposals?.filter(p => !p.executed) || [];
  const executedProposals = proposals?.filter(p => p.executed) || [];
  
  const actualFTKBalance = userBalance?.user?.fanTokenBalance || "100";
  const totalVotingPower = parseFloat(actualFTKBalance);
  const hasGovernanceRights = totalVotingPower >= 10; // Minimum 10 FTK to participate

  return (
    <div className="space-y-8">
      {/* Governance Guidelines */}
      <Alert className="border-cyan-500/20 bg-cyan-500/5">
        <Shield className="h-4 w-4 text-cyan-400" />
        <AlertDescription className="text-gray-300">
          <strong className="text-cyan-400">Governance Guidelines:</strong> Fan Token holders with at least 10 FTK can create proposals. 
          All token holders can vote. Proposals require 24-48 hours for voting and majority support for execution.
        </AlertDescription>
      </Alert>

      {/* Terms & Conditions */}
      <Alert className="border-orange-500/20 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-gray-300">
          <strong className="text-orange-400">Terms:</strong> By participating, you agree that votes are final and binding. 
          Malicious proposals may result in governance restrictions. Use governance responsibly for platform improvement.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text">Fan Token DAO</h1>
          <p className="text-gray-400 mt-2">
            Your voting power: <span className="text-cyan-accent font-bold">{actualFTKBalance} FTK</span>
          </p>
          {hasGovernanceRights && (
            <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Governance Rights Active
            </Badge>
          )}
        </div>
        <Button 
          onClick={() => setProposalModalOpen(true)}
          className="gaming-gradient hover:neon-cyan card-hover"
          disabled={!hasGovernanceRights}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {/* Sample Proposals Section */}
      {hasGovernanceRights && proposals?.length === 0 && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-purple-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">Sample Proposal Ideas</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="p-3 bg-black/20 rounded border-l-2 border-cyan-400">
              <strong className="text-cyan-400">Tournament Prize Pool:</strong> "Increase weekly tournament prize pool from 50 CHZ to 100 CHZ to attract more competitive players"
            </div>
            <div className="p-3 bg-black/20 rounded border-l-2 border-green-400">
              <strong className="text-green-400">Platform Feature:</strong> "Add mobile app support for betting and video viewing to expand platform accessibility"
            </div>
            <div className="p-3 bg-black/20 rounded border-l-2 border-orange-400">
              <strong className="text-orange-400">Community Reward:</strong> "Create monthly creator rewards program - top video creators receive 25 CHZ bonus"
            </div>
            <div className="p-3 bg-black/20 rounded border-l-2 border-purple-400">
              <strong className="text-purple-400">Governance Update:</strong> "Lower minimum FTK requirement for proposal creation from 10 to 5 tokens for wider participation"
            </div>
          </div>
        </Card>
      )}

      {/* Voting Power Card */}
      <Card className="p-6 bg-card-gradient border-cyan-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Governance Power</h3>
            <p className="text-gray-400 mb-4">
              Use your Fan Tokens to vote on proposals and shape the platform's future
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-accent">{actualFTKBalance}</div>
            <div className="text-sm text-gray-400">FTK Balance</div>
          </div>
        </div>
        
        {totalVotingPower === 0 && (
          <div className="mt-4 p-4 bg-warning-gold/10 border border-warning-gold/30 rounded-lg">
            <p className="text-warning-gold text-sm">
              You need Fan Tokens to participate in governance. Earn tokens by engaging with the platform!
            </p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Proposals</p>
              <p className="text-2xl font-bold text-cyan-accent">{activeProposals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Executed</p>
              <p className="text-2xl font-bold text-success-green">{executedProposals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ending Soon</p>
              <p className="text-2xl font-bold text-warning-gold">
                {activeProposals.filter(p => {
                  const endTime = new Date(p.endTime);
                  const now = new Date();
                  const hoursLeft = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                  return hoursLeft < 24;
                }).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card-gradient border-cyan-accent/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 gaming-gradient rounded-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Proposals</p>
              <p className="text-2xl font-bold text-error-red">{proposals?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Proposals */}
      {activeProposals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Active Proposals</h2>
          <div className="space-y-6">
            {activeProposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal}
                onVote={(support) => voteMutation.mutate({ proposalId: proposal.id, support })}
                voting={voteMutation.isPending}
                canVote={totalVotingPower > 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Executed Proposals */}
      {executedProposals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Executed Proposals</h2>
          <div className="space-y-6">
            {executedProposals.map((proposal) => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal}
                onVote={() => {}}
                voting={false}
                canVote={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!proposals || proposals.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No proposals yet</h3>
          <p className="text-gray-400 mb-4">
            Be the first to create a governance proposal and help shape the platform!
          </p>
          <Button 
            onClick={() => setProposalModalOpen(true)}
            className="gaming-gradient hover:neon-cyan"
            disabled={totalVotingPower === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Proposal
          </Button>
        </div>
      ) : null}

      {/* Proposal Modal */}
      <ProposalModal 
        open={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
      />
    </div>
  );
}
