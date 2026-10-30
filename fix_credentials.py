import re

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

fix_file('src/components/ActiveOrderDetails.tsx', [
    ('Weight specified ({localWeight || 0} oz)', 'Weight specified ({localWeight || 0} {unitSystem === "metric" ? "g" : "oz"})'),
    ('{packagingAdvice.estimatedDimensionalWeightOz} oz', '{unitSystem === "metric" ? Math.round(packagingAdvice.estimatedDimensionalWeightOz * 28.3495) : packagingAdvice.estimatedDimensionalWeightOz} {unitSystem === "metric" ? "g" : "oz"}'),
    ('`${order.weightOz || 16} OZ (${Math.round((order.weightOz || 16)/16*10)/10} LBS)`', '`${order.weightOz || 16} OZ (${Math.round((order.weightOz || 16)/16*10)/10} LBS)`') # Actually wait, it's already using metric conditionally here
])

fix_file('src/components/InventoryView.tsx', [
    ('currency: currency || \'USD\'', 'currency: currency'),
    ('<span>Weight: <strong>{p.weight} oz</strong></span>', '<span>Weight: <strong>{p.weight} {unitSystem === "metric" ? "g" : "oz"}</strong></span>')
])

fix_file('src/components/PrintStatusModal.tsx', [
    ('USD', '{currency}')
])

fix_file('src/components/ProductsManager.tsx', [
    ('currency: currency || \'USD\'', 'currency: currency'),
    ('Size (LxWxH inches)', 'Size (LxWxH {unitSystem === "metric" ? "cm" : "inches"})'),
    ('{p.weight ? `${p.weight} oz` : \'Pending\'}', '{p.weight ? `${p.weight} ${unitSystem === "metric" ? "g" : "oz"}` : \'Pending\'}')
])

fix_file('src/components/ReportsView.tsx', [
    ('currency: currency || \'USD\'', 'currency: currency')
])

fix_file('src/components/DashboardView.tsx', [
    ('currency: currency || \'USD\'', 'currency: currency')
])
