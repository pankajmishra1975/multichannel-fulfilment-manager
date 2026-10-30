import re

content = open('src/components/CrmView.tsx').read()

# Replace customerDataOverrides and tickets state with useCrm hook
state_pattern = r"const \[selectedCustomer, setSelectedCustomer\] = useState<CrmCustomer \| null>\(null\);\n  const \[customerDataOverrides, setCustomerDataOverrides\] = useState<Record<string, Partial<CrmCustomer>>>\(\{\}\);\n    \n  // Tickets State\n  const \[selectedTicketId, setSelectedTicketId\] = useState<string \| null>\(null\);\n  const \[replyContent, setReplyContent\] = useState\(''\);\n  const \[generatingAi, setGeneratingAi\] = useState\(false\);\n  const \[showTemplates, setShowTemplates\] = useState\(false\);"

new_state = """const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);
  
  const { customers: customerDataOverrides, tickets, updateCustomer: saveOverride, updateTicket } = useCrm();

  // Tickets State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);"""

content = content.replace(
    "const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);\n  const [customerDataOverrides, setCustomerDataOverrides] = useState<Record<string, Partial<CrmCustomer>>>({});\n    \n  // Tickets State\n  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);\n  const [replyContent, setReplyContent] = useState('');\n  const [generatingAi, setGeneratingAi] = useState(false);\n  const [showTemplates, setShowTemplates] = useState(false);",
    new_state
)

# Remove the fetch overrides useEffect and saveOverride definition
content = re.sub(r"// Load overrides from server to persist CRM specific data.*?const saveOverride = async \([^}]+\} catch \(err\) \{\n      console.error\('Failed to save CRM override', err\);\n    \}\n  \};\n", "", content, flags=re.DOTALL)

# Remove the tickets state and useEffect
content = re.sub(r"const \[tickets, setTickets\] = useState<CrmTicket\[\]>\(\[\]\);\n\n  useEffect\(\(\) => \{.*?return \(\) => clearInterval\(interval\);\n  \}, \[orders\]\);\n", "", content, flags=re.DOTALL)

# Update handleSendReply to use updateTicket
content = re.sub(r"setTickets\(tickets.map\(t => t.id === updatedTicket.id \? updatedTicket : t\)\);\n    setReplyContent\(''\);\n\n    try \{\n      await fetch\('/api/crm/tickets', \{\n        method: 'POST',\n        headers: \{ 'Content-Type': 'application/json' \},\n        body: JSON.stringify\(\{ ticket: updatedTicket \}\)\n      \}\);\n    \} catch \(err\) \{\n      console.error\('Failed to save ticket reply', err\);\n    \}", "updateTicket(updatedTicket);\n    setReplyContent('');", content)

open('src/components/CrmView.tsx', 'w').write(content)

print("Done patching CrmView.tsx")
