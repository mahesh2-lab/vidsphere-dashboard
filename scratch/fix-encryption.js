const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/lib/encryption')) {
        content = content.replace(/['"]@\/lib\/encryption['"]/g, "'@/lib/utils/encryption'");
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated encryption import in ${fullPath}`);
      }
    }
  }
}

processDirectory('./');
