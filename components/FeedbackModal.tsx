import React, { useState, useCallback } from 'react';
import { Star, Send, X, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  responseText: string;
  scenario: string;
}

export interface FeedbackData {
  rating: number; // 1-5 stars
  outcome: 'great' | 'okay' | 'bad';
  helpfulness: 'very' | 'somewhat' | 'not';
  wouldUseAgain: boolean;
  comments: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  responseText,
  scenario,
}) => {
  const [rating, setRating] = useState(0);
  const [outcome, setOutcome] = useState<'great' | 'okay' | 'bad' | null>(null);
  const [helpfulness, setHelpfulness] = useState<'very' | 'somewhat' | 'not' | null>(null);
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');

  const handleSubmit = useCallback(() => {
    if (!rating || !outcome || !helpfulness || wouldUseAgain === null) {
      alert('Please complete all required fields');
      return;
    }

    onSubmit({
      rating,
      outcome,
      helpfulness,
      wouldUseAgain,
      comments,
    });

    // Reset form
    setRating(0);
    setOutcome(null);
    setHelpfulness(null);
    setWouldUseAgain(null);
    setComments('');
  }, [rating, outcome, helpfulness, wouldUseAgain, comments, onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-indigo-400" size={24} />
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Quick Feedback</h2>
              <p className="text-slate-400 text-sm">Help us improve Threadly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Response Preview */}
          <div className="bg-slate-900/50 border border-white/5 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-2">YOUR RESPONSE</p>
            <p className="text-white line-clamp-3 text-sm">"{responseText}"</p>
            <p className="text-xs text-slate-500 mt-2">Scenario: {scenario}</p>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white block">
              Overall Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-3 rounded-lg transition-all ${
                    rating >= star
                      ? 'bg-yellow-500 text-yellow-900'
                      : 'bg-slate-800 text-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {rating === 0 && 'Click stars to rate'}
              {rating === 1 && '😞 Poor - Not helpful'}
              {rating === 2 && '😕 Fair - Somewhat helpful'}
              {rating === 3 && '😐 Good - Helpful'}
              {rating === 4 && '😊 Very Good - Very helpful'}
              {rating === 5 && '🎉 Excellent - Extremely helpful'}
            </p>
          </div>

          {/* Outcome */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white block">
              How did it go? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'great' as const, label: '✨ Great', desc: 'Excellent outcome' },
                { value: 'okay' as const, label: '👍 Okay', desc: 'As expected' },
                { value: 'bad' as const, label: '❌ Bad', desc: 'Did not work' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOutcome(opt.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    outcome === opt.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-sm text-white">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Helpfulness */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white block">
              How helpful was this response? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'very' as const, label: 'Very', icon: '👍' },
                { value: 'somewhat' as const, label: 'Somewhat', icon: '👌' },
                { value: 'not' as const, label: 'Not at all', icon: '👎' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHelpfulness(opt.value)}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    helpfulness === opt.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="font-semibold text-sm text-white">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Would Use Again */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white block">
              Would you use this approach again? <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              {[
                { value: true, label: '✅ Yes', desc: 'Definitely' },
                { value: false, label: '❌ No', desc: 'Probably not' },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setWouldUseAgain(opt.value)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                    wouldUseAgain === opt.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-sm text-white">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <label htmlFor="comments" className="text-sm font-semibold text-white block">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what could improve... (500 characters max)"
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none resize-none"
            />
            <p className="text-xs text-slate-500">{comments.length}/500</p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3">
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Your feedback is anonymous and helps us improve Threadly. We never store conversation content.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={!rating || !outcome || !helpfulness || wouldUseAgain === null}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                rating && outcome && helpfulness && wouldUseAgain !== null
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
