const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (/\.jsx?$/.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!/\bReact\b/.test(content)) return false;
  if (/import\s+React\b/.test(content)) return false;

  const lines = content.split('\n');
  // insert after any existing imports, or at top
  const lastImportIndex = lines.reduce((idx, line, i) => {
    if (/^\s*import\s.+from\s+['"].+['"];?/.test(line)) return i;
    return idx;
  }, -1);

  const insertAt = lastImportIndex + 1;
  lines.splice(insertAt, 0, "import React from 'react';");
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`Added React import to ${file}`);
  return true;
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found', srcDir);
    process.exit(1);
  }
  const files = walk(srcDir);
  let changed = 0;
  files.forEach((f) => {
    try {
      if (processFile(f)) changed++;
    } catch (e) {
      console.error('Error processing', f, e);
    }
  });
  console.log(`Processed ${files.length} files, added imports to ${changed}`);
}

main();
