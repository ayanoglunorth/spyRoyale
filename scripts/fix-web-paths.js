const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const jsDir = path.join(distPath, '_expo/static/js/web');
const assetsDir = path.join(distPath, 'assets');
const oldModulesDir = path.join(assetsDir, 'node_modules');
const newModulesDir = path.join(assetsDir, 'modules');

console.log('Running postbuild script to fix Firebase node_modules path issue...');

// 1. Replace strings in JS bundles
if (fs.existsSync(jsDir)) {
  const files = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all occurrences of assets/node_modules/ with assets/modules/
    if (content.includes('assets/node_modules/')) {
       content = content.replace(/assets\/node_modules\//g, 'assets/modules/');
       fs.writeFileSync(filePath, content, 'utf8');
       console.log(`Updated paths in ${file}`);
    }
  }
} else {
  console.log('JS directory not found:', jsDir);
}

// 2. Copy the directory instead of renaming to avoid EPERM locks on Windows
if (fs.existsSync(oldModulesDir)) {
  fs.cpSync(oldModulesDir, newModulesDir, { recursive: true });
  console.log('Copied assets/node_modules to assets/modules');
} else {
  console.log('Old modules directory not found:', oldModulesDir);
}

// 3. Cache-bust index.html to avoid immutable CDN cache on the JS bundle
const indexHtmlPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  const cacheBuster = `?v=${Date.now()}`;
  htmlContent = htmlContent.replace(/\.js"/g, `.js${cacheBuster}"`);
  fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
  console.log('Cache-busted index.html scripts with', cacheBuster);
}

console.log('Postbuild fix completed successfully.');
