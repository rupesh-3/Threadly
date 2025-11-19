import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FeedbackEntry } from '../types';
import { BarChart2, TrendingUp, MessageSquare } from 'lucide-react';

interface DashboardProps {
  feedbackHistory: FeedbackEntry[];
  totalAnalyses: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Emerald, Amber, Red
const SCENARIO_BAR_COLOR = '#6366f1'; // Indigo

const Dashboard: React.FC<DashboardProps> = ({ feedbackHistory, totalAnalyses }) => {
  
  const outcomeCounts = feedbackHistory.reduce((acc, curr) => {
    acc[curr.outcome] = (acc[curr.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Great', value: outcomeCounts['great'] || 0 },
    { name: 'Okay', value: outcomeCounts['okay'] || 0 },
    { name: 'Not Well', value: outcomeCounts['bad'] || 0 },
  ].filter(d => d.value > 0);

  const scenarioCounts = feedbackHistory.reduce((acc, curr) => {
    acc[curr.scenario] = (acc[curr.scenario] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(scenarioCounts).map(key => ({
    name: key,
    count: scenarioCounts[key]
  }));

  const successRate = feedbackHistory.length > 0 
    ? Math.round(((outcomeCounts['great'] || 0) / feedbackHistory.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            { icon: MessageSquare, label: 'Analyses Run', value: totalAnalyses, color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Success Rate', value: `${successRate}%`, color: 'text-emerald-400' },
            { icon: BarChart2, label: 'Total Feedback', value: feedbackHistory.length, color: 'text-violet-400' }
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Outcome Distribution */}
        <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 h-80 flex flex-col">
          <h3 className="font-bold text-slate-200 mb-6 text-center text-sm uppercase tracking-wider">Outcome Distribution</h3>
          <div className="flex-1 min-h-0">
            {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#f8fafc', borderRadius: '4px' }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm">No feedback data yet</div>
            )}
          </div>
        </div>

        {/* Scenario Breakdown */}
        <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 h-80 flex flex-col">
          <h3 className="font-bold text-slate-200 mb-6 text-center text-sm uppercase tracking-wider">Top Scenarios</h3>
          <div className="flex-1 min-h-0">
            {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                        cursor={{fill: '#1e293b'}}
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#f8fafc', borderRadius: '4px' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
                ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;