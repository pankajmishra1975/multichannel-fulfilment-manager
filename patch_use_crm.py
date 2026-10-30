import re

with open('src/hooks/useCrm.ts', 'r') as f:
    content = f.read()

# Replace the useEffect with an EventSource
new_use_effect = """  useEffect(() => {
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
  }, []);"""

content = re.sub(
    r"  useEffect\(\(\) => \{.*?\}, \[\]\);",
    new_use_effect,
    content,
    flags=re.DOTALL
)

with open('src/hooks/useCrm.ts', 'w') as f:
    f.write(content)
