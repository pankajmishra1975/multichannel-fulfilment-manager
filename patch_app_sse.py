import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add a new useEffect in App.tsx just after fetchOrders
new_effect = """  // SSE auto-sync for orders
  useEffect(() => {
    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('orders', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setOrders(data);
        // Retain active order if selected
        setActiveOrder((prevActive: any) => {
          if (prevActive) {
            return data.find((o: any) => o.id === prevActive.id) || prevActive;
          }
          return null;
        });
      } catch (err) {}
    });
    return () => evtSource.close();
  }, []);"""

content = content.replace("  // Auto-sync polling timer", new_effect + "\n\n  // Auto-sync polling timer")

with open('src/App.tsx', 'w') as f:
    f.write(content)
