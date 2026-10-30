#!/bin/bash
cat << 'INNER' > patch.txt
  const handleReverseAction = async () => {
    try {
      await fetch('/api/logs/reverse', { method: 'POST' });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };
INNER
sed -i '/const fetchLogs = async () => {/r patch.txt' src/App.tsx
sed -i 's/>Reverse Last Action/ onClick={handleReverseAction}>Reverse Last Action/g' src/App.tsx
