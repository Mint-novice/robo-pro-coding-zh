// 条目层校验：i18n/en/*.json（英） vs i18n/zh/*.zh.json（中）
// 用法: node tools/validate-i18n.js <i18n 目录>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || 'i18n';
const srcDir = path.join(dir, 'en');
const outDir = path.join(dir, 'zh');

if (!fs.existsSync(srcDir) || !fs.existsSync(outDir)) {
  console.error('缺少 i18n/en 或 i18n/zh');
  process.exit(2);
}

const pairs = fs.readdirSync(srcDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ name: f.replace(/\.json$/, ''), src: path.join(srcDir, f), out: path.join(outDir, f.replace(/\.json$/, '.zh.json')) }));

const tagRe = /<x\b[^>]*\/>/g;
const phRe = /%(\d+)/g;

let total = 0;
let problems = 0;

for (const p of pairs) {
  if (!fs.existsSync(p.out)) {
    console.log(JSON.stringify({ name: p.name, error: 'MISSING_ZH_FILE', out: p.out }));
    problems++;
    continue;
  }
  const src = JSON.parse(fs.readFileSync(p.src, 'utf8'));
  const out = JSON.parse(fs.readFileSync(p.out, 'utf8'));
  const srcMap = new Map(src.map((e) => [e.id, e.source]));
  const outMap = new Map(Object.entries(out));

  const missing = [...srcMap.keys()].filter((k) => !outMap.has(k));
  const extra = [...outMap.keys()].filter((k) => !srcMap.has(k));
  const empty = [];
  const phBad = [];
  const tagBad = [];

  for (const [id, zh] of outMap) {
    const en = srcMap.get(id) || '';
    if (typeof zh !== 'string' || !zh.trim()) empty.push(id);
    const pEn = (en.match(phRe) || []).sort().join(',');
    const pZh = ((zh || '').match(phRe) || []).sort().join(',');
    if (pEn !== pZh) phBad.push(id);
    const tEn = en.match(tagRe) || [];
    const tZh = (zh || '').match(tagRe) || [];
    if (tEn.length !== tZh.length || tEn.some((t, i) => t !== tZh[i])) tagBad.push(id);
  }

  const bad = missing.length + extra.length + empty.length + phBad.length + tagBad.length;
  problems += bad;
  total += outMap.size;

  console.log(JSON.stringify({
    name: p.name, src: srcMap.size, out: outMap.size, bad,
    empty: empty.length, phBad: phBad.length, tagBad: tagBad.length,
    missing: missing.length, extra: extra.length,
    ...(bad ? { sample: { empty: empty.slice(0, 3), phBad: phBad.slice(0, 3), tagBad: tagBad.slice(0, 3) } } : {}),
  }));
}

console.log('TOTAL_ENTRIES', total, 'PROBLEMS', problems);
process.exit(problems ? 1 : 0);
