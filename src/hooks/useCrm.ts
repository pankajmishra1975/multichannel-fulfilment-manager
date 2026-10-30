import { useState, useEffect } from 'react';

export function useCrm() {
  const [customers, setCustomers] = useState<Record<string, any>>({});
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCust = await fetch('/api/crm/customers');
        const dataCust = await resCust.json();
        setCustomers(dataCust);

        const resTick = await fetch('/api/crm/tickets');
        const dataTick = await resTick.json();
        setTickets(dataTick);
      } catch (err) {
        console.error('Failed to fetch CRM data', err);
      }
    };
    
    fetchData();

    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('crmCustomers', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setCustomers(data);
      } catch (err) {}
    });
    evtSource.addEventListener('crmTickets', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setTickets(data);
      } catch (err) {}
    });

    return () => evtSource.close();
  }, []);

  const updateCustomer = async (id: string, data: any) => {
    setCustomers(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...data }
    }));
    try {
      await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data })
      });
    } catch (e) {}
  };

  const updateTicket = async (ticket: any) => {
    setTickets(prev => {
      const idx = prev.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = ticket;
        return updated;
      }
      return [...prev, ticket];
    });
    try {
      await fetch('/api/crm/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket })
      });
    } catch (e) {}
  };

  return { customers, tickets, updateCustomer, updateTicket };
}
