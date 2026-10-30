with open('src/components/TemplateDesigner.tsx', 'r') as f:
    lines = f.readlines()
o = 0
c = 0
for i in range(369, 610):
    o += lines[i].count('<div')
    c += lines[i].count('</div')
print("Sidebar divs:", o, c)
