import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, '../dist/public/index.html');

try {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/href="\/favicon/g, 'href="./favicon');
  content = content.replace(/href="\/apple-touch-icon/g, 'href="./apple-touch-icon');
  content = content.replace(/href="\/manifest/g, 'href="./manifest');
  
  fs.writeFileSync(indexPath, content);
  console.log('Fixed paths in index.html for Capacitor');
} catch (error) {
  console.error('Error fixing paths:', error);
  process.exit(1);
}
