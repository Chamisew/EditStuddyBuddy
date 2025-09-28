const fs = require("fs");
const path = require("path");

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
  let content = fs.readFileSync(file, "utf8");
  if (!/import\s+React/.test(content)) return false;

  // If React identifier is used elsewhere in the file (beyond the import), skip
  // We look for word boundary "React" excluding the import line
  const lines = content.split("\n");
  const importLineIndex = lines.findIndex((l) => /import\s+React/.test(l));
  if (importLineIndex === -1) return false;

  // Remove the import line temporarily and see if 'React' exists elsewhere
  const importLine = lines[importLineIndex];
  const withoutImport = lines
    .slice(0, importLineIndex)
    .concat(lines.slice(importLineIndex + 1))
    .join("\n");
  if (/\bReact\b/.test(withoutImport)) {
    // React is used elsewhere, don't remove default import. But handle cases like import React, { useState } from 'react';
    // If the import has named imports, and React isn't used, we can transform to import { named } from 'react';
    const m = importLine.match(
      /import\s+React\s*,\s*\{([^}]+)\}\s*from\s*['"]react['"];?/,
    );
    if (m) {
      const named = m[1].trim();
      const newImport = `import { ${named} } from 'react';`;
      lines[importLineIndex] = newImport;
      fs.writeFileSync(file, lines.join("\n"), "utf8");
      console.log(`Updated import in ${file}`);
      return true;
    }
    return false;
  } else {
    // Safe to remove the import line entirely
    lines.splice(importLineIndex, 1);
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    console.log(`Removed React import from ${file}`);
    return true;
  }
}

function main() {
  const srcDir = path.join(__dirname, "..", "src");
  if (!fs.existsSync(srcDir)) {
    console.error("src directory not found", srcDir);
    process.exit(1);
  }
  const files = walk(srcDir);
  let changed = 0;
  files.forEach((f) => {
    try {
      if (processFile(f)) changed++;
    } catch (e) {
      console.error("Error processing", f, e);
    }
  });
  console.log(`Processed ${files.length} files, modified ${changed}`);
}

main();
