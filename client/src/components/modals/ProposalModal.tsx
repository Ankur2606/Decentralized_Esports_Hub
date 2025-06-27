import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { Plus, Vote, AlertCircle } from "lucide-react";

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProposalModal({ open, onClose }: ProposalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fanTokenBalance } = useWeb3();

  const createProposalMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const response = await fetch("/api/dao/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          creator: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", // Mock address
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        }),
      });
      if (!response.ok) throw new Error("Failed to create proposal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
      toast({
        title: "Proposal Created!",
        description: "Your governance proposal has been submitted to the DAO.",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(fanTokenBalance) === 0) {
      toast({
        title: "No Voting Power",
        description: "You need Fan Tokens to create proposals.",
        variant: "destructive",
      });
      return;
    }

    createProposalMutation.mutate({ title, description });
  };

  const canCreateProposal = parseFloat(fanTokenBalance) > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-dark-bg border-cyan-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Create Governance Proposal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning for users without tokens */}
          {!canCreateProposal && (
            <Card className="p-4 bg-warning-gold/10 border-warning-gold/30">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-warning-gold" />
                <span className="font-medium text-warning-gold">
                  Insufficient Voting Power
                </span>
              </div>
              <p className="text-sm text-gray-300">
                You need Fan Tokens to create governance proposals. 
                Earn tokens by engaging with the platform!
              </p>
            </Card>
          )}

          {/* Proposal Title */}
          <div>
            <Label htmlFor="proposalTitle" className="text-sm font-medium mb-2 block">
              Proposal Title *
            </Label>
            <Input
              id="proposalTitle"
              placeholder="Enter a clear, descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-cyan-accent"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Proposal Description */}
          <div>
            <Label htmlFor="proposalDescription" className="text-sm font-medium mb-2 block">
              Proposal Description *
            </Label>
            <Textarea
              id="proposalDescription"
              placeholder="Describe your proposal in detail. Explain what you want to change and why..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-600 focus:border-cyan-accent resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Proposal Guidelines */}
          <Card className="p-4 bg-cyan-accent/10 border-cyan-accent/30">
            <h4 className="font-medium text-cyan-accent mb-2">
              Proposal Guidelines
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Be specific about what you want to change</li>
              <li>• Explain the benefits to the community</li>
              <li>• Consider potential risks and drawbacks</li>
              <li>• Voting period is 7 days from creation</li>
              <li>• Proposals require majority vote to pass</li>
            </ul>
          </Card>

          {/* Your Voting Power */}
          {canCreateProposal && (
            <Card className="p-4 bg-card-gradient border-cyan-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text">Your Voting Power</p>
                  <p className="text-sm text-gray-400">
                    Fan Token Balance
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-cyan-accent">
                    {fanTokenBalance} FTK
                  </p>
                  <p className="text-xs text-gray-400">
                    Governance Tokens
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={createProposalMutation.isPending || !canCreateProposal || !title.trim() || !description.trim()}
            className="w-full gaming-gradient hover:neon-cyan card-hover"
          >
            <Plus className="mr-2 h-4 w-4" />
            {createProposalMutation.isPending ? "Creating Proposal..." : "Create Proposal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
