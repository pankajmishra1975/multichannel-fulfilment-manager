from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        
    def handle_starttag(self, tag, attrs):
        if tag in ['div', 'span', 'button', 'form', 'select', 'label', 'p', 'h3', 'h4']:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in ['div', 'span', 'button', 'form', 'select', 'label', 'p', 'h3', 'h4']:
            if not self.stack:
                return
            last_tag, pos = self.stack.pop()

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

start = content.find('return (')
if start != -1:
    content = content[start:]
    # Do not remove braces, maybe that caused issues
    parser = MyHTMLParser()
    try:
        parser.feed(content)
    except Exception as e:
        pass
    
    for tag, pos in parser.stack:
        line = pos[0]
        col = pos[1]
        print(f"Unclosed {tag} at relative line {line}: {content.split(chr(10))[line-1]}")
