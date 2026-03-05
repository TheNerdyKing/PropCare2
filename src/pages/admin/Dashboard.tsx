import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, [token]);

  if (!stats) return null;

  const cards = [
    { label: "Total Tickets", value: stats.totalTickets, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%", up: true },
    { label: "Open Tickets", value: stats.openTickets, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: "-5%", up: false },
    { label: "Completed", value: stats.completedTickets, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+18%", up: true },
    { label: "Total Costs", value: `CHF ${stats.totalCosts.toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+2%", up: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Real-time metrics for your property portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-xs font-bold ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>
                {card.trend}
                {card.up ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <p className="text-sm text-gray-500 italic">Activity feed coming soon...</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Portfolio Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Processing Time</span>
              <span className="text-sm font-bold text-gray-900">{stats.avgProcessingTime} Days</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[75%]"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tenant Satisfaction</span>
              <span className="text-sm font-bold text-gray-900">4.8 / 5.0</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
