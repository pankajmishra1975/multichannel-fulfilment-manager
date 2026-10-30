const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace title="Perform action" with a better guessed title based on the entire tag content
  // A button might span multiple lines, e.g. <button \n title="Perform action" \n onClick={...} >
  
  content = content.replace(/<button([^>]+)>/g, (match, attrs) => {
    if (!attrs.includes('title="Perform action"')) return match;

    // Remove the old title
    let newAttrs = attrs.replace(/title="Perform action"/, '');
    
    // Now look for clues in newAttrs
    let title = "Execute action";
    
    if (newAttrs.includes('setFilterStatus(\'all\')')) title = "Show all orders";
    else if (newAttrs.includes('setFilterStatus(\'pending\')')) title = "Show only pending orders";
    else if (newAttrs.includes('setFilterStatus(\'shipped\')')) title = "Show only shipped orders";
    else if (newAttrs.includes('setFilterStatus(\'parked\')')) title = "Show only parked orders";
    else if (newAttrs.includes('isCreatingOrder(true)')) title = "Create new manual order";
    else if (newAttrs.includes('isCreatingOrder(false)')) title = "Cancel manual order creation";
    else if (newAttrs.includes('setFilterLowStock')) title = "Toggle low stock filter";
    else if (newAttrs.match(/onClick=\{[^}]*merge[^}]*\}/i)) title = "Merge selected orders";
    else if (newAttrs.match(/onClick=\{[^}]*print[^}]*\}/i)) title = "Print documents";
    else if (newAttrs.match(/onClick=\{[^}]*delete[^}]*\}/i)) title = "Delete item";
    else if (newAttrs.match(/onClick=\{[^}]*remove[^}]*\}/i)) title = "Remove item";
    else if (newAttrs.match(/onClick=\{[^}]*update[^}]*\}/i)) title = "Update status";
    else if (newAttrs.match(/onClick=\{[^}]*save[^}]*\}/i)) title = "Save changes";
    else if (newAttrs.match(/onClick=\{[^}]*add[^}]*\}/i)) title = "Add new item";
    else if (newAttrs.match(/onClick=\{[^}]*close[^}]*\}/i)) title = "Close dialog";
    else if (newAttrs.includes('X ') || newAttrs.includes('lucide-react')) {
      if (newAttrs.includes('Trash') || newAttrs.includes('Trash2')) title = "Delete";
      else if (newAttrs.includes('Printer')) title = "Print";
      else if (newAttrs.includes('Refresh')) title = "Refresh";
      else if (newAttrs.includes('Search')) title = "Search";
      else if (newAttrs.includes('Settings')) title = "Settings";
      else if (newAttrs.includes('X ') || newAttrs.includes('X<')) title = "Close";
      else if (newAttrs.includes('Edit')) title = "Edit";
      else if (newAttrs.includes('Plus')) title = "Add";
      else if (newAttrs.includes('Download')) title = "Download";
      else if (newAttrs.includes('Check')) title = "Confirm";
      else if (newAttrs.includes('Copy')) title = "Copy to clipboard";
      else if (newAttrs.includes('Chevron') || newAttrs.includes('Arrow')) title = "Navigate";
    }
    
    // Fallbacks based on text
    if (title === "Execute action") {
      if (newAttrs.match(/submit/i)) title = "Submit form";
      else if (newAttrs.match(/cancel/i)) title = "Cancel action";
      else if (newAttrs.match(/>([^<]+)/)) {
        // Try to capture some text immediately following if button isn't self closing
      }
    }
    
    // Add new title back
    changed = true;
    return `<button title="${title}"${newAttrs}>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
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
