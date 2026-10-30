const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  let newContent = content.split('\n').map((line, i, lines) => {
    if (line.includes('title="Interact"')) {
      let title = "Perform action";
      
      // Look forward up to 10 lines to find the button text or icon
      for (let j = 0; j < 10; j++) {
        if (!lines[i+j]) continue;
        let str = lines[i+j];
        if (str.includes('setFilterLowStock')) title = "Toggle low stock warning filter";
        else if (str.includes('ShoppingBag') && str.includes('Standard Deck Rows')) title = "View as Standard Deck Rows";
        else if (str.includes('Table') && str.includes('Dense Spreadsheet View')) title = "View as Dense Spreadsheet";
        else if (str.includes('setIsCreatingOrder(true)')) title = "Open manual order creator";
        else if (str.includes('Print') || str.includes('print')) title = "Print document";
        else if (str.includes('Copy')) title = "Copy address to clipboard";
        else if (str.includes('preset.weight')) title = "Apply package preset to selected orders";
        else if (str.includes('Cancel') || str.includes('cancel')) title = "Cancel and close";
        else if (str.includes('Save') || str.includes('save')) title = "Save configuration";
        else if (str.includes('Plus')) title = "Add new element";
        else if (str.includes('Chevron') || str.includes('Arrow')) title = "Navigation control";
        else if (str.includes('<X />') || str.includes('X ')) title = "Close dialog or panel";
      }
      
      changed = true;
      return line.replace('title="Interact"', `title="${title}"`);
    }
    return line;
  }).join('\n');

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed Interact in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk('./src');
