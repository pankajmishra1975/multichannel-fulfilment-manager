import re
content = open('src/components/OrdersList.tsx').read()
content = content.replace(
"  const [columnOrder, setColumnOrder] = useState<string[]>([",
"  const [columnOrder, setColumnOrder] = useState<string[]>(["
)
open('src/components/OrdersList.tsx', 'w').write(content)
