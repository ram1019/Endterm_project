import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Plus, Edit2, Trash2, Tag, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
  const { data: expenses, loading, addRecord, updateRecord, deleteRecord } = useData('expenses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Software');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const categories = ['Software', 'Hardware', 'Marketing', 'Travel', 'Office Supplies', 'Other'];

  const openModal = (expense = null) => {
    if (expense) {
      setEditingId(expense.id);
      setDescription(expense.description);
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date);
    } else {
      setEditingId(null);
      setDescription('');
      setAmount('');
      setCategory('Software');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseData = { description, amount: parseFloat(amount), category, date };
    
    if (editingId) {
      await updateRecord(editingId, expenseData);
    } else {
      await addRecord(expenseData);
    }
    closeModal();
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your business expenses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-dark-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 hidden md:block">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Total:</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">${totalExpenses.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Log Expense
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 shadow-sm border border-gray-100 dark:border-dark-800 rounded-2xl overflow-hidden">
        <div className="md:hidden p-4 border-b border-gray-100 dark:border-dark-700">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Total Expenses</span>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${totalExpenses.toFixed(2)}</span>
        </div>
        
        {expenses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <DollarSign size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses logged</h3>
            <p className="text-gray-500 dark:text-gray-400">Keep track of what you spend to run your business.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-dark-900/50 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar size={14} className="text-gray-400" />
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 inline-flex bg-gray-100 dark:bg-dark-700 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                        <Tag size={12} />
                        {expense.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(expense)} className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-dark-700 rounded-md border border-gray-200 dark:border-dark-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteRecord(expense.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white dark:bg-dark-700 rounded-md border border-gray-200 dark:border-dark-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? 'Edit Expense' : 'Log Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                <input required type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="E.g., Figma Subscription" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount ($) *</label>
                  <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white appearance-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">
                  {editingId ? 'Save Changes' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
