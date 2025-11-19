import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ArrowRight, Shield, Zap, Target, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { StrategyResponse } from '../types';

interface ResponseCardProps {
  response: StrategyResponse;
  onCopy: (text: string) => void;
  onSimulate: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ response, onCopy, onSimulate }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response.replyText);
    onCopy(response.replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrategyStyle = (type: string) => {
    switch (type) {
      case 'recommended': return { 
        borderColor: 'border-emerald-500', 
        badgeBg: 'bg-emerald-500', 
        badgeText: 'text-emerald-950', 
        accent: 'text-emerald-400',
        icon: <Target size={12} /> 
      };
      case 'bold': return { 
        borderColor: 'border-fuchsia-500', 
        badgeBg: 'bg-fuchsia-500', 
        badgeText: 'text-fuchsia-950', 
        accent: 'text-fuchsia-400',
        icon: <Zap size={12} /> 
      };
      case 'safe': return { 
        borderColor: 'border-blue-500', 
        badgeBg: 'bg-blue-500', 
        badgeText: 'text-blue-950', 
        accent: 'text-blue-400',
        icon: <Shield size={12} /> 
      };
      case 'caution': return { 
        borderColor: 'border-orange-500', 
        badgeBg: 'bg-orange-500', 
        badgeText: 'text-orange-950', 
        accent: 'text-orange-400',
        icon: <AlertTriangle size={12} /> 
      };
      default: return { 
        borderColor: 'border-slate-500', 
        badgeBg: 'bg-slate-500', 
        badgeText: 'text-slate-950', 
        accent: 'text-slate-400',
        icon: <Info size={12} /> 
      };
    }
  };

  const style = getStrategyStyle(response.strategyType);

  return (
    <div className="bg-[#0f172a] rounded-lg border border-white/10 flex flex-col h-full relative overflow-hidden group transition-all duration-300 hover:border-white/20">
      
      {/* Top Accent Line */}
      <div className={`w-full h-1 ${style.badgeBg}`}></div>
      
      {/* Header Badge */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${style.badgeBg} ${style.badgeText}`}>
          {style.icon}
          {response.strategyType}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-slate-500`}>
          Risk: {response.riskLevel}
        </span>
      </div>

      {/* Message Body */}
      <div className="p-6">
        <div className="bg-[#020617] rounded p-5 border border-white/5 relative group/text hover:border-white/10 transition-colors">
          <p className="text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap font-medium font-sans">
            {response.replyText}
          </p>
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-white text-black rounded hover:bg-slate-200 transition-all opacity-0 group-hover/text:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Analysis */}
      <div className="px-6 pb-2 flex-1 flex flex-col gap-4">
        <div className="space-y-4">
          
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
               Reasoning
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">{response.reasoning}</p>
          </div>

          <div>
             <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${style.accent}`}>
               Predicted Outcome
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">{response.predictedOutcome}</p>
          </div>

          {/* Expandable Section */}
          <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden space-y-4">
                <div className="pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Risk Factors
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{response.riskExplanation}</p>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Follow-Up
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{response.followUp}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 mt-auto flex gap-3 border-t border-white/5">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors flex items-center gap-2"
        >
          {expanded ? (
              <>Hide <ChevronUp size={14}/></>
          ) : (
              <>Details <ChevronDown size={14}/></>
          )}
        </button>
        <button 
          onClick={onSimulate}
          className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-slate-200 rounded transition-all flex items-center justify-center gap-2"
        >
          Simulate
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ResponseCard;