import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We need to replace from `if (standaloneOrderId)` up to `User Guides` button closing tag with the correct structure.

bad_regex = r'if \(standaloneOrderId\).*?</button>\s*</>\s*\)\}\s*</div>\s*</header>\s*\{\/\* Workspace Wrapper \*\/\}\s*<div className="flex-1 flex flex-col md:flex-row min-h-0" id="workspace-wrapper">'

replacement = """if (standaloneOrderId) {
    const targetOrder = orders.find(o => o.id === standaloneOrderId);
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans animate-fade-in" id="standalone-workspace-container">
        <header className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">SlamTech Standalone Order Workspace</h1>
              <p className="text-[11px] text-slate-400">Perform individual weight/dimension edits, courier ratings, and direct postage purchasing.</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full">
          {targetOrder ? (
             <ActiveOrderDetails
                order={targetOrder}
                onUpdateSpecs={handleUpdateSpecs}
                onRefreshRates={handleRefreshRates}
                onBuyLabel={handleBuyLabel}
                onUpdateOrder={handleUpdateOrder}
                unitSystem={unitSystem}
             />
          ) : (
             <div className="text-center p-10 text-slate-400">Order not found or loading...</div>
          )}
        </div>
      </div>
    );
  }

  // Main application return
  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden" id="main-application-root">
      {/* Top Application Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0 shadow-md z-10" id="main-app-header">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">SlamTech Logistics</h1>
            <p className="text-[9px] text-slate-400 tracking-wide">ENTERPRISE EDITION</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[10px] uppercase font-bold mr-2">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> SYSTEM ONLINE</span>
            <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-emerald-500" /> API: {apiKeys?.amazonSellingPartner ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          
          <button
            onClick={() => {
              if (!openTabs.includes('logs')) {
                setOpenTabs([...openTabs, 'logs']);
              }
              setActiveTab('logs');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            Terminal Output
          </button>

          {userRole === 'admin' && (
            <>
              <button
                onClick={handleResetOrders}
                className="text-xs px-3 py-1.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 font-semibold transition-colors"
                id="reset-demo-orders-btn"
              >
                Reset Simulator
              </button>

              <button
                onClick={() => {
                  if (!openTabs.includes('guide')) {
                    setOpenTabs([...openTabs, 'guide']);
                  }
                  setActiveTab('guide');
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-all border border-indigo-500 shadow-sm"
                id="open-user-guides-btn"
              >
                <BookOpen className="w-4 h-4 text-white" />
                User Guides
              </button>
            </>
          )}
        </div>
      </header>

      {/* Workspace Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0" id="workspace-wrapper">"""

content = re.sub(bad_regex, replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

