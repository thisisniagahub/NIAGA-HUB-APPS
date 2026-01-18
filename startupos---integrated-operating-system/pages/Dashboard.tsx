
import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { MOCK_KPIS } from '../constants';
import * as Icons from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { realtime } from '../services/realtimeService';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/layout/Header';

const data = [
  { name: 'Jan', mr: 4000, amt: 2400 },
  { name: 'Feb', mr: 3000, amt: 2210 },
  { name: 'Mar', mr: 2000, amt: 2290 },
  { name: 'Apr', mr: 2780, amt: 2000 },
  { name: 'May', mr: 1890, amt: 2181 },
  { name: 'Jun', mr: 2390, amt: 2500 },
  { name: 'Jul', mr: 3490, amt: 2100 },
];

interface Activity {
    id: number;
    text: string;
    time: string;
    type: string;
}

export const Dashboard: React.FC = () => {
    const { addToast } = useToast();
    const [activities, setActivities] = useState<Activity[]>([
        { id: 1, text: 'New user signup @tech_guru', time: '2 mins ago', type: 'signup' },
        { id: 2, text: 'Server usage spike 85%', time: '15 mins ago', type: 'alert' },
        { id: 3, text: 'Payment received $49.00', time: '1 hour ago', type: 'payment' },
        { id: 4, text: 'Deployed v2.0.1 to Prod', time: '3 hours ago', type: 'deploy' },
    ]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    useEffect(() => {
        realtime.on('activity', (newActivity: any) => {
            const formatted = {
                id: Date.now(),
                text: newActivity.details || `${newActivity.type} by ${newActivity.user}`,
                time: newActivity.time,
                type: newActivity.type.toLowerCase()
            };
            setActivities(prev => [formatted, ...prev.slice(0, 4)]);
        });
    }, []);

  return (
    <div className="space-y-8">
      <Header 
        title="Founder Control Center" 
        subtitle={`Welcome back. It is ${today}.`} 
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_KPIS.map((kpi) => (
          <Card key={kpi.id} className="relative group hover:border-primary-600/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-neutral-400 text-sm font-medium">{kpi.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                kpi.trendDirection === 'up' 
                  ? 'bg-green-900/30 text-green-400' 
                  : kpi.trendDirection === 'down' 
                  ? 'bg-red-900/30 text-red-400' 
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue Growth" className="lg:col-span-2">
          {/* Fixed height container for Recharts */}
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <Area type="monotone" dataKey="mr" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorMr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Live Activity" className="lg:col-span-1 border-l-2 border-l-primary-600/20">
          <div className="space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start animate-slide-in">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                   {act.type === 'alert' ? <Icons.AlertTriangle size={14} className="text-red-400" /> :
                    act.type === 'payment' ? <Icons.DollarSign size={14} className="text-green-400" /> :
                    <Icons.Activity size={14} className="text-primary-400" />}
                </div>
                <div>
                  <p className="text-sm text-white">{act.text}</p>
                  <p className="text-xs text-neutral-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-neutral-400 hover:text-white border-t border-neutral-800 mt-4 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Live Connection Active
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};