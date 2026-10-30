const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // split by "<button"
  let parts = content.split('<button');
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      let part = parts[i];
      // find the end of the opening tag by looking for the matching closing '>'
      // In JSX, we could have nested stuff but usually opening tag closes before any '<'
      // Or we can just count occurrences of "title=" before the first 'className' or 'onClick' or just in the part before the first '>' (but > can be in `=>`).
      // Let's just look at the whole string until `</button>`? No, that could include child elements.
      
      // Since our bad title is ALWAYS exactly immediately after `<button`, i.e., ` title="Interact"`
      // we can just check if it starts with ` title="`.
      let match = part.match(/^\s*title="([^"]+)"/);
      if (match) {
        // check if there's another `title=` later in this part before `</button>`
        let endOfButton = part.indexOf('</button>');
        if (endOfButton === -1) endOfButton = part.length;
        
        let insideTag = part.substring(match[0].length, endOfButton);
        if (insideTag.includes('title=')) {
          // Double title! Remove the first one.
          parts[i] = part.substring(match[0].length);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, parts.join('<button'), 'utf8');
    console.log(`Fixed double titles in ${filePath}`);
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
