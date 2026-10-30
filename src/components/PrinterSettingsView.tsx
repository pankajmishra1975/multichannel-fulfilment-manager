import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Wifi, 
  WifiOff, 
  Plus, 
  Trash2, 
  Settings, 
  Key, 
  FileText, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Activity,
  ArrowRight,
  RefreshCw,
  Sliders,
  Play
} from 'lucide-react';
import { VirtualPrinter } from '../types';

interface PrinterSettingsViewProps {
  onRefreshLogs: () => Promise<void>;
}

export default function PrinterSettingsView({ onRefreshLogs }: PrinterSettingsViewProps) {
  const [printers, setPrinters] = useState<VirtualPrinter[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<VirtualPrinter | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'thermal' | 'laser' | 'inkjet'>('thermal');
  const [connection, setConnection] = useState<'virtual' | 'printnode' | 'ip_raw' | 'cloud_print'>('virtual');
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState<number>(9100);
  const [paperSize, setPaperSize] = useState<string>('4x6');
  const [apiKey, setApiKey] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Active Spool Jobs Simulation List
  const [spoolJobs, setSpoolJobs] = useState<any[]>([
    { id: 'job_102', docName: 'Bulk Shipping Labels (4 orders)', printerName: 'Main Shipping Thermal Labeler', pages: 4, timestamp: new Date(Date.now() - 300000).toISOString(), status: 'printed' },
    { id: 'job_101', docName: 'Amazon FBA Carton Label', printerName: 'Main Shipping Thermal Labeler', pages: 1, timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'printed' },
    { id: 'job_100', docName: 'End-of-day Carrier Manifest USPS', printerName: 'Office Laserjet Duplex', pages: 2, timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'printed' }
  ]);

  useEffect(() => {
    fetchPrinters();
  }, []);

  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscoverPrinters = async () => {
    setIsDiscovering(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchPrinters();
    } finally {
      setIsDiscovering(false);
    }
  };

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/printers');
      const data = await res.json();
      setPrinters(data);
    } catch (e) {
      console.error('Error fetching printers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (printer: VirtualPrinter | null = null) => {
    if (printer) {
      setSelectedPrinter(printer);
      setName(printer.name);
      setType(printer.type);
      setConnection(printer.connection);
      setStatus(printer.status);
      setIpAddress(printer.ipAddress || '');
      setPort(printer.port || 9100);
      setPaperSize(printer.paperSize);
      setApiKey(printer.apiKey || '');
      setIsDefault(printer.isDefault);
    } else {
      setSelectedPrinter(null);
      setName('');
      setType('thermal');
      setConnection('virtual');
      setStatus('online');
      setIpAddress('');
      setPort(9100);
      setPaperSize('4x6');
      setApiKey('');
      setIsDefault(false);
    }
    setShowAddModal(true);
  };

  const handleSavePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Printer name is required.');
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPrinter?.id,
          name,
          type,
          connection,
          status,
          ipAddress,
          port,
          paperSize,
          apiKey,
          isDefault
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Printer ${selectedPrinter ? 'updated' : 'registered'} successfully!`);
        fetchPrinters();
        setShowAddModal(false);
        onRefreshLogs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to register printer.');
      }
    } catch (e) {
      setError('Error occurred saving printer configs.');
    }
  };

  const handleDeletePrinter = async (id: string) => {
    if (!window.confirm('Are you sure you want to de-register this printer?')) return;
    try {
      const res = await fetch('/api/printers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Printer de-registered.');
        fetchPrinters();
        onRefreshLogs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete printer.');
      }
    } catch (e) {
      setError('Error deleting printer.');
    }
  };

  const handleTestPrint = async (printer: VirtualPrinter) => {
    try {
      setError(null);
      const res = await fetch('/api/printers/test-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: printer.id })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Test calibration sent to ${printer.name}! Check system logs.`);
        onRefreshLogs();
        
        // Add item to local spool list
        const newJob = {
          id: 'job_' + Math.floor(Math.random() * 1000),
          docName: 'Simulated ZPL Test Pattern (Calibration)',
          printerName: printer.name,
          pages: 1,
          timestamp: new Date().toISOString(),
          status: 'printed'
        };
        setSpoolJobs(prev => [newJob, ...prev]);

        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(data.error || 'Test print failed.');
      }
    } catch (e) {
      setError('Error communicating with remote spool endpoint.');
    }
  };

  const getConnectionLabel = (type: string) => {
    switch (type) {
      case 'virtual': return 'Virtual Browser Spooler';
      case 'printnode': return 'PrintNode API Gateway';
      case 'ip_raw': return 'TCP/IP RAW RawSocket';
      case 'cloud_print': return 'Simulated Cloud Service';
      default: return type;
    }
  };

  return (
    <div className="space-y-6" id="printer-settings-container">
      
      {/* Alert Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check className="w-4.5 h-4.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero configuration header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            Thermal Label Printers & Remote Printing Spooler
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Configure direct-to-thermal labeling via raw ZPL, cloud spoolers like PrintNode, or local TCP/IP sockets to completely bypass local print prompt dialogs.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button title="Print document"
            onClick={handleDiscoverPrinters}
            disabled={isDiscovering}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin text-indigo-500' : 'text-slate-500'}`} />
            {isDiscovering ? 'Scanning...' : 'Discover Local'}
          </button>
          <button title="Add new item" 
            onClick={() => handleOpenAddModal(null)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Remote Printer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Printers List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configured Hardware Nodes</span>
          
          {loading ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Scanning remote hardware...</p>
            </div>
          ) : printers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
              <Printer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">No active printers registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printers.map((printer) => (
                <div key={printer.id} className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  printer.isDefault ? 'border-indigo-600 ring-1 ring-indigo-600/10' : 'border-slate-200'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-950 truncate max-w-[150px]">{printer.name}</h4>
                          {printer.isDefault && (
                            <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">
                          Type: {printer.type} | Size: {printer.paperSize}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase leading-none ${
                        printer.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {printer.status === 'online' ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-rose-500" />}
                        {printer.status}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold">Protocol:</span>
                        <span className="font-semibold text-slate-800">{getConnectionLabel(printer.connection)}</span>
                      </div>
                      
                      {printer.connection === 'ip_raw' && printer.ipAddress && (
                        <div className="flex justify-between text-slate-600">
                          <span className="font-bold">Socket Address:</span>
                          <span className="font-mono font-semibold text-slate-800">{printer.ipAddress}:{printer.port || 9100}</span>
                        </div>
                      )}

                      {printer.connection === 'printnode' && (
                        <div className="flex justify-between text-slate-600">
                          <span className="font-bold">Cloud Key:</span>
                          <span className="font-mono text-slate-500">••••••••••••{printer.apiKey?.slice(-4) || 'KEY'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-50 pt-4 mt-4 justify-between items-center">

                    <div className="flex gap-1">
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Spool History / Status Panel */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Local Print spool log</span>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Live Job Stack
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Monitoring
              </span>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
              {spoolJobs.map((job) => (
                <div key={job.id} className="flex gap-2.5 items-start text-xs leading-normal">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shrink-0">
                    <FileText className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-extrabold text-slate-950 truncate leading-snug">{job.docName}</p>
                      <span className="font-black font-mono text-[9px] text-indigo-600 shrink-0">#{job.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">Node: {job.printerName}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>Pages: <strong>{job.pages}</strong></span>
                      <span>{new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Printer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSavePrinter}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up text-xs"
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-600" />
                {selectedPrinter ? 'Modify Hardware Node' : 'Register Hardware Node'}
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Printer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="E.g., Zebra ZD420"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Printer Class</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                  >
                    <option value="thermal">Thermal Label Printer (Raw)</option>
                    <option value="laser">Standard Laser (A4/Manifests)</option>
                    <option value="inkjet">Standard Inkjet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Connection Mode</label>
                  <select
                    value={connection}
                    onChange={(e) => setConnection(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                  >
                    <option value="virtual">Virtual Local Spooler</option>
                    <option value="printnode">PrintNode API Integration</option>
                    <option value="ip_raw">Direct RawSocket TCP/IP</option>
                    <option value="cloud_print">Simulated Cloud Spool</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Default Stock Size</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                  >
                    <option value="4x6">100x150 (4x6) Labels</option>
                    <option value="A4_integrated">Integrated A4 Labels</option>
                    <option value="4x6_packslip">Packing Slip & Shipping Label (4x6 format)</option>
                    <option value="ZPL">Raw ZPL Datastream</option>
                    <option value="A4">Standard A4 Sheet</option>
                    <option value="8.5x11">Letter (8.5"x11")</option>
                  </select>
                </div>
              </div>

              {/* Conditional configurations based on connection */}
              {connection === 'ip_raw' && (
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-500">IPv4 Address</label>
                    <input
                      type="text"
                      required
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 font-semibold text-slate-800"
                      placeholder="192.168.1.150"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-500">Port (RAW)</label>
                    <input
                      type="number"
                      required
                      value={port}
                      onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 font-semibold text-slate-800"
                      placeholder="9100"
                    />
                  </div>
                </div>
              )}

              {connection === 'printnode' && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in">
                  <label className="text-[9px] font-bold uppercase text-slate-500">PrintNode API Key</label>
                  <div className="relative">
                    <Key className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full pl-8 pr-3 bg-white border border-slate-200 rounded px-2.5 py-1 font-semibold text-slate-800 font-mono"
                      placeholder="Enter PrintNode secret auth key"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Node Online Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                  >
                    <option value="online">Online & Ready</option>
                    <option value="offline">Offline (Simulate Cable Disconnect)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Set as default printer
                  </label>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
