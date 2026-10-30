import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<strong>WT:</strong> ${o.weightOz || 16} OZ (${Math.round((o.weightOz || 16)/16*10)/10} LBS)',
    '<strong>WT:</strong> {unitSystem === "metric" ? `${Math.round((o.weightOz || 16) * 28.3495)} g (${Math.round((o.weightOz || 16) * 28.3495 / 1000 * 10) / 10} kg)` : `${o.weightOz || 16} OZ (${Math.round((o.weightOz || 16)/16*10)/10} LBS)`}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
