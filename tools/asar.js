// Minimal asar extractor (read-only source -> workspace copy)
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
const outDir = process.argv[3];
const mode = process.argv[4] || 'list';

const fd = fs.openSync(src, 'r');
const head = Buffer.alloc(16);
fs.readSync(fd, head, 0, 16, 0);
const headerSize = head.readUInt32LE(4);
const jsonLen = head.readUInt32LE(12);
const jsonBuf = Buffer.alloc(jsonLen);
fs.readSync(fd, jsonBuf, 0, jsonLen, 16);
const header = JSON.parse(jsonBuf.toString('utf8'));
const dataOffset = 8 + headerSize;
const total = fs.fstatSync(fd).size;

function walk(node, prefix, cb) {
  for (const [name, meta] of Object.entries(node.files || {})) {
    const p = prefix ? prefix + '/' + name : name;
    if (meta.files) walk(meta, p, cb);
    else cb(p, meta);
  }
}

const entries = [];
walk(header, '', (p, meta) => entries.push([p, meta]));

if (mode === 'list') {
  console.log('headerSize', headerSize, 'dataOffset', dataOffset, 'total', total, 'files', entries.length);
  const top = new Set(entries.map(e => e[0].split('/').slice(0, 2).join('/')));
  console.log([...top].slice(0, 80).join('\n'));
} else if (mode === 'extract') {
  const want = process.argv[5] ? new RegExp(process.argv[5]) : null;
  let n = 0;
  for (const [p, meta] of entries) {
    if (want && !want.test(p)) continue;
    const dest = path.join(outDir, p);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const buf = Buffer.alloc(meta.size);
    if (meta.size > 0) {
      const pos = dataOffset + Number(meta.offset);
      let read = 0;
      while (read < meta.size) {
        const r = fs.readSync(fd, buf, read, meta.size - read, pos + read);
        if (r <= 0) break;
        read += r;
      }
    }
    fs.writeFileSync(dest, buf);
    n++;
  }
  console.log('extracted', n, 'files to', outDir);
} else if (mode === 'find') {
  // find file paths matching regex, with sizes
  const re = new RegExp(process.argv[5]);
  entries.filter(e => re.test(e[0])).forEach(e => console.log(e[1].size, e[0]));
}
fs.closeSync(fd);
