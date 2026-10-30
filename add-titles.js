const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Simple regex to find button tags, we need to be careful with multi-line tags.
  // Actually, we can use a more robust regex or just string manipulation.
  
  // A regex to match opening button tags: <button ... >
  const buttonRegex = /<button([^>]+)>/g;
  
  content = content.replace(buttonRegex, (match, attrs) => {
    // If it already has a title, skip
    if (attrs.includes('title=')) return match;

    // Try to guess a title from className or id or text content
    let title = "Perform action";
    if (attrs.includes('setFilterStatus(\'all\')')) title = "Show all orders";
    else if (attrs.includes('setFilterStatus(\'pending\')')) title = "Show only pending orders";
    else if (attrs.includes('setFilterStatus(\'shipped\')')) title = "Show only shipped orders";
    else if (attrs.includes('setFilterStatus(\'parked\')')) title = "Show only parked orders";
    else if (attrs.includes('autoSync')) title = "Toggle background auto-sync";
    else if (attrs.includes('handleSyncOrders')) title = "Sync orders from channels";
    else if (attrs.includes('onTabChange')) title = "Navigate to tab";
    else if (attrs.includes('X ') || attrs.includes('Close') || attrs.includes('false')) title = "Close";
    else if (attrs.includes('isCreatingOrder')) title = "Create new manual order";
    else if (attrs.includes('Search') || attrs.includes('search')) title = "Search items";
    else if (attrs.includes('save') || attrs.includes('Save')) title = "Save changes";
    else if (attrs.includes('delete') || attrs.includes('Delete') || attrs.includes('Remove')) title = "Delete item";
    else if (attrs.includes('RefreshCw') || attrs.includes('sync') || attrs.includes('refresh')) title = "Refresh data";
    else if (attrs.includes('Printer') || attrs.includes('Print') || attrs.includes('print')) title = "Print document";
    else if (attrs.includes('Filter')) title = "Apply filters";
    else if (attrs.includes('Arrow')) title = "Navigate";
    else if (attrs.includes('Menu')) title = "Open menu";
    else if (attrs.includes('Add')) title = "Add new item";
    else if (attrs.includes('Update')) title = "Update status";
    else if (attrs.includes('Edit')) title = "Edit details";
    else if (attrs.includes('Copy')) title = "Copy to clipboard";
    else if (attrs.match(/onClick=\{[^}]*\}/)) {
      // Try to extract a clue from onClick
      const onClickStr = attrs.match(/onClick=\{([^}]+)\}/)[1];
      if (onClickStr.includes('set')) title = "Change settings or filter";
      else if (onClickStr.includes('handle')) title = "Execute " + onClickStr.match(/handle([a-zA-Z]+)/)?.[1] || "action";
      else title = "Execute action";
    }

    changed = true;
    return `<button title="${title}"${attrs}>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
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
