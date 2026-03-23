import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkle, Warning, CheckCircle, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/insights/analyze`);
      setInsights(response.data.insights || []);
      toast.success('AI analysis complete');
    } catch (error) {
      toast.error('Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch(type) {
      case 'warning': return <Warning size={24} weight="fill" className="text-destructive" />;
      case 'success': return <CheckCircle size={24} weight="fill" className="text-secondary" />;
      case 'info': return <Info size={24} weight="fill" className="text-primary" />;
      default: return <Sparkle size={24} weight="fill" className="text-primary" />;
    }
  };

  const getInsightBorderColor = (type) => {
    switch(type) {
      case 'warning': return 'border-destructive/30';
      case 'success': return 'border-secondary/30';
      case 'info': return 'border-primary/30';
      default: return 'border-primary/30';
    }
  };

  return (
    <div className="space-y-8" data-testid="insights-page">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2" data-testid="insights-title">AI Insights</h1>
        <p className="text-muted-foreground">Get intelligent recommendations for your finances</p>
      </div>

      <Card 
        className="bg-surface border border-primary/30 p-8 rounded-none scanline relative overflow-hidden"
        data-testid="ai-analysis-card"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/36040448/pexels-photo-36040448.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/85"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Sparkle size={48} weight="duotone" className="text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">AI-Powered Financial Analysis</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let AI analyze your bills and subscriptions to find unused services, suggest cheaper alternatives, and identify spending patterns.
          </p>
          <Button 
            onClick={analyzeData}
            disabled={loading}
            className="bg-primary text-black hover:bg-primary/90 rounded-none font-semibold px-8 hover-lift mt-4"
            data-testid="analyze-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-black mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkle size={20} weight="bold" className="mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white" data-testid="insights-results-title">Insights & Recommendations</h2>
          <div className="grid grid-cols-1 gap-4">
            {insights.map((insight, index) => (
              <Card 
                key={index}
                className={`bg-surface border p-5 rounded-none ${getInsightBorderColor(insight.type)}`}
                data-testid={`insight-card-${index}`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}