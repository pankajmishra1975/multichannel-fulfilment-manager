import glob
import re

files = glob.glob('src/**/*.tsx', recursive=True)

def replace_dollars(content):
    # If the file has 'currencySymbol', replace hardcoded labels
    content = re.sub(r'\{unitSystem === \'metric\' \? \'£/€\' : \'\$\'\}', '{currencySymbol}', content)
    content = re.sub(r'\{unitSystem === \'metric\' \? \'£\' : \'\$\'\}', '{currencySymbol}', content)
    
    # Replace literal '($)' in labels with '({currencySymbol})' if currencySymbol is defined
    # Actually wait, some components might not define currencySymbol yet.
    return content

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = replace_dollars(content)
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
