import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcGenerated = path.join(rootDir, 'src', 'generated');
const distGenerated = path.join(rootDir, 'dist', 'generated');

if (fs.existsSync(srcGenerated)) {
  // Create dist/generated directory
  fs.mkdirSync(distGenerated, { recursive: true });

  // Copy function
  const copyRecursive = (src, dest) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursive(srcGenerated, distGenerated);
  console.log('✓ Copied Prisma generated files to dist/generated');
} else {
  console.warn('⚠ src/generated directory not found, skipping copy');
}

