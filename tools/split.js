// split en unit dumps into translation batches
const fs = require('fs');

const plan = [
  ['rpc', 'i18n/rpc.en.json', 8],
  ['ctrl', 'i18n/ctrl.en.json', 1],
  ['cm', 'i18n/cm.en.json', 1],
];

for (const [tag, file, n] of plan) {
  const units = JSON.parse(fs.readFileSync(file, 'utf8'));
  const per = Math.ceil(units.length / n);
  for (let i = 0; i < n; i++) {
    const chunk = units.slice(i * per, (i + 1) * per);
    if (!chunk.length) continue;
    const out = `i18n/src/${tag}-${String(i + 1).padStart(2, '0')}.json`;
    fs.mkdirSync('i18n/src', { recursive: true });
    fs.writeFileSync(out, JSON.stringify(chunk, null, 1), 'utf8');
    console.log(out, chunk.length);
  }
}
