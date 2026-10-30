const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We need to find <button ...>...</button> or <button .../> and fix double titles
  // Actually, we can just replace `<button title="[^"]+"` with `<button` if the rest of the file has an error there?
  // Let's use TS compiler output to guide us!
  
  // Or just simply: find all <button ...> tags and if they have more than one title=, remove the first one.
  const buttonRegex = /<button([^>]+)>/g;
  
  let newContent = content.replace(buttonRegex, (match, attrs) => {
    // Count how many times `title=` appears in attrs
    const titleMatches = attrs.match(/title=/g);
    if (titleMatches && titleMatches.length > 1) {
      // Remove the FIRST title attribute (which is the one we injected)
      // Our injected title looks like ` title="Some text"` at the very beginning of attrs
      let replaced = attrs.replace(/^\s*title="[^"]+"/, '');
      changed = true;
      return `<button${replaced}>`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
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
