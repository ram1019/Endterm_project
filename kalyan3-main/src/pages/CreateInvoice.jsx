import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Save, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';

const CreateInvoice = () => {
  const { data: clients } = useData('clients');
  const { data: invoices, addRecord, updateRecord } = useData('invoices');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')); // 14 days default
  const [status, setStatus] = useState('Draft');
  
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, rate: 0 }
  ]);

  const [taxRate, setTaxRate] = useState(0);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (editId && invoices.length > 0) {
      const inv = invoices.find(i => i.id === editId);
      if (inv) {
        setInvoiceNumber(inv.invoice_number);
        setClientId(inv.client_id);
        setDate(inv.date);
        setDueDate(inv.due_date);
        setStatus(inv.status);
        setItems(inv.items || []);
        setTaxRate(inv.tax_rate || 0);
      }
    }
  }, [editId, invoices]);

  // Advanced React: useMemo to optimize calculations
  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = sub * (taxRate / 100);
    const tot = sub + tax;
    return { subtotal: sub, taxAmount: tax, total: tot };
  }, [items, taxRate]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!clientId) {
      alert("Please select a client");
      return;
    }
    
    const invoiceData = {
      invoice_number: invoiceNumber,
      client_id: clientId,
      date,
      due_date: dueDate,
      status,
      items,
      tax_rate: taxRate,
      subtotal,
      total
    };

    if (editId) {
      await updateRecord(editId, invoiceData);
    } else {
      await addRecord(invoiceData);
    }
    navigate('/invoices');
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) return;
    
    // Create professional looking print template before printing
    const opt = {
      margin: 0.5,
      filename: `${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="pb-16 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
         <h1 className="text-3xl font-bold text-black">{editId ? 'Edit Invoice' : 'New Invoice'}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF} 
            className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-700 transition"
          >
            <Download size={18} />
            Generate PDF
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center gap-2 transition"
          >
            <Save size={18} />
            {editId ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Main Invoice Editor */}
          <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 mb-2">Billed To</label>
                <select 
                  value={clientId} 
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-lg font-semibold bg-transparent border-b-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 focus:outline-none pb-2 dark:text-white"
                >
                  <option value="" disabled>Select a Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                </select>
                {selectedClient && (
                  <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                    {selectedClient.company && <div>{selectedClient.company}</div>}
                    <div>{selectedClient.email}</div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Invoice #</label>
                    <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 focus:outline-none pb-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 focus:outline-none pb-2">
                       <option value="Draft">Draft</option>
                       <option value="Sent">Sent</option>
                       <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mt-4 mb-2">Issue Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 focus:outline-none pb-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mt-4 mb-2">Due Date</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 focus:outline-none pb-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-dark-700">
                    <th className="pb-3 text-sm font-medium text-gray-500">Item Description</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 w-24 text-right">Qty</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 w-32 text-right">Rate</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 w-32 text-right">Amount</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-800">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group">
                      <td className="py-4">
                        <input type="text" placeholder="Description of work..." value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full bg-transparent focus:outline-none font-medium text-gray-900 dark:text-white" />
                      </td>
                      <td className="py-4">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-full bg-transparent focus:outline-none text-right text-gray-900 dark:text-white" />
                      </td>
                      <td className="py-4">
                        <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))} className="w-full bg-transparent focus:outline-none text-right text-gray-900 dark:text-white" />
                      </td>
                      <td className="py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleAddItem} className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 px-4 py-2 rounded-lg transition-colors">
              <Plus size={18} />
              Add Line Item
            </button>

            <div className="flex justify-end mt-12 border-t border-gray-100 dark:border-dark-700 pt-8">
              <div className="w-64 space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-2">Tax Rate <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-16 bg-gray-50 dark:bg-dark-900 px-2 py-1 rounded text-right border border-gray-200 dark:border-dark-700" /> %</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-2xl text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-dark-700">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time PDF Preview / Print Template */}
        <div className="hidden xl:block">
          <div className="sticky top-8">
            <h3 className="text-lg font-bold mb-4 text-black">Print Preview</h3>
            <div className="bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden transform scale-90 origin-top-left flex flex-col pointer-events-none" style={{ width: '210mm', height: '297mm', color: '#000' }} ref={invoiceRef}>
              {/* PDF Content Template */}
              <div className="p-12 flex-1">
                <div className="flex justify-between items-start mb-16">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">INVOICE</h1>
                    <p className="text-gray-500 font-medium">#{invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-primary-600 mb-1">FreelanceFlow</div>
                    <p className="text-sm text-gray-500">creator@freelanceflow.com</p>
                  </div>
                </div>

                <div className="flex justify-between mb-12">
                  <div>
                    <p className="text-sm font-semibold text-gray-400 uppercase mb-2">Billed To</p>
                    {selectedClient ? (
                        <>
                          <p className="font-bold text-lg text-gray-900">{selectedClient.name}</p>
                          <p className="text-gray-600">{selectedClient.company}</p>
                          <p className="text-gray-600">{selectedClient.email}</p>
                        </>
                    ) : (
                      <p className="text-gray-400 italic">No client selected</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-400 uppercase mb-1">Issue Date</p>
                      <p className="font-medium text-gray-900">{format(new Date(date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-400 uppercase mb-1">Due Date</p>
                      <p className="font-medium text-gray-900">{format(new Date(dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                <table className="w-full text-left mb-8 border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="py-3 font-bold text-gray-900">Description</th>
                      <th className="py-3 font-bold text-gray-900 text-right">Qty</th>
                      <th className="py-3 font-bold text-gray-900 text-right">Rate</th>
                      <th className="py-3 font-bold text-gray-900 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-4 font-medium">{item.description || 'Item description'}</td>
                        <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-600">${item.rate.toFixed(2)}</td>
                        <td className="py-4 text-right font-bold text-gray-900">${(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-1/2">
                    <div className="flex justify-between py-2 text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-gray-600">
                      <span>Tax ({taxRate}%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-black text-gray-900 border-t-2 border-gray-900 mt-2">
                      <span>Total Due</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-8 mt-auto text-center">
                <p className="font-medium text-gray-600">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
