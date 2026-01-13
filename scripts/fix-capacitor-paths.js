import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist/public');

function fixPaths(content) {
  return content
    .replace(/src="\/assets\//g, 'src="./assets/')
    .replace(/href="\/assets\//g, 'href="./assets/')
    .replace(/href="\/favicon/g, 'href="./favicon')
    .replace(/href="\/apple-touch-icon/g, 'href="./apple-touch-icon')
    .replace(/href="\/manifest/g, 'href="./manifest')
    .replace(/"\/assets\//g, '"./assets/')
    .replace(/new URL\("\/assets\//g, 'new URL("./assets/')
    .replace(/url\("\/assets\//g, 'url("./assets/')
    .replace(/from"\/assets\//g, 'from"./assets/')
    .replace(/import\("\/assets\//g, 'import("./assets/');
}

try {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = fixPaths(content);
    fs.writeFileSync(indexPath, content);
    console.log('Fixed paths in index.html');
  }

  const assetsDir = path.join(distPath, 'assets');
  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
    for (const file of jsFiles) {
      const filePath = path.join(assetsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      content = fixPaths(content);
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed paths in ${file}`);
      }
    }
  }

  console.log('All paths fixed for Capacitor');
} catch (error) {
  console.error('Error fixing paths:', error);
  process.exit(1);
}
