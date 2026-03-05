import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function TicketList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch("/api/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "text-blue-600 bg-blue-50 border-blue-100";
      case "IN_PROGRESS": return "text-amber-600 bg-amber-50 border-amber-100";
      case "COMPLETED": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "URGENT": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 text-sm">Manage damage reports and inquiries.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-8 h-16 bg-gray-50/50"></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getUrgencyIcon(ticket.urgency)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{ticket.referenceId}</p>
                        <p className="text-xs text-gray-500 truncate w-48">{ticket.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{ticket.property.name}</p>
                    <p className="text-xs text-gray-500">{ticket.property.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{ticket.contactName}</p>
                    <p className="text-xs text-gray-500">{ticket.contactEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
