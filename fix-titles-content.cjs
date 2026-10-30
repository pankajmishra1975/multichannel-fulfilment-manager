const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // We want to replace <button title="Execute action" ...> ... </button>
  // Let's use a regex to find all <button ...>...</button>
  // Due to nesting, standard regex isn't perfect for HTML, but for our simple buttons it should work.
  // Actually, let's just find the generic titles and update them based on trailing text or icon names on the same lines
  
  let newContent = content.split('\n').map((line, i, lines) => {
    if (line.includes('title="Execute action"')) {
      // Look at the next few lines for clues
      let textClue = '';
      for (let j = 0; j < 5; j++) {
        if (lines[i+j]) {
          let str = lines[i+j];
          if (str.includes('Trash') || str.includes('Trash2')) textClue = 'Delete item';
          else if (str.includes('Plus')) textClue = 'Add new item';
          else if (str.includes('Edit')) textClue = 'Edit item';
          else if (str.includes('Refresh')) textClue = 'Refresh';
          else if (str.includes('Search')) textClue = 'Search';
          else if (str.includes('X ') || str.includes('<X />') || str.includes('X>')) textClue = 'Close';
          else if (str.includes('Chevron') || str.includes('Arrow')) textClue = 'Navigate';
          else if (str.includes('Printer')) textClue = 'Print';
          else if (str.includes('Download')) textClue = 'Download';
          else if (str.includes('setFilterStatus(\'all\')')) textClue = 'Show all orders';
          else if (str.includes('setFilterStatus(\'pending\')')) textClue = 'Show pending orders';
          else if (str.includes('setFilterStatus(\'shipped\')')) textClue = 'Show shipped orders';
          else if (str.includes('setFilterStatus(\'parked\')')) textClue = 'Show parked orders';
          
          if (!textClue) {
             // look for text content
             let match = str.match(/>([^<]+)</);
             if (match && match[1].trim().length > 1) {
               textClue = match[1].trim();
             }
          }
          if (textClue) break;
        }
      }
      
      if (!textClue) textClue = 'Interact';
      
      changed = true;
      return line.replace('title="Execute action"', `title="${textClue}"`);
    }
    return line;
  }).join('\n');

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
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
