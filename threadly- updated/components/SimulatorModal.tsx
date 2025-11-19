import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { StrategyResponse, SimulatorData } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedResponse: StrategyResponse;
  simulatorData: SimulatorData;
}

const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose, selectedResponse, simulatorData }) => {
  const [messages, setMessages] = useState<{ id: number; role: 'user' | 'them'; text: string; visible: boolean }[]>([]);
  const [step, setStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset simulation when opened
  useEffect(() => {
    if (isOpen && selectedResponse) {
      setMessages([
        { id: 1, role: 'user', text: selectedResponse.replyText, visible: false },
        { id: 2, role: 'them', text: simulatorData?.theirResponse || "Usually they would reply here based on the context.", visible: false },
        { id: 3, role: 'user', text: simulatorData?.yourFollowUp || "And you would follow up with this.", visible: false },
        { id: 4, role: 'them', text: simulatorData?.finalReaction || "Ending the interaction.", visible: false },
      ]);
      setStep(0);
    }
  }, [isOpen, selectedResponse, simulatorData]);

  // Sequence the animation
  useEffect(() => {
    if (!isOpen) return;

    if (step < 4) {
      const timer = setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => idx === step ? { ...msg, visible: true } : msg));
        setStep(prev => prev + 1);
      }, step === 0 ? 400 : 1500);
      return () => clearTimeout(timer);
    }
  }, [step, isOpen]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  if (!isOpen || !selectedResponse) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 w-full max-w-sm overflow-hidden flex flex-col h-[80vh] max-h-[800px] relative">
        
        {/* Header */}
        <div className="pt-6 pb-4 px-6 bg-[#0f172a] border-b border-white/5 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5">
               ?
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Simulated User</h3>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wide">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#020617] scrollbar-hide relative">
           {/* Pattern overlay */}
           <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="flex justify-center mb-8 mt-4 relative z-10">
            <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest">
              Simulation Start
            </span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 relative z-10 ${msg.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-[#1e293b] text-slate-200 rounded-2xl rounded-bl-sm border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {step < 4 && step > 0 && (
             <div className="flex justify-start animate-fade-in relative z-10">
               <div className="bg-[#1e293b] rounded-full px-4 py-3 flex gap-1.5 items-center border border-white/5">
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0f172a]">
            <button 
                onClick={() => { setStep(0); setMessages(prev => prev.map(m => ({...m, visible: false}))); }}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold uppercase text-xs tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw size={14} />
                Restart Simulation
            </button>
        </div>
      </div>
    </div>
  );
};

export default SimulatorModal;