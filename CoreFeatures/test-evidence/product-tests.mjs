// Seller Create Product (with 3D model generation) - black-box API test execution.
// Real: Express route (multer upload limits/filter), auth middleware, controller, service, Prisma, MySQL.
// Stubbed (no credentials available): Firebase identity, Cloudinary upload, Gradio 3D-model service.
import { mock } from 'node:test';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.DATABASE_URL = 'mysql://root@127.0.0.1:3307/homefit_test';
process.env.JWT_SECRET = 'sts-cep-test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';

const BACKEND = 'c:/Users/khurr/OneDrive/Desktop/ProjectAdil/STS_CEP/projectTesting/HomeFit/backend';
const B = (p) => pathToFileURL(path.join(BACKEND, p)).href;

// --- test doubles for external services ---
const gen = { mode: 'success', calls: 0 };
const cloud = { uploads: 0 };
mock.module(B('services/firebase.service.js'), { defaultExport: {
  async verifyToken(t) { if (String(t).startsWith('valid:')) { const uid = t.slice(6); return { uid, email: `${uid}@test.local` }; } throw new Error('invalid token'); },
  auth: { async deleteUser() {} },
} });
mock.module(B('utils/cloudinary.js'), { namedExports: {
  async uploadToCloudinary(p) { cloud.uploads++; return { url: `https://res.cloudinary.test/${path.basename(p)}`, public_id: path.basename(p) }; },
  async deleteFromCloudinary() { return true; },
  async uploadImageDataUri() { return { url: 'https://res.cloudinary.test/avatar.png' }; },
} });
mock.module(B('services/3dModel.service.js'), { namedExports: {
  async generate3DModel() { gen.calls++; if (gen.mode === 'fail') throw new Error('3D service unavailable'); return { glbUrl: 'https://res.cloudinary.test/model.glb', objUrl: 'https://res.cloudinary.test/model.obj' }; },
  async generate3DModelHandler(req, res) { res.status(501).end(); },
} });

const { default: express } = await import(B('node_modules/express/index.js'));
const { default: safeErrors } = await import(B('middlewares/safeErrors.js'));
const { default: productRoutes } = await import(B('routes/product.routes.js'));
const { default: prisma } = await import(B('config/db.js'));

const app = express();
app.use(express.json());
app.use(safeErrors);
app.use('/api/products', productRoutes);
app.use((req, res) => res.status(404).json({ success: false, error: 'Not Found' }));
app.use((err, req, res, next) => res.status(500).json({ success: false, error: 'Server Error', message: 'Something went wrong' })); // same as server.js
const server = app.listen(0);
const BASE = `http://127.0.0.1:${server.address().port}`;

// --- helpers ---
async function reset() {
  const rows = await prisma.$queryRawUnsafe("SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name <> '_prisma_migrations'");
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  for (const { t } of rows) await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${t}\``);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  gen.mode = 'success'; gen.calls = 0; cloud.uploads = 0;
}
const user = (role) => { const uid = `uid-${randomUUID().slice(0, 8)}`; return prisma.user.create({ data: { firebaseUid: uid, email: `${uid}@test.local`, name: uid, role } }); };
const png = (bytes = 2048) => { const b = Buffer.alloc(bytes); Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b); return b; };
const MB5 = 5 * 1024 * 1024;

async function create({ role = 'SELLER', token, data, files = [] }) {
  let tok = token;
  if (tok === undefined && role) tok = `valid:${(await user(role)).firebaseUid}`;
  const fd = new FormData();
  fd.append('productData', JSON.stringify(data));
  for (const f of files) fd.append('files', new Blob([f.buf], { type: f.type || 'image/png' }), f.name || 'chair.png');
  const r = await fetch(`${BASE}/api/products`, { method: 'POST', headers: tok ? { Authorization: `Bearer ${tok}` } : {}, body: fd });
  let body = null; try { body = await r.json(); } catch {}
  const products = await prisma.product.findMany();
  return { status: r.status, body, products, p: products[0] };
}
const base = (o = {}) => ({ name: 'Oak Dining Chair', description: 'Solid oak chair', price: 15000, quantity: 20, ...o });
const msg = (r) => r.body?.error || r.body?.message || '';
const out = (r, extra) => `HTTP ${r.status}${msg(r) ? ` "${msg(r)}"` : ''}; products saved: ${r.products.length}${r.p ? ` (${extra(r.p)})` : ''}`;
const fields = (p) => `price ${p.price}, stock ${p.quantity}, images ${p.images.length}, AR model ${p.ARModelUrl ? 'yes' : 'no'}`;
const created = (r) => r.status === 201 && r.products.length === 1;
const rejected = (r, code = 400) => r.status === code && r.products.length === 0;

const cases = [];
const tc = (id, fn) => cases.push({ id, fn });

// Decision table: 3D model generation
tc('PROD-DT-01', async () => { const r = await create({ data: base({ generate3D: true }), files: [{ buf: png() }] });
  return { actual: `${out(r, fields)}; 3D generator called ${gen.calls}x`, pass: created(r) && !!r.p.ARModelUrl && !!r.p.objModelUrl && gen.calls === 1 }; });
tc('PROD-DT-02', async () => { gen.mode = 'fail'; const r = await create({ data: base({ generate3D: true }), files: [{ buf: png() }] });
  return { actual: `${out(r, fields)}; 3D generator called ${gen.calls}x (failed)`, pass: created(r) && !r.p.ARModelUrl && r.p.images.length === 1 }; });
tc('PROD-DT-03', async () => { const r = await create({ data: base({ generate3D: true }), files: [] });
  return { actual: `${out(r, fields)}; 3D generator called ${gen.calls}x`, pass: created(r) && !r.p.ARModelUrl && gen.calls === 0 }; });
tc('PROD-DT-04', async () => { const r = await create({ data: base({ generate3D: false }), files: [{ buf: png() }] });
  return { actual: `${out(r, fields)}; 3D generator called ${gen.calls}x`, pass: created(r) && !r.p.ARModelUrl && gen.calls === 0 && r.p.images.length === 1 }; });
// ECP
tc('PROD-ECP-01', async () => { const r = await create({ data: base({ name: undefined }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-02', async () => { const r = await create({ data: base({ name: '   ' }), files: [{ buf: png() }] }); return { actual: out(r, (p) => `name "${p.name}", slug "${p.slug}"`), pass: rejected(r) }; });
tc('PROD-ECP-03', async () => { const r = await create({ data: base({ name: 12345 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-04', async () => { const r = await create({ data: base({ price: undefined }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-05', async () => { const r = await create({ data: base({ price: 'abc' }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-06', async () => { const r = await create({ data: base({ quantity: 'ten' }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-07', async () => { const r = await create({ data: base(), files: [{ buf: Buffer.from('%PDF-1.4 test'), type: 'application/pdf', name: 'catalogue.pdf' }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-ECP-08', async () => { const r = await create({ role: 'CUSTOMER', data: base(), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r, 403) }; });
tc('PROD-ECP-09', async () => { const r = await create({ role: null, token: null, data: base(), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r, 401) }; });
// BVA
tc('PROD-BVA-01', async () => { const r = await create({ data: base({ price: -1 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-BVA-02', async () => { const r = await create({ data: base({ price: 0 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-BVA-03', async () => { const r = await create({ data: base({ price: 0.01 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: created(r) && r.p.price === 0.01 }; });
tc('PROD-BVA-04', async () => { const r = await create({ data: base({ quantity: -1 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-BVA-05', async () => { const r = await create({ data: base({ quantity: 0 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: created(r) && r.p.quantity === 0 }; });
tc('PROD-BVA-06', async () => { const r = await create({ data: base({ quantity: 1 }), files: [{ buf: png() }] }); return { actual: out(r, fields), pass: created(r) && r.p.quantity === 1 }; });
tc('PROD-BVA-07', async () => { const r = await create({ data: base(), files: Array.from({ length: 5 }, (_, i) => ({ buf: png(), name: `img${i}.png` })) }); return { actual: out(r, fields), pass: created(r) && r.p.images.length === 5 }; });
tc('PROD-BVA-08', async () => { const r = await create({ data: base(), files: Array.from({ length: 6 }, (_, i) => ({ buf: png(), name: `img${i}.png` })) }); return { actual: out(r, fields), pass: rejected(r) }; });
tc('PROD-BVA-09', async () => { const r = await create({ data: base(), files: [{ buf: png(MB5) }] }); return { actual: out(r, fields), pass: created(r) && r.p.images.length === 1 }; });
tc('PROD-BVA-10', async () => { const r = await create({ data: base(), files: [{ buf: png(MB5 + 1) }] }); return { actual: out(r, fields), pass: rejected(r) }; });

const results = [];
for (const c of cases) {
  await reset();
  let res;
  try { res = await c.fn(); } catch (e) { res = { actual: `ERROR: ${e.message}`, pass: false }; }
  results.push({ id: c.id, actual: res.actual, status: res.pass ? 'Pass' : 'Fail', executedAt: new Date().toISOString() });
  console.log(c.id.padEnd(12), res.pass ? 'PASS' : 'FAIL', '|', res.actual);
}
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'product-results.json'), JSON.stringify(results, null, 2));
console.log(`\nTotal ${results.length}, Pass ${results.filter((r) => r.status === 'Pass').length}, Fail ${results.filter((r) => r.status === 'Fail').length}`);
server.close(); await prisma.$disconnect(); process.exit(0);
