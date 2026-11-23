import { fileURLToPath } from 'node:url';
import { scanPublicFiles } from './public-safety.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length && !['--staged', '--history'].includes(args[0]))) {
  console.error('Usage: npm run security:check [-- --staged|--history]');
  process.exit(1);
}
try {
  const result = scanPublicFiles({ root: fileURLToPath(new URL('../', import.meta.url)), mode: args[0]?.slice(2) || 'worktree' });
  console.log(`Public safety check passed: ${result.mode}, ${result.files} file versions inspected.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
