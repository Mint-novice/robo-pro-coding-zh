// build messages.zh.xlf from en.xlf + zh map json(s)
const fs = require('fs');

const enPath = process.argv[2];
const outPath = process.argv[3];
const maps = process.argv.slice(4); // one or more json files: {id: zh}

const zh = {};
for (const f of maps) {
  Object.assign(zh, JSON.parse(fs.readFileSync(f, 'utf8')));
}

let raw = fs.readFileSync(enPath, 'utf8');
const used = new Set();
let withTarget = 0;
let inserted = 0;
let missing = [];

const unitRe = /<trans-unit\b[\s\S]*?<\/trans-unit>/g;
raw = raw.replace(unitRe, (unit) => {
  const idm = /\bid="([^"]*)"/.exec(unit);
  if (!idm) return unit;
  const id = idm[1];
  const t = zh[id];
  if (t === undefined) { missing.push(id); return unit; }
  used.add(id);
  const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (/<target\b[^>]*>[\s\S]*?<\/target>/.test(unit)) {
    withTarget++;
    return unit.replace(/<target\b[^>]*>[\s\S]*?<\/target>/, `<target>${esc}</target>`);
  }
  if (/<target\b[^>]*\/>/.test(unit)) {
    withTarget++;
    return unit.replace(/<target\b[^>]*\/>/, `<target>${esc}</target>`);
  }
  inserted++;
  return unit.replace(/<\/trans-unit>/, `      <target>${esc}</target></trans-unit>`);
});

raw = raw.replace(/<file\b([^>]*)\btarget-language="[^"]*"/, '<file$1target-language="zh-CN"');
if (!/target-language="/.test(raw)) {
  raw = raw.replace(/<file\b/, '<file target-language="zh-CN"');
}

fs.writeFileSync(outPath, raw, 'utf8');
console.log(`[${outPath}] replaced=${withTarget} inserted=${inserted} missing=${missing.length}`);
if (missing.length) console.log('MISSING:', missing.slice(0, 20).join(', '));
