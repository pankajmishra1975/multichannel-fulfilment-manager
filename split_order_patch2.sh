#!/bin/bash
cat << 'INNER' > patch.txt
  const [splittingOrder, setSplittingOrder] = useState(false);

  const handleSplitOrder = async () => {
    if (!order) return;
    setSplittingOrder(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/split`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        onActionComplete(); // refresh parent
      } else {
        alert(data.error || 'Failed to split order');
      }
    } catch (e) {
      console.error(e);
      alert('Error splitting order');
    } finally {
      setSplittingOrder(false);
    }
  };
INNER
sed -i '/const handleSaveSpecs = async () => {/r patch.txt' src/components/ActiveOrderDetails.tsx
