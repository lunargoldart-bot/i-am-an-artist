import React, { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CourierRatingModal({ order, onClose }) {
  const [rating, setRating] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [packageCondition, setPackageCondition] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setLoading(true);
    try {
      const user = await firebaseClient.auth.me();
      
      // Create courier review
      await firebaseClient.entities.CourierReview.create({
        order_id: order.id,
        courier_id: order.courier_id,
        courier_name: order.courier_name,
        reviewer_email: user.email,
        reviewer_name: user.full_name,
        rating,
        delivery_speed: deliverySpeed || rating,
        professionalism: professionalism || rating,
        package_condition: packageCondition || rating,
        feedback: feedback || '',
        was_on_time: rating >= 4
      });

      // Update courier ratings
      await firebaseClient.functions.invoke('processReviews', {
        entity_type: 'courier',
        courier_id: order.courier_id
      });

      toast.success('Thank you for your feedback!');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="text-sm font-semibold text-foreground mb-2 block">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star 
              className={`w-6 h-6 ${star <= value ? 'fill-gold text-gold' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair font-bold text-lg text-foreground">Rate Your Delivery</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Help us improve service quality by rating {order.courier_name}
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <StarRating 
            value={rating} 
            onChange={setRating}
            label="Overall Rating"
          />
          
          <StarRating 
            value={deliverySpeed} 
            onChange={setDeliverySpeed}
            label="Delivery Speed"
          />
          
          <StarRating 
            value={professionalism} 
            onChange={setProfessionalism}
            label="Professionalism"
          />
          
          <StarRating 
            value={packageCondition} 
            onChange={setPackageCondition}
            label="Package Condition"
          />

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Additional Feedback (Optional)
            </label>
            <Textarea 
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="h-20 bg-background border-border text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            variant="outline" 
            className="flex-1 border-border" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 gold-gradient text-background font-semibold"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}