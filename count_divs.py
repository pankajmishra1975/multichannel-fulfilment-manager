with open('src/components/TemplateDesigner.tsx', 'r') as f:
    lines = f.readlines()

opened = []
for i, line in enumerate(lines):
    import re
    # Simplified, doesn't handle strings/comments but gives a hint
    for m in re.finditer(r'<div', line): opened.append(i+1)
    for m in re.finditer(r'</div', line): 
        if opened: opened.pop()
        else: print("Extra closing at", i+1)

print("Unclosed divs at lines:", opened)
