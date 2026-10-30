import re

with open('src/components/EmailSettingsView.tsx', 'r') as f:
    content = f.read()

replacement = """import React, { useState, useEffect } from 'react';
import { Mail, Settings, Plus, Trash2, Edit, Save, Check, X } from 'lucide-react';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  smtpServer: string;
  smtpPort: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  desc: string;
  condition: string;
  subject: string;
  body: string;
  attachInvoice: boolean;
  channels: string[];
}

export default function EmailSettingsView() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'templates'>('accounts');
  
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('emailAccounts');
    if (savedAccounts) {
      try { setAccounts(JSON.parse(savedAccounts)); } catch(e) {}
    } else {
      setAccounts([
        { id: '1', name: 'Main Customer Service', email: 'support@slamtech.co.uk', type: 'SMTP', status: 'Active', smtpServer: 'smtp.slamtech.co.uk', smtpPort: '587' }
      ]);
    }

    const savedTemplates = localStorage.getItem('emailTemplates');
    if (savedTemplates) {
      try { setTemplates(JSON.parse(savedTemplates)); } catch(e) {}
    } else {
      setTemplates([
        { id: '1', name: 'Order Dispatched', desc: 'Sent when tracking number is generated', condition: 'Order status changed to Shipped', subject: 'Your Order has been dispatched!', body: 'Hi {{CUSTOMER_NAME}},\\n\\nYour order {{ORDER_ID}} has been shipped via {{CARRIER}}.\\n\\nTracking Number: {{TRACKING_NUMBER}}\\n\\nThanks,\\nSlamTech', attachInvoice: true, channels: ['Amazon', 'eBay', 'Shopify', 'Manual'] },
        { id: '2', name: 'Order Received', desc: 'Confirmation sent upon order sync', condition: 'New order imported', subject: 'Order Received - {{ORDER_ID}}', body: 'Hi {{CUSTOMER_NAME}},\\n\\nWe have received your order {{ORDER_ID}} and are processing it.\\n\\nThanks,\\nSlamTech', attachInvoice: false, channels: ['Shopify', 'Manual'] },
        { id: '3', name: 'Refund Issued', desc: 'Sent when order is cancelled or refunded', condition: 'Order status changed to Cancelled', subject: 'Refund Confirmation - {{ORDER_ID}}', body: 'Hi {{CUSTOMER_NAME}},\\n\\nYour order {{ORDER_ID}} has been refunded.\\n\\nThanks,\\nSlamTech', attachInvoice: false, channels: ['Shopify', 'Manual'] }
      ]);
    }
  }, []);

  const saveAccounts = (newAccounts: EmailAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('emailAccounts', JSON.stringify(newAccounts));
  };

  const saveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(newTemplates));
  };

  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      if (accounts.find(a => a.id === editingAccount.id)) {
        saveAccounts(accounts.map(a => a.id === editingAccount.id ? editingAccount : a));
      } else {
        saveAccounts([...accounts, editingAccount]);
      }
    }
    setEditingAccount(null);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      if (templates.find(t => t.id === editingTemplate.id)) {
        saveTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      } else {
        saveTemplates([...templates, editingTemplate]);
      }
    }
    setEditingTemplate(null);
  };

  const handleDeleteAccount = (id: string) => {
    saveAccounts(accounts.filter(a => a.id !== id));
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const toggleChannel = (channel: string) => {
    if (!editingTemplate) return;
    const channels = editingTemplate.channels.includes(channel)
      ? editingTemplate.channels.filter(c => c !== channel)
      : [...editingTemplate.channels, channel];
    setEditingTemplate({ ...editingTemplate, channels });
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in bg-slate-50 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Email Communications
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure email accounts and outbound transactional notification templates.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'accounts' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Email Accounts
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'templates' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Email Templates
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase">Configured Senders</h3>
              <button 
                onClick={() => setEditingAccount({ id: Date.now().toString(), name: '', email: '', type: 'SMTP', status: 'Active', smtpServer: '', smtpPort: '587' })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add New Account
              </button>
            </div>
            
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-500 uppercase">Account Name</th>
                    <th className="p-3 font-bold text-slate-500 uppercase">Email Address</th>
                    <th className="p-3 font-bold text-slate-500 uppercase">Type</th>
                    <th className="p-3 font-bold text-slate-500 uppercase">Status</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-800">{acc.name}</td>
                      <td className="p-3 text-slate-600 font-mono">{acc.email}</td>
                      <td className="p-3 text-slate-600">{acc.type}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 font-bold rounded-md ${acc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{acc.status}</span></td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => setEditingAccount(acc)} className="text-indigo-600 hover:text-indigo-800"><Edit className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteAccount(acc.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">No email accounts configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase">Notification Templates</h3>
              <button 
                onClick={() => setEditingTemplate({ id: Date.now().toString(), name: 'New Template', desc: '', condition: 'Manual', subject: '', body: '', attachInvoice: false, channels: [] })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> New Template
              </button>
            </div>
            
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{tpl.name}</h4>
                    <div className="flex gap-1">
                      {tpl.attachInvoice && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded uppercase">Invoice PDF</span>}
                      <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">Email</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{tpl.desc}</p>
                  <div className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 mb-3">
                    Trigger: {tpl.condition}
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setEditingTemplate(tpl)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> Edit Template
                    </button>
                    <button onClick={() => handleDeleteTemplate(tpl.id)} className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Edit Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingAccount.id ? 'Edit' : 'Add'} Email Account</h3>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Account Name</label>
                <input required type="text" value={editingAccount.name} onChange={e => setEditingAccount({...editingAccount, name: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Main Customer Service" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <input required type="email" value={editingAccount.email} onChange={e => setEditingAccount({...editingAccount, email: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" placeholder="support@domain.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SMTP Server</label>
                  <input required type="text" value={editingAccount.smtpServer} onChange={e => setEditingAccount({...editingAccount, smtpServer: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" placeholder="smtp.domain.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Port</label>
                  <input required type="text" value={editingAccount.smtpPort} onChange={e => setEditingAccount({...editingAccount, smtpPort: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" placeholder="587" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                <select value={editingAccount.status} onChange={e => setEditingAccount({...editingAccount, status: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingAccount(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingTemplate.id ? 'Edit' : 'Add'} Template</h3>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveTemplate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Template Name</label>
                  <input required type="text" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Order Dispatched" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Trigger Condition</label>
                  <select required value={editingTemplate.condition} onChange={e => setEditingTemplate({...editingTemplate, condition: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500">
                    <option value="New order imported">New order imported</option>
                    <option value="Order status changed to Shipped">Order status changed to Shipped</option>
                    <option value="Order status changed to Cancelled">Order status changed to Cancelled</option>
                    <option value="Manual">Manual Trigger</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description / Internal Note</label>
                <input type="text" value={editingTemplate.desc} onChange={e => setEditingTemplate({...editingTemplate, desc: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="border-t border-b border-slate-200 py-4 my-4">
                <label className="block text-xs font-bold text-slate-800 mb-2">Integration Channels & Opt-ins</label>
                <p className="text-[10px] text-slate-500 mb-3">Select which channels should receive this notification when triggered.</p>
                <div className="flex flex-wrap gap-2">
                  {['Amazon', 'eBay', 'Shopify', 'Manual'].map(ch => (
                    <button 
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        editingTemplate.channels.includes(ch) 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingTemplate.attachInvoice}
                    onChange={e => setEditingTemplate({...editingTemplate, attachInvoice: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Attach Auto-generated PDF Invoice</span>
                    <span className="block text-[10px] text-slate-500">Generates the smallest size PDF invoice and attaches it to this email.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Subject</label>
                <input required type="text" value={editingTemplate.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Body (Supports placeholders like {'{{CUSTOMER_NAME}}'}, {'{{ORDER_ID}}'}, {'{{TRACKING_NUMBER}}'})</label>
                <textarea required rows={8} value={editingTemplate.body} onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})} className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open('src/components/EmailSettingsView.tsx', 'w') as f:
    f.write(replacement)
