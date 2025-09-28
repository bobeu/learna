const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Function to replace ~ imports with @ imports
function replaceImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace import statements with single quotes
    const importRegex = /from\s+['"]~\/[^'"]*['"]/g;
    const newContent = content.replace(importRegex, (match) => {
      modified = true;
      return match.replace(/~/g, '@');
    });
    
    // Replace require statements
    const requireRegex = /require\(['"]~\/[^'"]*['"]\)/g;
    const finalContent = newContent.replace(requireRegex, (match) => {
      modified = true;
      return match.replace(/~/g, '@');
    });
    
    if (modified) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  console.log('Replacing ~ imports with @ imports...');
  
  const files = findFiles(srcDir);
  let updatedCount = 0;
  
  files.forEach(file => {
    if (replaceImports(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\nCompleted! Updated ${updatedCount} files.`);
}

main();
