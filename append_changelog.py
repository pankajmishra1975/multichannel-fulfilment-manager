with open('src/components/UserGuidesView.tsx', 'r') as f:
    content = f.read()

import re
content = content.replace("category: 'Logistics' | 'Financials' | 'Infrastructure' | 'Getting Started';", "category: 'Logistics' | 'Financials' | 'Infrastructure' | 'Getting Started' | 'Updates & Changelog';")

changelog_entry = """    {
      id: 'changelog',
      title: 'Changelog & Feature Updates (Cron Log)',
      icon: Clock,
      color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
      category: 'Updates & Changelog',
      summary: 'Chronological tracking of newly integrated features, fixes, and platform upgrades.',
      proTip: 'This module is updated regularly as part of a scheduled feature rollout. Check here to see recent additions!',
      steps: [
        'Added Template Designer allowing Drag & Drop for labels, packing slips, POs & invoice forms.',
        'Added dynamic item table grid support in Template Designer.',
        'Enabled Background Reference Image upload in the Template Designer.',
        'Fixed resizing functionality for elements within the designer.',
        'Added expansive list of dynamic placeholders across multiple perspectives (Customer, Product, Shipping).',
        'Removed redundant warnings from the Top Header & Reset Simulator area.'
      ],
      features: [
        { name: 'Template Designer', desc: 'Allows granular customization of printed documents.' },
        { name: 'Dynamic Tables', desc: 'Added support for inserting repeating data blocks such as SKUs, quantities, and prices.' },
        { name: 'Image Tracing', desc: 'Upload background references to trace your old label formats accurately.' }
      ],
      faqs: [
        { q: 'How often are new features added?', a: 'Features are continually pushed and this log acts as a living history of platform capabilities.' }
      ]
    },
"""

content = content.replace("const guides: GuideSection[] = [\n", "const guides: GuideSection[] = [\n" + changelog_entry)

with open('src/components/UserGuidesView.tsx', 'w') as f:
    f.write(content)
