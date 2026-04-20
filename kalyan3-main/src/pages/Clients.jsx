import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Plus, Edit2, Trash2, Mail, Phone, Briefcase } from 'lucide-react';

const Clients = () => {
  const { data: clients, loading, addRecord, updateRecord, deleteRecord } = useData('clients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const openModal = (client = null) => {
    if (client) {
      setEditingId(client.id);
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone || '');
      setCompany(client.company || '');
    } else {
      setEditingId(null);
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientData = { name, email, phone, company };
    
    if (editingId) {
      await updateRecord(editingId, clientData);
    } else {
      await addRecord(clientData);
    }
    closeModal();
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your freelancer client connections.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-800 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first client to start creating invoices.</p>
            <button onClick={() => openModal()} className="text-primary-600 dark:text-primary-500 font-medium hover:underline">
              Create Client
            </button>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-800 hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(client)} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteRecord(client.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 flex items-center justify-center font-bold text-xl mb-4">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{client.name}</h3>
              {client.company && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Briefcase size={14} /> {client.company}
                </div>
              )}
              
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-dark-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="text-gray-400" />
                  <a href={`mailto:${client.email}`} className="hover:text-primary-600 dark:hover:text-primary-400 break-all">{client.email}</a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="text-gray-400" />
                    <a href={`tel:${client.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">{client.phone}</a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? 'Edit Client' : 'New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Client Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name (Optional)</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number (Optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">
                  {editingId ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
