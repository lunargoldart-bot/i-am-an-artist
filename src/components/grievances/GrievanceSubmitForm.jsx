import React, { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const grievanceTypes = [
  { value: 'delivery', label: 'ðŸ“¦ Delivery Issue' },
  { value: 'quality', label: 'ðŸŽ¨ Quality Issue' },
  { value: 'payment', label: 'ðŸ’³ Payment Issue' },
  { value: 'courier', label: 'ðŸšš Courier Problem' },
  { value: 'artwork', label: 'ðŸ–¼ï¸ Artwork Concern' },
  { value: 'other', label: 'â“ Other' },
];

export default function GrievanceSubmitForm({ orderId, onSuccess }) {
  const [grievanceType, setGrievanceType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [solutions, setSolutions] = useState([]);

  const handleSubmit = async () => {
    if (!grievanceType || !description.trim()) {
      toast.error('Please select a type and describe your issue');
      return;
    }

    setLoading(true);
    try {
      const response = await firebaseClient.functions.invoke('handleGrievance', {
        orderId,
        grievanceType,
        description
      });

      setAiResponse(response.data.ai_response);
      setSolutions(response.data.solutions);
      setSubmitted(true);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 border-green-500/50 bg-green-500/5">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-700 mb-2">We've Received Your Feedback</h3>
            <p className="text-sm text-foreground mb-4">{aiResponse}</p>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-foreground mb-3">Suggested Solutions:</p>
          <ul className="space-y-2">
            {solutions.map((solution, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">{idx + 1}.</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Our support team will follow up within 24 hours with next steps.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
    <label className="text-sm font-semibold text-foreground mb-2 block">
      What's the issue?
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {grievanceTypes.map(type => (
        <button
          key={type.value}
          onClick={() => setGrievanceType(type.value)}
          className={`p-4 rounded-lg border text-left text-sm transition-all ${
            grievanceType === type.value 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">
          Tell us what happened
        </label>
        <Textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail..."
          className="min-h-24 bg-background border-border"
        />
      </div>

      <Button 
        className="w-full green-gradient text-primary-foreground font-semibold h-11"
        onClick={handleSubmit}
        disabled={loading || !grievanceType || !description.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 mr-2" />
            Submit Grievance
          </>
        )}
      </Button>
    </div>
  );
}