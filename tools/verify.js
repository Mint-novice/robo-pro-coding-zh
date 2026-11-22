// verify a packed asar against the source dir
const fs = require('fs');
const path = require('path');

const asar = process.argv[2];
const srcDir = process.argv[3];

const fd = fs.openSync(asar, 'r');
const head = Buffer.alloc(16);
fs.readSync(fd, head, 0, 16, 0);
const headerSize = head.readUInt32LE(4);
const jsonLen = head.readUInt32LE(12);
const jsonBuf = Buffer.alloc(jsonLen);
fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
const header = JSON.parse(jsonBuf.toString('utf8'));
const dataOffset = 8 + headerSize;

function walk(node, prefix, cb) {
  for (const [name, meta] of Object.entries(node.files || {})) {
    const p = prefix ? prefix + '/' + name : name;
    if (meta.files) walk(meta, p, cb);
    else cb(p, meta);
  }
}
const entries = [];
walk(header, '', (p, m) => entries.push([p, m]));

let bad = 0, checked = 0;
const extra = [];
for (const [p, m] of entries) {
  const srcPath = path.join(srcDir, p);
  if (!fs.existsSync(srcPath)) { extra.push(p); continue; }
  const a = Buffer.alloc(m.size);
  fs.readSync(fd, a, 0, m.size, dataOffset + Number(m.offset));
  const b = fs.readFileSync(srcPath);
  checked++;
  if (!a.equals(b)) { bad++; console.log('MISMATCH', p, a.length, b.length); }
}
console.log(`entries=${entries.length} checked=${checked} mismatched=${bad} missingSrc=${extra.length}`);
const zh = entries.filter((e) => /messages\.zh\.xlf$/.test(e[0])).map((e) => e[0] + ' (' + e[1].size + ')');
console.log('zh files:', zh.join(', '));
fs.closeSync(fd);
