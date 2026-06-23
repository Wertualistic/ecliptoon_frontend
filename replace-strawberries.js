const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('🍓')) {
    let newContent = content;
    
    // Add import
    if (!newContent.includes('StrawberryIcon')) {
      const importLines = newContent.match(/^import .*$/gm) || [];
      if (importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        newContent = newContent.replace(lastImport, lastImport + `\nimport { StrawberryIcon } from '@/components/StrawberryIcon';`);
      } else {
        newContent = `import { StrawberryIcon } from '@/components/StrawberryIcon';\n` + newContent;
      }
    }

    // Common JSX text replace:
    // e.g. <span>{price} 🍓</span> => <span className="flex items-center">{price} <StrawberryIcon /></span>
    // e.g. {user.diamond_balance} 🍓 => {user.diamond_balance} <StrawberryIcon />
    
    // We'll replace ` 🍓` in JSX text with ` <StrawberryIcon />`
    newContent = newContent.replace(/ 🍓/g, ' <StrawberryIcon />');
    newContent = newContent.replace(/🍓/g, '<StrawberryIcon />'); // catch remaining

    // Fix broken template strings:
    // `... <StrawberryIcon /> ...` => if it was inside backticks, this will break if it's used as a regular string.
    // We will print the file to manually review.
    
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated: ' + file);
  }
});
