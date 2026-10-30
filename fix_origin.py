import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """  const fetchOrigin = async () => {
    try {
      const savedOrigin = localStorage.getItem('appOrigin');
      if (savedOrigin) {
        const parsed = JSON.parse(savedOrigin);
        setOriginCountry(parsed.country || 'US');
        setOriginCity(parsed.city || 'Atlanta');
        setOriginState(parsed.state || 'GA');
        setOriginZip(parsed.zip || '30309');
        return;
      }
      const res = await fetch('/api/settings/origin');
      const data = await res.json();
      if (data) {
        setOriginCountry(data.country || 'US');
        setOriginCity(data.city || 'Atlanta');
        setOriginState(data.state || 'GA');
        setOriginZip(data.zip || '30309');
      }
    } catch (e) {
      console.error('Error fetching origin settings:', e);
    }
  };

  const handleUpdateOrigin = async (country: string, city: string, state: string, zip: string) => {
    try {
      localStorage.setItem('appOrigin', JSON.stringify({ country, city, state, zip }));
      const res = await fetch('/api/settings/origin', {"""

content = re.sub(r'  const fetchOrigin = async \(\) => \{\n    try \{\n      const res = await fetch\(\'/api/settings/origin\'\);\n      const data = await res\.json\(\);\n      if \(data\) \{\n        setOriginCountry\(data\.country \|\| \'US\'\);\n        setOriginCity\(data\.city \|\| \'Atlanta\'\);\n        setOriginState\(data\.state \|\| \'GA\'\);\n        setOriginZip\(data\.zip \|\| \'30309\'\);\n      \}\n    \} catch \(e\) \{\n      console\.error\(\'Error fetching origin settings:\', e\);\n    \}\n  \};\n\n  const handleUpdateOrigin = async \(country: string, city: string, state: string, zip: string\) => \{\n    try \{\n      const res = await fetch\(\'/api/settings/origin\', \{', replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

