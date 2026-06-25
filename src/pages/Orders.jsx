import React, { useState, useEffect } from "react";
import { authService, OrderService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Package, Truck, CheckCircle, Clock, Phone, 
  Shield, DollarSign, AlertCircle, Loader2, Star, MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CourierRatingModal from "@/components/courier/CourierRatingModal";
import GrievanceSubmitForm from "@/components/grievances/GrievanceSubmitForm";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: Package },
  courier_contacted: { label: "Courier Contacted", color: "bg-purple-100 text-purple-700", icon: Phone },
  in_transit: { label: "In Transit", color: "bg-accent text-accent-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
  paid: { label: "Paid", color: "bg-primary/10 text-primary", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: Clock },
  disputed: { label: "Disputed", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const paymentStatusConfig = {
  pending: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: CheckCircle },
  held_in_escrow: { label: "Held in Escrow", color: "bg-blue-100 text-blue-700", icon: Shield },
  released: { label: "Released", color: "bg-primary/10 text-primary", icon: DollarSign },
  refunded: { label: "Refunded", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const deliveryLabels = {
  yango: "Yango Delivery",
  courier: "Courier",
  pickup: "Pickup",
  other: "Other",
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [ratingModalOrder, setRatingModalOrder] = React.useState(null);
  const [grievanceModalOrder, setGrievanceModalOrder] = React.useState(null);

  React.useEffect(() => {
    authService.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await authService.getCurrentUser();
        setUser(me);
      }
    });
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => OrderService.list("-createdAt", 50),
    initialData: [],
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: (orderId) => httpsCallable(functions, "confirmDelivery")({ orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Delivery confirmed! Payment will be released to the artist within 24 hours.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to confirm delivery");
    },
  });

  const handleConfirmDelivery = (orderId) => {
    if (window.confirm("Confirm that you have received this artwork? The payment will be released to the artist within 24 hours.")) {
      confirmDeliveryMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold">Please log in</h3>
        <p className="text-muted-foreground font-body text-sm mt-2">
          Log in to view your orders
        </p>
      </div>
    );
  }

  const myOrders = orders.filter(
    (order) => order.buyer_email === user.email || order.seller_email === user.email
  );

  if (myOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-20">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold">No orders yet</h3>
          <p className="text-muted-foreground font-body text-sm mt-2">
            Your purchases and sales will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">My Orders</h1>
        <p className="text-muted-foreground font-body mt-2">
          Track your purchases and sales with instant payment release
        </p>
      </div>

      <div className="space-y-4">
        {myOrders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
          const PaymentIcon = paymentStatus.icon;
          const isBuyer = order.buyer_email === user.email;
          const isSeller = order.seller_email === user.email;
          const canConfirmDelivery = isBuyer && order.status === 'delivered' && !order.delivery_confirmed && order.payment_status === 'held_in_escrow';
          const canRateCourier = isBuyer && order.status === 'delivered' && order.delivery_method !== 'self_collect';

          return (
            <div key={order.id} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold">{order.artwork_title || "Artwork"}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-body">
                    <Badge className={`${status.color} text-xs gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </Badge>
                    <Badge className={`${paymentStatus.color} text-xs gap-1`}>
                      <PaymentIcon className="w-3 h-3" /> {paymentStatus.label}
                    </Badge>
                    <span>{deliveryLabels[order.delivery_method] || order.delivery_method}</span>
                    <span>{format(new Date(order.created_date), "MMM d, yyyy")}</span>
                  </div>
                  {order.delivery_address && (
                    <p className="text-xs text-muted-foreground font-body mt-2">
                      Delivery: {order.delivery_address}
                    </p>
                  )}

                  {order.delivery_confirmed && (
                    <p className="text-xs text-green-600 font-body mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Delivery confirmed on {format(new Date(order.delivery_confirmed_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary text-lg">
                    ZMW {order.amount?.toLocaleString()}
                  </p>
                  {order.payment_status === 'held_in_escrow' ? (
                    <p className="text-xs text-blue-600 font-body">Held until delivery</p>
                  ) : order.payment_status === 'released' ? (
                    <p className="text-xs text-green-600 font-body">Payment released</p>
                  ) : (
                    <p className="text-xs text-muted-foreground font-body">
                      {isBuyer ? 'Pay on delivery' : 'Awaiting payment'}
                    </p>
                  )}
                  
                  {canConfirmDelivery && (
                    <Button
                      onClick={() => handleConfirmDelivery(order.id)}
                      size="sm"
                      className="mt-2 w-full rounded-full"
                      disabled={confirmDeliveryMutation.isPending}
                    >
                      {confirmDeliveryMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Delivery
                        </>
                      )}
                    </Button>
                  )}

                  {canRateCourier && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => setRatingModalOrder(order)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Rate Courier
                      </Button>
                      <Button
                        onClick={() => setGrievanceModalOrder(order)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-xs"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Issue?
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ratingModalOrder && (
        <CourierRatingModal 
          order={ratingModalOrder} 
          onClose={() => {
            setRatingModalOrder(null);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          }} 
        />
      )}

      {grievanceModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <h2 className="font-playfair font-bold text-lg text-foreground mb-4">
              Report an Issue
            </h2>
            <GrievanceSubmitForm 
              orderId={grievanceModalOrder.id}
              onSuccess={() => setGrievanceModalOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}