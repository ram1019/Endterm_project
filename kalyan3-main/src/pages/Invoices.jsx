import React from 'react';
import { useData } from '../hooks/useData';
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Invoices = () => {
  const { data: invoices, loading } = useData('invoices');
  const { data: clients } = useData('clients');

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your billed work.</p>
        </div>
        <Link 
          to="/invoices/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-800 border-dashed">
             <div className="w-16 h-16 bg-gray-50 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <FileText size={32} />
             </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices created</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start billing your clients by creating your first invoice.</p>
            <Link to="/invoices/new" className="text-primary-600 dark:text-primary-500 font-medium hover:underline">
              Create Invoice
            </Link>
          </div>
        ) : (
          invoices.sort((a, b) => new Date(b.date) - new Date(a.date)).map(invoice => {
            const client = clients?.find(c => c.id === invoice.client_id);
            return (
              <div key={invoice.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-200 dark:hover:border-primary-900 transition-colors cursor-pointer" onClick={() => window.location.href=`/invoices/new?id=${invoice.id}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${invoice.status === 'Paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                    {invoice.status === 'Paid' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">#{invoice.invoice_number}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed to <span className="font-medium text-gray-700 dark:text-gray-300">{client ? client.name : 'Unknown Client'}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Issue Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Amount</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">${Number(invoice.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Invoices;
