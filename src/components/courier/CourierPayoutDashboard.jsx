import React, { useEffect, useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';

export default function CourierPayoutDashboard({ courier_email }) {
  const { user } = useAuth();
  const payoutEmail = courier_email || user?.email;
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({ total_earnings: 0, pending_amount: 0, monthly_earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const payoutRecords = await firebaseClient.entities.CourierPayout.filter({
          courier_email: payoutEmail
        });
        setPayouts(payoutRecords || []);

        // Calculate stats
        const completed = payoutRecords.filter(p => p.status === 'completed');
        const pending = payoutRecords.filter(p => p.status === 'initiated' || p.status === 'pending');

        const totalEarnings = completed.reduce((sum, p) => sum + p.total_payout, 0);
        const pendingAmount = pending.reduce((sum, p) => sum + p.total_payout, 0);

        // Current month earnings
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyEarnings = completed
          .filter(p => new Date(p.completed_date) >= monthStart)
          .reduce((sum, p) => sum + p.total_payout, 0);

        setStats({ total_earnings: totalEarnings, pending_amount: pendingAmount, monthly_earnings: monthlyEarnings });
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!payoutEmail) { setLoading(false); return undefined; }
    fetchPayouts();

    // Subscribe to real-time updates
    const unsubscribe = firebaseClient.entities.CourierPayout.subscribe((event) => {
      if (event.type === 'update' && event.data?.courier_email === payoutEmail) {
        setPayouts(prev => prev.map(p => p.id === event.id ? event.data : p));
      }
    }, { where: { courier_email: payoutEmail } });

    return unsubscribe;
  }, [payoutEmail]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'initiated': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'initiated': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Total Earnings</p>
              <p className="text-3xl font-playfair font-bold text-primary">{stats.total_earnings.toFixed(2)} ZMW</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Pending Payout</p>
              <p className="text-3xl font-playfair font-bold text-yellow-400">{stats.pending_amount.toFixed(2)} ZMW</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">This Month</p>
              <p className="text-3xl font-playfair font-bold text-green-400">{stats.monthly_earnings.toFixed(2)} ZMW</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-playfair text-xl font-semibold mb-4">Payout History</h3>
        
        {payouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No payouts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Bonus</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs">{payout.order_id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-semibold">{payout.total_payout.toFixed(2)} ZMW</td>
                    <td className="py-3 px-4 text-primary">+{payout.bonus_amount.toFixed(2)} ZMW</td>
                    <td className="py-3 px-4">
                      <Badge className={`flex w-fit items-center gap-1 ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {format(new Date(payout.created_date), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}