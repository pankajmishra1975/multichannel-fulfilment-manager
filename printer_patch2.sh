#!/bin/bash
cat << 'INNER' > patch.txt
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDiscoverPrinters}
            disabled={isDiscovering}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isDiscovering ? 'animate-spin text-indigo-500' : 'text-slate-500'}`} />
            {isDiscovering ? 'Scanning...' : 'Discover Local'}
          </button>
          <button
            onClick={() => handleOpenAddModal(null)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Remote Printer
          </button>
        </div>
INNER
sed -i '/<button/,/<\/button>/d' src/components/PrinterSettingsView.tsx
sed -i '/<\/p>/r patch.txt' src/components/PrinterSettingsView.tsx
