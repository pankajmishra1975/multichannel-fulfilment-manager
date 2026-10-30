#!/bin/bash
sed -i '2808i \
// --- CRM Endpoints ---\
let crmCustomers: Record<string, any> = {};\
let crmTickets: any[] = [];\
\
app.get("/api/crm/customers", (req, res) => {\
  res.json(crmCustomers);\
});\
\
app.post("/api/crm/customers", (req, res) => {\
  const { id, data } = req.body;\
  if (id && data) {\
    crmCustomers[id] = { ...(crmCustomers[id] || {}), ...data };\
    res.json({ success: true, customer: crmCustomers[id] });\
  } else {\
    res.status(400).json({ error: "Missing id or data" });\
  }\
});\
\
app.get("/api/crm/tickets", (req, res) => {\
  res.json(crmTickets);\
});\
\
app.post("/api/crm/tickets", (req, res) => {\
  const { ticket } = req.body;\
  if (ticket && ticket.id) {\
    const idx = crmTickets.findIndex((t: any) => t.id === ticket.id);\
    if (idx !== -1) {\
      crmTickets[idx] = ticket;\
    } else {\
      crmTickets.push(ticket);\
    }\
    res.json({ success: true, ticket });\
  } else {\
    res.status(400).json({ error: "Invalid ticket" });\
  }\
});\
' server.ts
