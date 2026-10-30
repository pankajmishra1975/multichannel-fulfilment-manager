#!/bin/bash
cat << 'INNER' > patch.txt
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscoverPrinters = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      setIsDiscovering(false);
      const discovered: VirtualPrinter = {
        id: 'disc-1',
        name: 'Zebra ZD421 (Local USB)',
        type: 'thermal',
        ipAddress: 'usb://0/1',
        paperSize: '4x6',
        status: 'online',
        printZPL: true,
      };
      const discovered2: VirtualPrinter = {
        id: 'disc-2',
        name: 'HP LaserJet Pro (Network)',
        type: 'laser',
        ipAddress: '192.168.1.150',
        paperSize: 'A4',
        status: 'online',
        printZPL: false,
      };
      setPrinters(prev => [...prev, discovered, discovered2]);
      setSuccess('Discovered 2 local printers on the network/USB.');
      setTimeout(() => setSuccess(null), 3000);
    }, 2500);
  };
INNER
sed -i '/const handleSavePrinter = async () => {/r patch.txt' src/components/PrinterSettingsView.tsx
