import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Users, Download, Copy, Link, Video, Image as ImageIcon } from 'lucide-react';
import { MOCK_STATS, ASSETS } from '../services/mockData';
import api from '../services/api';
import { User } from '../types';

interface AffiliateDashboardProps {
  user: User;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user }) => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/affiliate/stats');
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch affiliate stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-20 text-center text-stone-400">Loading your performance data...</div>;

  const currentStats = stats || MOCK_STATS;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-brand-dark">Affiliate Hub</h2>
          <p className="text-stone-600">Welcome back, {user.name}. Here's how your influence is growing.</p>
        </div>
        <button className="bg-brand-accent text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-500 transition-colors">
          Withdraw Funds via Whop
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><DollarSign className="h-5 w-5" /></div>
            <span className="text-xs text-stone-400 font-bold uppercase">Lifetime</span>
          </div>
          <h3 className="text-2xl font-bold text-stone-800">${currentStats.totalEarnings.toLocaleString()}</h3>
          <p className="text-xs text-stone-500 mt-1">Total Earnings</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <span className="text-xs text-stone-400 font-bold uppercase">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-stone-800">${currentStats.pendingPayout.toLocaleString()}</h3>
          <p className="text-xs text-stone-500 mt-1">Available for Payout</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Users className="h-5 w-5" /></div>
            <span className="text-xs text-green-600 font-bold flex items-center">+{currentStats.recentConversions || 0}</span>
          </div>
          <h3 className="text-2xl font-bold text-stone-800">{currentStats.recentConversions || 0}</h3>
          <p className="text-xs text-stone-500 mt-1">Recent Conversions</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><Link className="h-5 w-5" /></div>
          </div>
          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
            <code className="text-sm font-mono text-stone-600 truncate flex-1">ref={user.affiliateId || 'pending'}</code>
            <button className="text-brand-primary hover:text-brand-dark"><Copy className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-6">Revenue Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentStats.revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d5b52" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1d5b52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} prefix="$" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#1d5b52', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1d5b52" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-stone-800 mb-6">Asset Library</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {ASSETS.map(asset => (
              <div key={asset.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group cursor-pointer">
                <div className="h-10 w-10 rounded bg-stone-200 overflow-hidden flex-shrink-0">
                  <img src={asset.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-stone-800 truncate">{asset.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    {asset.type === 'video' && <Video className="h-3 w-3" />}
                    {asset.type === 'image' && <ImageIcon className="h-3 w-3" />}
                    {asset.type === 'copy' && <Copy className="h-3 w-3" />}
                    <span className="capitalize">{asset.type}</span>
                  </div>
                </div>
                <button className="text-stone-400 group-hover:text-brand-primary">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-brand-primary font-bold border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors">
            View All Assets
          </button>
        </div>
      </div>
    </div>
  );
};