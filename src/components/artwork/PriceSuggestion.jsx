import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function PriceSuggestion({ category, currentPrice }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) return;

    const fetchSuggestion = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await base44.functions.invoke('suggestArtworkPrice', {
          category
        });
        setSuggestion(response.data);
      } catch (err) {
        setError('Could not fetch price suggestion');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, [category]);

  if (!suggestion && !loading) return null;

  const priceMatch = suggestion && currentPrice 
    ? Math.abs(currentPrice - suggestion.suggested_price) / suggestion.suggested_price <= 0.1
    : false;

  return (
    <div className="mt-3 p-3 rounded-lg bg-secondary border border-border text-xs space-y-2">
      <div className="flex items-start gap-2">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">Analyzing market data...</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <span className="text-yellow-700">{error}</span>
          </>
        ) : suggestion?.suggested_price ? (
          <>
            <TrendingUp className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold">
                  Suggested: ZMW {suggestion.suggested_price.toLocaleString()}
                </span>
                <Badge className={`text-xs ${
                  suggestion.confidence === 'high' 
                    ? 'bg-green-500/10 text-green-700'
                    : suggestion.confidence === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-700'
                    : 'bg-gray-500/10 text-gray-700'
                }`}>
                  {suggestion.confidence} confidence
                </Badge>
              </div>
              {priceMatch && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Your price is competitive</span>
                </div>
              )}
              <ul className="text-muted-foreground space-y-0.5 mt-2">
                {suggestion.reasoning.map((reason, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}