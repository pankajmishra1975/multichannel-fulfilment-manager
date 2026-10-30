import re

content = open('src/App.tsx').read()

active_order_block = """        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0" id="logs-tab-container">
            <div className="bg-slate-900 text-slate-300 flex-1 flex flex-col rounded-2xl border border-slate-800 p-4 shadow-inner">"""

new_active_order_block = """        {activeTab?.startsWith('order_') && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-2xl shadow-sm border border-slate-200" id="order-tab-container">
            {(() => {
              const orderId = activeTab.replace('order_', '');
              const targetOrder = orders.find(o => o.id === orderId);
              if (!targetOrder) return <div className="p-8 text-center text-slate-500">Order not found.</div>;
              return (
                <div className="flex-1 overflow-y-auto bg-slate-100 rounded-2xl">
                  <ActiveOrderDetails 
                    unitSystem={unitSystem} 
                    order={targetOrder} 
                    onBuyLabel={handleBuyLabel} 
                    onRefreshRates={handleRefreshRates}
                    onUpdateSpecs={handleUpdateSpecs}
                    onUpdateOrder={handleUpdateOrder}
                  />
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0" id="logs-tab-container">
            <div className="bg-slate-900 text-slate-300 flex-1 flex flex-col rounded-2xl border border-slate-800 p-4 shadow-inner">"""

content = content.replace(active_order_block, new_active_order_block)

open('src/App.tsx', 'w').write(content)
