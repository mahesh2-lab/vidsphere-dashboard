const fs = require('fs');
const path = require('path');

const directory = './'; // Run from project root

const importMappings = {
  '@/lib/auth-client': '@/lib/auth/auth-client',
  '@/components/layout/sidebar': '@/components/layouts/sidebar',
  '@/components/topbar': '@/components/layouts/topbar',
  '@/components/sidebar': '@/components/layouts/sidebar',
  '@/components/layout/page-header': '@/components/layouts/page-header',
  '@/components/auth-form': '@/features/auth/components/auth-form',
  '@/components/refresh-button': '@/components/shared/refresh-button',
  '@/lib/google': '@/features/youtube/services/google',
  '@/app/actions/youtube': '@/features/youtube/actions/youtube',
  '@/lib/apikey': '@/features/developers/services/apikey',
  '@/lib/validatekey': '@/features/developers/services/validatekey',
  '@/lib/api-logger': '@/features/developers/services/api-logger',
};

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
      let updated = false;

      for (const [oldImport, newImport] of Object.entries(importMappings)) {
        // match exact import path strings to avoid partial matches
        const regex1 = new RegExp(`['"]${oldImport}['"]`, 'g');
        if (regex1.test(content)) {
          content = content.replace(regex1, `'${newImport}'`);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Import fixing complete.');
