// patch main.js: add zh language (enum + settings option)
const fs = require('fs');

const file = process.argv[2];
let s = fs.readFileSync(file, 'utf8');
const before = s;

const report = [];
function must(cond, msg) { if (!cond) { console.error('FAIL:', msg); process.exit(1); } report.push('OK: ' + msg); }

// ---- 1) language enum ----
const enumAnchor = ',u.UA="ua",u}(nd||{})';
must(s.includes(enumAnchor), 'enum anchor found');
s = s.replace(enumAnchor, ',u.UA="ua",u.ZH="zh",u}(nd||{})');

// ---- 2) settings component template region ----
const regionStartAnchor = 'selectors:[["app-settings"]],features:[Ln],decls:62,vars:41,consts:[';
const regionEndAnchor = 'dependencies:[Gr,po,nu,aG,Fa,RO,Nl,p5,Gg,G1,U7,O5,Yy,lue,Ao]';
const rs = s.indexOf(regionStartAnchor);
const re = s.indexOf(regionEndAnchor);
must(rs > 0 && re > rs, 'settings template region located');
let region = s.slice(rs, re);
const regionLen = region.length;

// 2a) decls/vars
region = region.replace('decls:62,vars:41', 'decls:64,vars:42');

// 2b) renumber create-block node indices >= 33 (must run before insertion)
let renumberCreate = 0;
region = region.replace(/\b(v|Ce|Be|Dt|We)\((\d+)([,)])/g, (m, fn, num, tail) => {
  const n = parseInt(num, 10);
  if (n < 33) return m;
  renumberCreate++;
  return `${fn}(${n + 2}${tail}`;
});
must(renumberCreate > 20, `create-block renumbered (${renumberCreate} named calls)`);

// 2b2) chained element calls "(37,"mat-label")" carry the node index too
let renumberChained = 0;
region = region.replace(/\)\((\d+),/g, (m, num) => {
  const n = parseInt(num, 10);
  if (n < 33) return m;
  renumberChained++;
  return `)(${n + 2},`;
});
must(renumberChained === 4, `chained element calls renumbered (${renumberChained}, expected 4)`);

// 2c) insert new mat-option right after the Ukrainian option (uses freed indices 33/34)
const uaOpt = /v\(31,"mat-option",12\),Ce\(32,[^)]*\),L\(\)/;
must(uaOpt.test(region), 'ukrainian mat-option matched');
region = region.replace(uaOpt, (m) => m + ',v(33,"mat-option",12),Ce(34,"\\u4e2d\\u6587"),L()');

// 2d) renumber update-block pipe node refs Xe(N, ...) with N >= 33
let renumberUpdate = 0;
region = region.replace(/\bXe\((\d+),/g, (m, num) => {
  const n = parseInt(num, 10);
  if (n < 33) return m;
  renumberUpdate++;
  return `Xe(${n + 2},`;
});
must(renumberUpdate === 7, `update-block Xe renumbered (${renumberUpdate} refs, expected 7)`);

// 2e) bind the new option value
must(region.includes('Wn("value",h.LANGUAGE.UA),'), 'UA value binding found');
region = region.replace('Wn("value",h.LANGUAGE.UA),', 'Wn("value",h.LANGUAGE.UA),A(2),Wn("value",h.LANGUAGE.ZH),');

report.push(`region ${regionLen} -> ${region.length} chars`);
s = s.slice(0, rs) + region + s.slice(re);

fs.writeFileSync(file, s);
report.push(`file ${before.length} -> ${s.length} bytes`);
console.log(report.join('\n'));
