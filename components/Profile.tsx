import React, { useState, useMemo } from 'react';
import { User, Mail, Calendar, LogOut, Edit2, Save, X, TrendingUp, MessageSquare } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
  onUpdateProfile: (name: string) => void;
  totalAnalyses: number;
  dailyAnalyses: number;
  feedbackHistoryCount: number;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  onLogout,
  onUpdateProfile,
  totalAnalyses,
  dailyAnalyses,
  feedbackHistoryCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const memberSince = useMemo(() => {
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [user.createdAt]);

  const lastLogin = useMemo(() => {
    const date = new Date(user.lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [user.lastLoginAt]);

  const handleSave = () => {
    if (editedName.trim() && editedName !== user.name) {
      onUpdateProfile(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Profile</h2>
          <p className="text-slate-400 font-mono text-sm mt-1">ACCOUNT & STATISTICS</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/50 text-red-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-red-900/30 flex items-center gap-2"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-display font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-display font-bold text-white bg-[#020617] border border-white/10 rounded-lg px-4 py-2 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  aria-label="Save name"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  aria-label="Cancel editing"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-display font-bold text-white">{user.name}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Edit name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={16} />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar size={16} />
                <span className="text-sm">Member since {memberSince}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <User size={16} />
                <span className="text-sm">Last login: {lastLogin}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: MessageSquare, label: 'Analyses Today', value: dailyAnalyses, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Total Analyses', value: totalAnalyses, color: 'text-emerald-400' },
          { icon: User, label: 'Feedback Given', value: feedbackHistoryCount, color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f172a] p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <div className={`mb-3 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <span className="text-3xl font-display font-bold text-white">{stat.value}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Account Info */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-display font-bold text-white mb-6">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-slate-400 text-sm">User ID</span>
            <span className="text-white font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-slate-400 text-sm">Email</span>
            <span className="text-white text-sm">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-slate-400 text-sm">Account Created</span>
            <span className="text-white text-sm">{memberSince}</span>
          </div>
          <div className="flex justify-between items-center py-4">
            <span className="text-slate-400 text-sm">Last Login</span>
            <span className="text-white text-sm">{lastLogin}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

