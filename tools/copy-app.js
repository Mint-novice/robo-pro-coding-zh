// stream-copy the MSIX app dir to a writable location (EFS-safe)
const fs = require('fs');
const path = require('path');

const srcRoot = process.argv[2];
const dstRoot = process.argv[3];

let n = 0, bytes = 0;
function copyDir(rel) {
  const s = path.join(srcRoot, rel);
  const d = path.join(dstRoot, rel);
  fs.mkdirSync(d, { recursive: true });
  for (const e of fs.readdirSync(s, { withFileTypes: true })) {
    const r = rel ? path.join(rel, e.name) : e.name;
    if (e.isDirectory()) copyDir(r);
    else {
      const buf = fs.readFileSync(path.join(srcRoot, r));
      fs.writeFileSync(path.join(dstRoot, r), buf);
      n++; bytes += buf.length;
    }
  }
}
copyDir('');
console.log(`copied ${n} files, ${(bytes / 1048576).toFixed(1)} MB -> ${dstRoot}`);
