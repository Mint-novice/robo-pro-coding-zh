// dump XLIFF trans-units -> JSON batches for translation
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const outJson = process.argv[3];
const raw = fs.readFileSync(file, 'utf8');

const units = [];
const re = /<trans-unit\b[^>]*\bid="([^"]*)"[^>]*>([\s\S]*?)<\/trans-unit>/g;
let m;
while ((m = re.exec(raw))) {
  const id = m[1];
  const body = m[2];
  const srcM = /<source\b[^>]*>([\s\S]*?)<\/source>/.exec(body);
  const source = srcM ? srcM[1] : '';
  units.push({ id, source });
}

fs.writeFileSync(outJson, JSON.stringify(units, null, 1), 'utf8');
console.log('units:', units.length, '->', outJson);
const withPh = units.filter(u => /<x\b/.test(u.source)).length;
const empty = units.filter(u => !u.source.trim()).length;
console.log('with placeholder:', withPh, 'empty source:', empty);
