import os
import glob

for file in glob.glob('src/components/**/*.tsx', recursive=True) + glob.glob('src/*.tsx'):
    with open(file, 'r') as f:
        content = f.read()
    
    # Simple replacement to ensure text-slate-900 is present on selects
    content = content.replace('<select\n', '<select\n  className="text-slate-900"\n')
    content = content.replace('<select ', '<select className="text-slate-900" ')
    
    with open(file, 'w') as f:
        f.write(content)

