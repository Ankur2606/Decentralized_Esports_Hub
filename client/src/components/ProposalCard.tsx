import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Clock, CheckCircle } from "lucide-react";

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

interface ProposalCardProps {
  proposal: DaoProposal;
  onVote: (support: boolean) => void;
  voting: boolean;
  canVote: boolean;
}

export default function ProposalCard({ proposal, onVote, voting, canVote }: ProposalCardProps) {
  const getTimeRemaining = () => {
    const endTime = new Date(proposal.endTime);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0 || proposal.executed) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getStatusBadge = () => {
    if (proposal.executed) {
      return <Badge className="bg-cyan-accent text-dark-bg">EXECUTED</Badge>;
    }
    
    const timeRemaining = getTimeRemaining();
    if (!timeRemaining) {
      return <Badge className="bg-warning-gold text-dark-bg">ENDED</Badge>;
    }
    
    return <Badge className="bg-success-green text-white">ACTIVE</Badge>;
  };

  const totalVotes = parseFloat(proposal.votesFor) + parseFloat(proposal.votesAgainst);
  const forPercentage = totalVotes > 0 ? (parseFloat(proposal.votesFor) / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (parseFloat(proposal.votesAgainst) / totalVotes) * 100 : 0;

  return (
    <div className="gradient-border">
      <Card className="gradient-border-content bg-transparent border-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusBadge()}
              <span className="text-gray-400 text-sm">
                Proposal #{proposal.contractProposalId.toString().padStart(3, '0')}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-light-text">
              {proposal.title}
            </h3>
            <p className="text-gray-400 mb-4">
              {proposal.description}
            </p>
            <div className="text-sm text-gray-400">
              Created by {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
            </div>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Voting Progress</span>
            <span className="text-sm text-gray-400">
              {getTimeRemaining()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-success-green">
                  For ({Math.round(forPercentage)}%)
                </span>
                <span className="text-light-text">
                  {parseFloat(proposal.votesFor).toFixed(0)} FTK
                </span>
              </div>
              <Progress 
                value={forPercentage} 
                className="h-2 bg-gray-700"
                style={{
                  background: "hsl(var(--muted))"
                }}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-error-red">
                  Against ({Math.round(againstPercentage)}%)
                </span>
                <span className="text-light-text">
                  {parseFloat(proposal.votesAgainst).toFixed(0)} FTK
                </span>
              </div>
              <Progress 
                value={againstPercentage} 
                className="h-2 bg-gray-700"
                style={{
                  background: "hsl(var(--muted))"
                }}
              />
            </div>
          </div>
        </div>

        {/* Voting Buttons */}
        {!proposal.executed && getTimeRemaining() && (
          <div className="flex space-x-4">
            <Button
              onClick={() => onVote(true)}
              disabled={voting || !canVote}
              className="flex-1 bg-success-green/20 hover:bg-success-green/30 border border-success-green text-success-green card-hover"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {voting ? "Voting..." : "Vote For"}
            </Button>
            <Button
              onClick={() => onVote(false)}
              disabled={voting || !canVote}
              className="flex-1 bg-error-red/20 hover:bg-error-red/30 border border-error-red text-error-red card-hover"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {voting ? "Voting..." : "Vote Against"}
            </Button>
          </div>
        )}

        {!canVote && !proposal.executed && (
          <div className="mt-4 p-3 bg-warning-gold/10 border border-warning-gold/30 rounded-lg">
            <p className="text-warning-gold text-sm">
              You need Fan Tokens to vote on this proposal.
            </p>
          </div>
        )}

        {/* Final Results for Executed Proposals */}
        {proposal.executed && (
          <div className="mt-4 p-4 bg-cyan-accent/10 border border-cyan-accent/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-cyan-accent" />
              <span className="font-medium text-cyan-accent">Proposal Executed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-success-green">
                  Final For: {Math.round(forPercentage)}%
                </span>
              </div>
              <div>
                <span className="text-error-red">
                  Final Against: {Math.round(againstPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
