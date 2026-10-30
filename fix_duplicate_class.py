import os
import glob
import re

for file in glob.glob('src/components/**/*.tsx', recursive=True) + glob.glob('src/*.tsx'):
    with open(file, 'r') as f:
        content = f.read()
    
    # We introduced <select className="text-slate-900" ... className="...">
    # Let's fix this by finding <select className="text-slate-900" and merging it or removing it if there's another className
    # Actually, simpler: replace `<select className="text-slate-900" ` with `<select ` since we can just add the color to index.css globally
    content = content.replace('<select\n  className="text-slate-900"\n', '<select\n')
    content = content.replace('<select className="text-slate-900" ', '<select ')
    
    with open(file, 'w') as f:
        f.write(content)

