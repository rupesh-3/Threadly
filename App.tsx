import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Heart, Users, AlertOctagon, DollarSign, MessageSquare, Sparkles, Clock, Settings, LayoutDashboard, Home, LogOut, Zap, MessageCircle, Command, ChevronRight } from 'lucide-react';
import { generateThreadlyAnalysis } from './services/geminiService';
import { ThreadlyResponse, ScenarioType, FeedbackEntry, CopiedResponse } from './types';
import ResponseCard from './components/ResponseCard';
import SimulatorModal from './components/SimulatorModal';
import Dashboard from './components/Dashboard';

// Constants
const SCENARIOS: { id: ScenarioType; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: 'Professional', label: 'Professional', icon: <Briefcase size={20} />, desc: 'Work & Networking', color: 'text-blue-400' },
  { id: 'Personal', label: 'Personal', icon: <Users size={20} />, desc: 'Friends & Social', color: 'text-emerald-400' },
  { id: 'Romantic', label: 'Romantic', icon: <Heart size={20} />, desc: 'Dating & Partners', color: 'text-rose-400' },
  { id: 'Family', label: 'Family', icon: <Home size={20} />, desc: 'Parents & Relatives', color: 'text-amber-400' },
  { id: 'Conflict', label: 'Conflict', icon: <AlertOctagon size={20} />, desc: 'Tension & Disputes', color: 'text-red-400' },
  { id: 'Sales', label: 'Sales', icon: <DollarSign size={20} />, desc: 'Deals & Pitches', color: 'text-violet-400' },
];

const Logo = () => (
  <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded font-display font-bold text-lg tracking-tighter">
    Th
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'settings'>('home');
  const [history, setHistory] = useState('');
  const [scenario, setScenario] = useState<ScenarioType>('Professional');
  const [tone, setTone] = useState(50);
  const [userContext, setUserContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreadlyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [selectedSimResponse, setSelectedSimResponse] = useState<any>(null);

  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);
  const [copiedResponses, setCopiedResponses] = useState<CopiedResponse[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedFeedback = localStorage.getItem('threadly_feedback');
    if (savedFeedback) setFeedbackHistory(JSON.parse(savedFeedback));
    
    const savedCopied = localStorage.getItem('threadly_copied');
    if (savedCopied) setCopiedResponses(JSON.parse(savedCopied));
  }, []);

  useEffect(() => {
    localStorage.setItem('threadly_feedback', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  useEffect(() => {
    localStorage.setItem('threadly_copied', JSON.stringify(copiedResponses));
  }, [copiedResponses]);

  // Scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAnalyze = async () => {
    if (!history.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await generateThreadlyAnalysis(history, scenario, tone, userContext);
      setResult(data);
    } catch (err) {
      setError("Connection interrupted. Check your inputs and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    showToast("Response copied to clipboard");
    const newCopy: CopiedResponse = {
      id: crypto.randomUUID(),
      copiedAt: new Date().toISOString(),
      responseText: text,
      scenario,
      tone,
      feedbackGiven: false
    };
    setCopiedResponses(prev => [newCopy, ...prev]);
  };

  const handleSimulate = (response: any) => {
    setSelectedSimResponse(response);
    setIsSimOpen(true);
  };

  const addMockFeedback = () => {
    const newFeedback: FeedbackEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      scenario: SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)].id,
      tone: Math.floor(Math.random() * 100),
      responseType: 'recommended',
      outcome: Math.random() > 0.3 ? 'great' : Math.random() > 0.5 ? 'okay' : 'bad'
    };
    setFeedbackHistory(prev => [...prev, newFeedback]);
    showToast("Mock data injected");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      
      {/* Technical Background */}
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('home')}>
            <Logo />
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Threadly
            </span>
          </div>
          
          <nav className="flex items-center gap-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  activeView === item.id 
                  ? 'text-white bg-white/10' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <item.icon size={18} />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        
        {activeView === 'home' && (
          <div className="space-y-12 animate-slide-up">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 py-10">
              <h2 className="text-5xl sm:text-7xl font-display font-extrabold tracking-tighter text-white leading-[0.95]">
                REPLY LIKE<br />
                <span className="text-slate-500">A STRATEGIST</span>
              </h2>
              
              <p className="text-lg text-slate-400 max-w-xl mx-auto font-light">
                Advanced context analysis for your messages. Eliminate overthinking.
              </p>
            </div>

            {/* Main Input Card */}
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-1 sm:p-8 space-y-8">
                
                {/* Input Area */}
                <div className="space-y-3 px-4 pt-4 sm:px-0 sm:pt-0">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <MessageSquare size={14} className="text-white" />
                      Source History
                    </label>
                    <span className="text-xs font-mono text-slate-600">PASTE MESSAGES</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                      placeholder="Paste conversation history here..."
                      className="w-full h-48 p-4 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-0 transition-all resize-none text-base font-mono leading-relaxed scrollbar-hide"
                    />
                    <div className="absolute bottom-3 right-3 pointer-events-none">
                      <div className="text-[10px] font-mono text-slate-600">
                         {history.length} CHARS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Grid */}
                <div className="space-y-4 px-4 sm:px-0">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Command size={14} className="text-white" />
                    Select Protocol
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {SCENARIOS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setScenario(s.id)}
                        className={`group p-3 rounded-lg border text-left transition-all duration-200 h-full flex flex-col justify-between gap-2 ${
                          scenario === s.id 
                          ? 'border-white bg-white text-black' 
                          : 'border-white/5 bg-[#020617] text-slate-500 hover:border-white/20 hover:text-slate-300'
                        }`}
                      >
                        <div className={`${scenario === s.id ? 'text-black' : s.color}`}>
                          {s.icon}
                        </div>
                        <div>
                          <div className="font-display font-bold text-sm leading-none">
                            {s.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-0 pb-4 sm:pb-0">
                  
                  {/* Tone Slider */}
                  <div className="space-y-4 p-4 rounded-xl bg-[#020617] border border-white/5">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tone Calibration</label>
                       <div className="font-mono text-xs text-white">
                          {tone < 33 ? "CASUAL" : tone < 66 ? "BALANCED" : "FORMAL"}
                       </div>
                    </div>
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="absolute h-full bg-white" style={{ width: `${tone}%` }}></div>
                       <input
                        type="range"
                        min="0"
                        max="100"
                        value={tone}
                        onChange={(e) => setTone(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Additional Context */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Context Override <span className="text-slate-700 font-normal">(Optional)</span></label>
                      <input 
                        type="text"
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="Ex: 'My boss', 'First date'..."
                        className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-0 outline-none transition-all font-mono text-sm"
                      />
                   </div>
                </div>

                {/* Action Button */}
                <div className="px-4 sm:px-0 pb-4 sm:pb-0">
                  <button
                    onClick={handleAnalyze}
                    disabled={!history.trim() || loading}
                    className={`w-full py-4 rounded-xl font-display font-bold text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-3 ${
                      !history.trim() || loading
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-slate-200'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin"></div>
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-current" />
                        INITIATE ANALYSIS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg flex items-center gap-3 text-sm font-mono">
                <AlertOctagon size={16} />
                {error}
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div ref={resultsRef} className="space-y-8 animate-fade-in pb-20 pt-8 border-t border-white/10">
                
                {/* Analysis Summary */}
                <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                      <Sparkles size={20} className="text-white" />
                      STRATEGIC REPORT
                    </h3>
                    <div className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border ${
                      result.analysis.urgency === 'high' ? 'bg-red-950/30 border-red-800 text-red-400' :
                      result.analysis.urgency === 'medium' ? 'bg-amber-950/30 border-amber-800 text-amber-400' :
                      'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                    }`}>
                      Urgency: {result.analysis.urgency}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Sentiment Analysis</p>
                      <p className="font-medium text-white text-lg">{result.analysis.sentiment}</p>
                      <p className="text-slate-400 text-sm">{result.analysis.dynamics}</p>
                    </div>
                     <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Strategic Reasoning</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{result.analysis.urgencyReasoning}</p>
                    </div>
                  </div>
                </div>

                {/* Response Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {result.responses.map((resp, idx) => (
                    <ResponseCard 
                      key={idx}
                      response={resp}
                      onCopy={(text) => handleCopy(text, resp.strategyType)}
                      onSimulate={() => handleSimulate(resp)}
                    />
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {activeView === 'dashboard' && (
           <div className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white">Performance</h2>
                    <p className="text-slate-400 font-mono text-sm mt-1">METRICS & INSIGHTS</p>
                  </div>
                   <button onClick={addMockFeedback} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-white transition-colors border border-white/10">
                    + MOCK DATA
                   </button>
              </div>
              <Dashboard feedbackHistory={feedbackHistory} totalAnalyses={feedbackHistory.length + 5} />
           </div>
        )}

        {activeView === 'settings' && (
          <div className="max-w-2xl mx-auto bg-[#0f172a] border border-white/10 rounded-2xl p-8 space-y-8 animate-slide-up">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">System Settings</h2>
              <p className="text-slate-400 text-sm mt-1">Data Management Protocol</p>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between py-4 border-b border-white/5">
                 <div>
                   <h3 className="font-medium text-white text-sm">Local Storage</h3>
                   <p className="text-xs text-slate-500 mt-1">Device-only persistence.</p>
                 </div>
                 <div className="text-right px-4 py-2 rounded bg-[#020617] border border-white/10">
                   <span className="text-lg font-mono font-bold text-white block">{feedbackHistory.length}</span>
                   <span className="text-[10px] uppercase tracking-wider text-slate-500">Records</span>
                 </div>
               </div>

               <div className="pt-4">
                 <button 
                    onClick={() => {
                      if(window.confirm("Confirm deletion of all local data?")) {
                        setFeedbackHistory([]);
                        setCopiedResponses([]);
                        localStorage.removeItem('threadly_feedback');
                        localStorage.removeItem('threadly_copied');
                        showToast("Database purged.");
                      }
                    }}
                    className="flex items-center justify-center gap-2 text-red-400 hover:bg-red-950/20 hover:text-red-300 px-6 py-3 rounded-lg transition-colors w-full border border-red-900/30 text-sm font-bold uppercase tracking-wider"
                 >
                   <LogOut size={16} />
                   Purge Local Data
                 </button>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          <span className="font-bold text-sm font-mono uppercase">{toastMessage}</span>
        </div>
      )}

      {/* Simulator Modal */}
      <SimulatorModal 
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        selectedResponse={selectedSimResponse}
        simulatorData={result ? result.simulator : { theirResponse: '', yourFollowUp: '', finalReaction: '' }} 
      />
      
    </div>
  );
};

export default App;