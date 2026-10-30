import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

replacement_notify = """              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  type="button"
                  onClick={() => onBulkAction('notify_channels', selectedOrderIds)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Notify Channels
                </button>
                <button
                  type="button"
                  onClick={() => onBulkAction('ship', selectedOrderIds)}"""

content = content.replace('''              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  type="button"
                  onClick={() => onBulkAction('ship', selectedOrderIds)}''', replacement_notify)


with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

