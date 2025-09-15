import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useHR";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, Star, Users, Calendar, CheckCircle, Clock } from "lucide-react";

interface StaffVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffVotingModal = ({ isOpen, onClose }: StaffVotingModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  const [voterName, setVoterName] = useState("");
  const [voterType, setVoterType] = useState<'staff' | 'guest'>('staff');
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  // Fetch current month votes
  const { data: votes = [], isLoading } = useQuery({
    queryKey: ['staff-votes', currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_votes' as any)
        .select(`
          *,
          employees!inner (
            first_name,
            last_name,
            employee_id,
            departments (name)
          )
        `)
        .eq('voting_period', currentMonth);

      if (error) throw error;
      return data as any[];
    }
  });

  // Check if current voter has already voted
  useEffect(() => {
    const checkVoterStatus = async () => {
      if (!voterName) return;
      
      const { data } = await supabase
        .from('staff_votes' as any)
        .select('id')
        .eq('voting_period', currentMonth)
        .eq('voter_name', voterName)
        .eq('voter_type', voterType);
      
      setHasVoted((data?.length || 0) > 0);
    };

    checkVoterStatus();
  }, [voterName, voterType, currentMonth]);

  const submitVoteMutation = useMutation({
    mutationFn: async (voteData: any) => {
      // First check if voter has already voted
      const { data: existingVote } = await supabase
        .from('staff_votes' as any)
        .select('id')
        .eq('voting_period', currentMonth)
        .eq('voter_name', voterName)
        .eq('voter_type', voterType);

      if (existingVote && existingVote.length > 0) {
        throw new Error('You have already voted this month');
      }

      const { data, error } = await supabase
        .from('staff_votes' as any)
        .insert([voteData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-votes', currentMonth] });
      toast({
        title: "Vote Submitted",
        description: "Thank you for your vote! Results will be announced at the end of the month.",
      });
      setHasVoted(true);
      setTimeout(() => onClose(), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = async () => {
    if (!voterName || !selectedEmployee) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and select a candidate",
        variant: "destructive",
      });
      return;
    }

    await submitVoteMutation.mutateAsync({
      employee_id: selectedEmployee,
      voter_name: voterName,
      voter_type: voterType,
      voting_period: currentMonth,
      voted_at: new Date().toISOString()
    });
  };

  // Calculate vote counts
  const voteCounts = votes.reduce((acc: any, vote: any) => {
    const key = vote.employee_id;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalVotes = votes.length;
  const sortedCandidates = employees
    .map(emp => ({
      ...emp,
      voteCount: voteCounts[emp.id] || 0,
      percentage: totalVotes > 0 ? ((voteCounts[emp.id] || 0) / totalVotes) * 100 : 0
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Star className="h-6 w-6 text-warning" />
            Staff of the Month Voting - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voting Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalVotes}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{new Date().getDate()}</p>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
              </CardContent>
            </Card>
          </div>

          {/* Voter Information */}
          {!hasVoted && (
            <Card>
              <CardHeader>
                <CardTitle>Cast Your Vote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voterName">Your Name</Label>
                    <Input
                      id="voterName"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label>Voter Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={voterType === 'staff' ? 'default' : 'outline'}
                        onClick={() => setVoterType('staff')}
                      >
                        Staff Member
                      </Button>
                      <Button
                        type="button"
                        variant={voterType === 'guest' ? 'default' : 'outline'}
                        onClick={() => setVoterType('guest')}
                      >
                        Guest
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Candidates</span>
                {hasVoted && (
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    You have voted
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEmployee === candidate.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    } ${hasVoted ? 'cursor-not-allowed opacity-60' : ''}`}
                    onClick={() => !hasVoted && setSelectedEmployee(candidate.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {candidate.first_name} {candidate.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {candidate.employee_positions?.title} • {candidate.departments?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{candidate.voteCount}</p>
                        <p className="text-sm text-muted-foreground">votes</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Vote Share</span>
                        <span>{candidate.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={candidate.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!hasVoted && (
              <Button
                onClick={handleSubmitVote}
                disabled={!voterName || !selectedEmployee || submitVoteMutation.isPending}
                className="button-luxury"
              >
                {submitVoteMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Vote...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Submit Vote
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};