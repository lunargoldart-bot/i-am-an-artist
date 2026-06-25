import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Truck, Home, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: Package },
  { key: 'courier_contacted', label: 'Courier Contacted', icon: Truck },
  { key: 'picked_up', label: 'Picked Up', icon: MapPin },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home }
];

export default function OrderTrackingTimeline({ order }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const deliveryUpdates = await base44.entities.DeliveryUpdate.filter({
          order_id: order.id
        });
        setUpdates(deliveryUpdates || []);
      } catch (error) {
        console.error('Error fetching delivery updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.DeliveryUpdate.subscribe((event) => {
      if (event.type === 'create' && event.data?.order_id === order.id) {
        setUpdates(prev => [event.data, ...prev]);
      }
    });

    return unsubscribe;
  }, [order.id]);

  const currentStageIndex = STATUS_STAGES.findIndex(s => s.key === order.status);

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair text-xl font-semibold">Delivery Status</h3>
          <Badge className={
            order.status === 'delivered' 
              ? 'bg-green-500/20 text-green-400' 
              : order.status === 'in_transit' || order.status === 'out_for_delivery'
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary/20 text-secondary-foreground'
          }>
            {STATUS_STAGES.find(s => s.key === order.status)?.label || order.status}
          </Badge>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {STATUS_STAGES.map((stage, idx) => {
            const isActive = idx <= currentStageIndex;
            const isCompleted = idx < currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex items-center gap-2 min-w-max">
                <div className={`
                  p-2 rounded-full transition-all
                  ${isCompleted ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-xs font-medium whitespace-nowrap">{stage.label}</div>
                {idx < STATUS_STAGES.length - 1 && (
                  <div className={`w-8 h-0.5 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Courier Info */}
      {order.courier_name && (
        <Card className="p-4 bg-card border-border">
          <div className="text-sm text-muted-foreground mb-1">Courier</div>
          <div className="font-semibold">{order.courier_name}</div>
          {order.courier_phone && (
            <a href={`tel:${order.courier_phone}`} className="text-primary text-sm hover:underline">
              {order.courier_phone}
            </a>
          )}
        </Card>
      )}

      {/* Update History */}
      {!loading && updates.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h4 className="font-semibold mb-4">Update History</h4>
          <div className="space-y-4">
            {updates.map((update, idx) => (
              <div key={update.id} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                <div className="text-muted-foreground text-sm whitespace-nowrap pt-1">
                  {format(new Date(update.created_date), 'MMM d, h:mm a')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {update.new_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {update.location && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {update.location}
                    </div>
                  )}
                  {update.note && (
                    <div className="text-sm text-foreground mt-1 bg-secondary/30 p-2 rounded">
                      {update.note}
                    </div>
                  )}
                  {update.estimated_delivery_time && (
                    <div className="text-sm text-primary flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Est. delivery: {format(new Date(update.estimated_delivery_time), 'h:mm a')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}