import re

content = open('src/components/ActiveOrderDetails.tsx').read()

# Add import
content = content.replace("import { \n  User,", "import { useCrm } from '../hooks/useCrm';\nimport { \n  User,")

# Add hook usage
hook_usage = """  const [addressAnalysis, setAddressAnalysis] = useState<{
    isValid: boolean;
    issuesDetected: string[];
    riskLevel: 'low' | 'medium' | 'high';
    suggestedFormat?: any;
    explanation?: string;
  } | null>(null);

  const { customers, updateCustomer } = useCrm();
  const customerEmail = order?.buyerEmail || order?.buyerName || '';
  const customerProfile = customers[customerEmail] || {};
  """

content = content.replace("  const [addressAnalysis, setAddressAnalysis] = useState<{\n    isValid: boolean;\n    issuesDetected: string[];\n    riskLevel: 'low' | 'medium' | 'high';\n    suggestedFormat?: any;\n    explanation?: string;\n  } | null>(null);", hook_usage)

open('src/components/ActiveOrderDetails.tsx', 'w').write(content)
