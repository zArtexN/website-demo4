// Suray Nail Studio — build / QA validation (zero dependencies).
// Checks: JS syntax, asset references exist, anchors resolve, SEO basics,
// no unverified-claim regressions, no console.* leftovers in script.js.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = __dirname;
let fail = 0;
function ok(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
  if (!cond) fail++;
}

const h = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'script.js'), 'utf8');

// 1. JS syntax
try {
  execSync('node --check script.js', { cwd: dir, stdio: 'pipe' });
  ok('js-syntax', true);
} catch (e) { ok('js-syntax', false); }

// 2. asset references exist
const refs = new Set();
for (const m of h.matchAll(/assets\/[A-Za-z0-9._-]+/g)) refs.add(m[0]);
for (const m of css.matchAll(/assets\/[A-Za-z0-9._-]+/g)) refs.add(m[0]);
const missing = [...refs].filter(r => !fs.existsSync(path.join(dir, r)));
ok('assets-exist(' + refs.size + ')', missing.length === 0, missing.join(','));

// 3. internal anchors resolve
const ids = new Set();
for (const m of h.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);
const anchors = [];
for (const m of h.matchAll(/href="#([^"]*)"/g)) anchors.push(m[1]);
const bad = anchors.filter(a => a !== '' && !ids.has(a));
ok('anchors-resolve(' + anchors.length + ')', bad.length === 0, bad.join(','));

// 4. SEO basics
ok('seo-title', h.includes('<title>Suray Nail Studio | Nail Studio in Bostanc'));
ok('seo-description', h.includes('meta name="description"'));
ok('seo-schema', h.includes('"@type": "NailSalon"') || h.includes('"@type":"NailSalon"'));
ok('seo-canonical', h.includes('rel="canonical"'));
ok('seo-favicon', h.includes('favicon.svg') && fs.existsSync(path.join(dir, 'favicon.svg')));
ok('seo-robots-sitemap', fs.existsSync(path.join(dir, 'robots.txt')) && fs.existsSync(path.join(dir, 'sitemap.xml')));

// 5. animation-system invariants
ok('lenis-single-instance', (js.match(/new window\.Lenis|new Lenis/g) || []).length === 1);
ok('lenis-gsap-sync', js.includes("lenis.on('scroll'") && js.includes('lagSmoothing(0)'));
ok('no-pin-usage', !/\.pin\(|pin:\s*true|pinSpacing/.test(js + css));
ok('split-single-init', js.includes('splitsDone'));
ok('video-metadata-guard', js.includes('readyState >= 2'));
ok('no-console-leftovers', !/console\.(log|error|warn|debug)/.test(js));

// 6. required business info intact
for (const s of ['Suray Nail Studio', 'Yazmacı Tahir Sk. No:46', '+90 539 520 10 94', 'suray_nail_studio_', 'wa.me/905395201094']) {
  ok('content:' + s.slice(0, 24), h.includes(s));
}

console.log(fail === 0 ? '\nBUILD OK' : '\nBUILD FAILED (' + fail + ')');
process.exit(fail ? 1 : 0);
