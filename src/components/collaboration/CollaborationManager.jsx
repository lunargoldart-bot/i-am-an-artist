import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Loader2, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending Response' },
  accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Active' },
  declined: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Declined' },
  cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-700', label: 'Cancelled' }
};

export default function CollaborationManager() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['collaboration-requests'],
    queryFn: () => base44.entities.CollaborationRequest.list('-created_date', 50),
    initialData: [],
    enabled: !!user
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations'],
    queryFn: () => base44.entities.Collaboration.list('-created_date', 50),
    initialData: [],
    enabled: !!user
  });

  const handleMutation = useMutation({
    mutationFn: ({ requestId, action }) =>
      base44.functions.invoke('handleCollaborationRequest', { requestId, action }),
    onSuccess: (response, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-requests'] });
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      toast.success(response.data.message);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process request');
    }
  });

  if (!user) return null;

  // Filter requests relevant to this user
  const myRequests = requests.filter(r =>
    r.collaborator_email === user.email || r.initiator_email === user.email
  );

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const activeCollaborations = collaborations.filter(c =>
    (c.initiator_email === user.email || c.collaborator_email === user.email) && c.status === 'active'
  );

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-playfair font-semibold text-foreground">Pending Requests</h3>
          {pendingRequests.map((req) => {
            const StatusIcon = statusConfig[req.status].icon;
            const isReceiver = req.collaborator_email === user.email;

            return (
              <Card key={req.id} className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{req.project_title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isReceiver ? `From ${req.initiator_name}` : `To ${req.collaborator_name}`}
                        </p>
                      </div>
                      <Badge className={`${statusConfig[req.status].color} text-xs gap-1.5`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[req.status].label}
                      </Badge>
                    </div>

                    {req.project_description && (
                      <p className="text-sm text-foreground/80">{req.project_description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Category</span>
                        <p className="font-semibold text-foreground">
                          {req.category.replace(/_/g, ' ').charAt(0).toUpperCase() + req.category.slice(1).replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Commission Split</span>
                        <p className="font-semibold text-foreground">
                          {req.initiator_commission}% / {req.collaborator_commission}%
                        </p>
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                        "{req.message}"
                      </p>
                    )}

                    {isReceiver && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleMutation.mutate({ requestId: req.id, action: 'accept' })}
                          disabled={handleMutation.isPending}
                          className="flex-1 rounded-full gap-2"
                        >
                          {handleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMutation.mutate({ requestId: req.id, action: 'decline' })}
                          disabled={handleMutation.isPending}
                          className="flex-1 rounded-full"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Collaborations */}
      {activeCollaborations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-playfair font-semibold text-foreground">Active Collaborations</h3>
          {activeCollaborations.map((collab) => {
            const isInitiator = collab.initiator_email === user.email;
            const myEarnings = isInitiator ? collab.initiator_earnings : collab.collaborator_earnings;
            const myCommission = isInitiator ? collab.initiator_commission : collab.collaborator_commission;

            return (
              <Card key={collab.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{collab.project_title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Collaborating with {isInitiator ? collab.collaborator_name : collab.initiator_name}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 gap-1.5">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 rounded bg-background">
                      <span className="text-muted-foreground text-xs">Your Commission</span>
                      <p className="font-semibold text-foreground">{myCommission}%</p>
                    </div>
                    <div className="p-2 rounded bg-background">
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" /> Works
                      </span>
                      <p className="font-semibold text-foreground">{collab.artwork_ids?.length || 0}</p>
                    </div>
                    <div className="p-2 rounded bg-background">
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Your Earnings
                      </span>
                      <p className="font-semibold text-primary">
                        ZMW {Math.round(myEarnings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {myRequests.length === 0 && activeCollaborations.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No collaborations yet</p>
        </div>
      )}
    </div>
  );
}