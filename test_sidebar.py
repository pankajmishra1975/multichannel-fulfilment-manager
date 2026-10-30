with open('src/components/TemplateDesigner.tsx', 'r') as f:
    print(f.read().find('id="designer-sidebar"'))
    print(f.read().find('id="designer-canvas-stage"'))
