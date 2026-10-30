import re

with open('src/components/RulesEngineView.tsx', 'r') as f:
    content = f.read()

content = content.replace("{ value: 'assign_service', label: 'Assign Postal Service Name' },", "{ value: 'assign_service', label: 'Assign Postal Service Name' },\n    { value: 'assign_template', label: 'Assign Label Template Override' },")

with open('src/components/RulesEngineView.tsx', 'w') as f:
    f.write(content)
