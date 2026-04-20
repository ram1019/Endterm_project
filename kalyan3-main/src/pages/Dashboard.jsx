import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, DollarSign, Activity, CheckCircle } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

const Dashboard = () => {
  const { data: clients, loading: cLoad } = useData('clients');
  const { data: invoices, loading: iLoad } = useData('invoices');
  const { data: expenses, loading: eLoad } = useData('expenses');

  const loading = cLoad || iLoad || eLoad;

  const { totalIncome, totalExpenses, activeClients, pendingInvoices, chartData } = useMemo(() => {
    if (loading) return { totalIncome: 0, totalExpenses: 0, activeClients: 0, pendingInvoices: 0, chartData: [] };

    const income = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + Number(inv.total), 0);
    const exps = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const pending = invoices.filter(i => i.status !== 'Paid').length;
    
    // Generate mock 30-day chart data since real timeline might be empty for demo
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(new Date(), 29 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const dayIncome = invoices.filter(inv => inv.date === dateStr && inv.status === 'Paid')
                                .reduce((s, inv) => s + Number(inv.total), 0);
      const dayExpense = expenses.filter(exp => exp.date === dateStr)
                                 .reduce((s, exp) => s + Number(exp.amount), 0);

      // If no data exists, we'll just show 0, or mock random points to make chart look good if they want a demo feel.
      // But for production, stick to real numbers.
      return {
        date: format(d, 'MMM dd'),
        income: dayIncome,
        expenses: dayExpense
      };
    });

    return { 
      totalIncome: income, 
      totalExpenses: exps, 
      activeClients: clients.length, 
      pendingInvoices: pending,
      chartData: last30Days
    };
  }, [clients, invoices, expenses, loading]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-dark-800 rounded-2xl w-full"></div>;

  const netProfit = totalIncome - totalExpenses;

  const statCards = [
    { title: 'Total Revenue', value: `$${totalIncome.toFixed(2)}`, icon: <DollarSign size={24} />, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { title: 'Net Profit', value: `$${netProfit.toFixed(2)}`, icon: <Activity size={24} />, color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' },
    { title: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}`, icon: <FileText size={24} />, color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    { title: 'Active Clients', value: activeClients, icon: <Users size={24} />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Cash Flow (Last 30 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Action</h3>
            <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">{pendingInvoices}</span>
          </div>
          
          <div className="space-y-4">
            {invoices.filter(i => i.status !== 'Paid').slice(0, 5).map(invoice => {
              const client = clients.find(c => c.id === invoice.client_id);
              return (
                <div key={invoice.id} className="p-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-900 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">#{invoice.invoice_number}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{client?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">${Number(invoice.total).toFixed(2)}</p>
                    <p className={`text-xs font-medium ${invoice.status === 'Sent' ? 'text-blue-500' : 'text-orange-500'}`}>{invoice.status}</p>
                  </div>
                </div>
              );
            })}
            
            {pendingInvoices === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-primary-500" />
                <p>All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
