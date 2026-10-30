import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add email icon and tab to the sidebar
replacement_nav = """      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'emails', label: 'Emails & Notifications', icon: Mail }"""

content = content.replace("{ id: 'settings', label: 'Settings', icon: Settings }", replacement_nav)

replacement_import = """import {
  Package,
  Boxes,
  Truck,
  TrendingUp,
  Settings,
  Link as LinkIcon,
  Home,
  RefreshCw,
  Search,
  Bell,
  LogOut,
  AlertCircle,
  LayoutDashboard,
  Printer,
  FileText,
  Palette,
  Calculator,
  MessageSquare,
  BookOpen,
  X,
  Plus,
  Mail
} from 'lucide-react';"""

content = re.sub(r'import \{[^}]+\} from \'lucide-react\';', replacement_import, content, count=1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
