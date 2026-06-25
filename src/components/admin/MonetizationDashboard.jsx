import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, CreditCard, Users, Package } from "lucide-react";

export default function MonetizationDashboard() {
  const { data: revenue = [], isLoading } = useQuery({
    queryKey: ["platform-revenue"],
    queryFn: () => base44.entities.PlatformRevenue.list(),
  });

  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const commissionRevenue = revenue.filter(r => r.transaction_type === "sale_commission").reduce((sum, r) => sum + r.amount, 0);
  const adRevenue = revenue.filter(r => r.transaction_type === "sponsored_ad").reduce((sum, r) => sum + r.amount, 0);
  const subscriptionRevenue = revenue.filter(r => r.transaction_type === "elite_subscription").reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-playfair text-3xl font-bold mb-8">Monetization Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">ZMW {totalRevenue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">ZMW {commissionRevenue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Sales Commissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">ZMW {adRevenue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Sponsored Ads</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-playfair">ZMW {subscriptionRevenue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Subscriptions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenue.slice(-10).reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <div className="font-semibold capitalize">{r.transaction_type.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.artist_email} • {new Date(r.payment_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-bold text-green-500">+ZMW {r.amount.toFixed(2)}</div>
              </div>
            ))}
            {revenue.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No revenue recorded yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}