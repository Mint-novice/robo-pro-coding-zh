// pack a directory into an asar archive (compatible with electron/asar reader)
const fs = require('fs');
const path = require('path');

const srcDir = process.argv[2];
const outFile = process.argv[3];
const SKIP = /\.orig$/;

function collect(dir, rel, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const e of entries) {
    if (SKIP.test(e.name)) continue;
    const abs = path.join(dir, e.name);
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) collect(abs, r, acc);
    else acc.push({ abs, rel: r, size: fs.statSync(abs).size });
  }
}

const files = [];
collect(srcDir, '', files);

let dataLen = 0;
for (const f of files) { f.offset = dataLen; dataLen += f.size; }

const header = { files: {} };
for (const f of files) {
  const parts = f.rel.split('/');
  let node = header;
  for (let i = 0; i < parts.length - 1; i++) {
    node.files[parts[i]] = node.files[parts[i]] || { files: {} };
    node = node.files[parts[i]];
  }
  node.files[parts[parts.length - 1]] = { size: f.size, offset: String(f.offset) };
}

const json = Buffer.from(JSON.stringify(header), 'utf8');
const strLen = json.length;
const payloadLen = 4 + strLen + ((4 - ((4 + strLen) % 4)) % 4);
// build prefix properly: [uint32 payloadSize=4][uint32 size][payloadSize][strLen][json][pad]
const size = 4 + payloadLen;
const prefix = Buffer.alloc(8);
prefix.writeUInt32LE(4, 0);
prefix.writeUInt32LE(size, 4);

const body = Buffer.alloc(size);
body.writeUInt32LE(payloadLen, 0);
body.writeUInt32LE(strLen, 4);
json.copy(body, 8);

const fd = fs.openSync(outFile, 'w');
fs.writeSync(fd, prefix, 0, 8, 0);
fs.writeSync(fd, body, 0, body.length, 8);
let pos = 8 + body.length;
for (const f of files) {
  const buf = fs.readFileSync(f.abs);
  fs.writeSync(fd, buf, 0, buf.length, pos);
  pos += buf.length;
}
fs.closeSync(fd);
console.log(`packed ${files.length} files, data ${dataLen} bytes, header ${body.length}, total ${pos} -> ${outFile}`);
