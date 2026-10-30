import re
import glob

for file in glob.glob('src/**/*.tsx', recursive=True):
    with open(file, 'r') as f:
        content = f.read()

    # Find elements with multiple classNames
    # Example: <select className="..." ... className="...">
    # Actually, simpler: replace className="text-slate-900" if it's the second className
    # Or just replace ` className="text-slate-900"` with `` since I added it to `src/index.css`
    content = content.replace(' className="text-slate-900"', '')
    content = content.replace('\n  className="text-slate-900"\n', '\n')
    
    with open(file, 'w') as f:
        f.write(content)

