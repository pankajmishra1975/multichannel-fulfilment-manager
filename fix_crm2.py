import re

content = open('src/components/CrmView.tsx').read()

new_state = """  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);
  
  const { customers: customerDataOverrides, tickets, updateCustomer: saveOverride, updateTicket } = useCrm();

  // Tickets State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);"""

content = re.sub(r"  const \[selectedCustomer, setSelectedCustomer\] = useState<CrmCustomer \| null>\(null\);\n  const \[customerDataOverrides, setCustomerDataOverrides\] = useState<Record<string, Partial<CrmCustomer>>>\(\{\}\);\n    \n  // Tickets State\n  const \[selectedTicketId, setSelectedTicketId\] = useState<string \| null>\(null\);\n  const \[replyContent, setReplyContent\] = useState\(''\);\n  const \[generatingAi, setGeneratingAi\] = useState\(false\);\n  const \[showTemplates, setShowTemplates\] = useState\(false\);", new_state, content)

open('src/components/CrmView.tsx', 'w').write(content)
