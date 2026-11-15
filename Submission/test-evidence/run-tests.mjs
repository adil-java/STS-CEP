// Executes the Task 2 black-box test cases against the real HomeFit backend
// (Express routes + controllers + Prisma + MySQL test DB). Only Firebase identity is stubbed.
// Output: results.json (actual outputs + Pass/Fail per test case).
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

mock.module(B('services/firebase.service.js'), {
  defaultExport: {
    async verifyToken(t) {
      if (typeof t === 'string' && t.startsWith('valid:')) { const uid = t.slice(6); return { uid, email: `${uid}@test.local` }; }
      throw new Error('invalid token');
    },
    auth: { async deleteUser() {} },
  },
});

const { default: express } = await import(B('node_modules/express/index.js'));
const { default: jwt } = await import(B('node_modules/jsonwebtoken/index.js'));
const { default: safeErrors } = await import(B('middlewares/safeErrors.js'));
const { default: cartRoutes } = await import(B('routes/cart.routes.js'));
const { default: adminRoutes } = await import(B('routes/admin.router.js'));
const { default: prisma } = await import(B('config/db.js'));

// Same middleware order / handlers as backend/server.js
const app = express();
app.use(express.json());
app.use(safeErrors);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ success: false, error: 'Not Found' }));
app.use((err, req, res, next) => res.status(500).json({ success: false, error: 'Server Error', message: 'Something went wrong' }));
const server = app.listen(0);
const BASE = `http://127.0.0.1:${server.address().port}`;

async function call(method, url, { token, body } = {}) {
  const r = await fetch(BASE + url, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, body: json };
}

// ---- fixtures ----
async function reset() {
  const rows = await prisma.$queryRawUnsafe("SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name <> '_prisma_migrations'");
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  for (const { t } of rows) await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${t}\``);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
}
const id8 = () => randomUUID().slice(0, 8);
const user = (role = 'CUSTOMER') => { const uid = `uid-${id8()}`; return prisma.user.create({ data: { firebaseUid: uid, email: `${uid}@test.local`, name: uid, role } }); };
const product = (o = {}) => prisma.product.create({ data: { name: o.name || `Chair ${id8()}`, slug: `p-${id8()}`, description: 'test', price: 100, quantity: o.stock ?? 10, isActive: o.isActive ?? true, sku: `SKU-${id8()}`, images: [], ...(o.sellerId && { sellerId: o.sellerId }) } });
const category = (name) => prisma.category.create({ data: { name, slug: `${name.toLowerCase()}-${id8()}` } });
const adminTok = (u, role) => jwt.sign({ id: u.id, email: u.email, role: role || u.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
const custTok = (u) => `valid:${u.firebaseUid}`;
const msg = (r) => r.body?.message || r.body?.error || '';
const out = (r, extra = '') => `HTTP ${r.status}${msg(r) ? ` "${msg(r)}"` : ''}${extra ? `; ${extra}` : ''}`;
const lines = async (userId) => prisma.cartItem.findMany({ where: { cart: { userId } } });

// ---- test cases: each returns { actual, pass } ----
const cases = [];
const tc = (id, fn) => cases.push({ id, fn });

// ===== Module 1: Admin Category & Product Management =====
async function admin() { const a = await user('ADMIN'); return { a, tok: adminTok(a) }; }

tc('ADM-ECP-01', async () => { const { tok } = await admin();
  const r = await call('POST', '/api/admin/categories', { token: tok, body: { name: 'Decoratives' } });
  return { actual: out(r, `category saved: ${!!(await prisma.category.findFirst({ where: { name: 'Decoratives' } }))}`), pass: r.status === 201 }; });
tc('ADM-ECP-02', async () => { const { tok } = await admin();
  const r = await call('POST', '/api/admin/categories', { token: tok, body: { name: '' } });
  return { actual: out(r), pass: r.status === 400 }; });
tc('ADM-ECP-03', async () => { const { tok } = await admin();
  const r = await call('POST', '/api/admin/categories', { token: tok, body: { name: '   ' } });
  const saved = await prisma.category.findFirst({ where: { name: '   ' } });
  return { actual: out(r, `blank category saved in DB: ${!!saved}${saved ? ` (slug "${saved.slug}")` : ''}`), pass: r.status === 400 && !saved }; });
tc('ADM-ECP-04', async () => { const { tok } = await admin(); await category('Bed');
  const r = await call('POST', '/api/admin/categories', { token: tok, body: { name: 'Bed' } });
  return { actual: out(r), pass: r.status === 400 }; });
tc('ADM-ECP-05', async () => { const { tok } = await admin(); const c = await category('Table');
  const r = await call('PUT', `/api/admin/categories/${c.id}`, { token: tok, body: { name: 'Dining Table' } });
  return { actual: out(r, `name now "${(await prisma.category.findUnique({ where: { id: c.id } })).name}"`), pass: r.status === 200 }; });
tc('ADM-ECP-06', async () => { const { tok } = await admin(); await category('Bed'); const c = await category('Sofa');
  const r = await call('PUT', `/api/admin/categories/${c.id}`, { token: tok, body: { name: 'Bed' } });
  return { actual: out(r), pass: r.status === 400 }; });
tc('ADM-ECP-07', async () => { const { tok } = await admin(); const p = await product();
  const r = await call('PATCH', `/api/admin/products/${p.id}/status`, { token: tok, body: { field: 'isActive', value: false } });
  const now = await prisma.product.findUnique({ where: { id: p.id } });
  return { actual: out(r, `isActive in DB = ${now.isActive}`), pass: r.status === 200 && now.isActive === false }; });
tc('ADM-ECP-08', async () => { const { tok } = await admin(); const p = await product();
  const r = await call('PATCH', `/api/admin/products/${p.id}/status`, { token: tok, body: { field: 'price', value: 1 } });
  return { actual: out(r), pass: r.status === 400 }; });
// Decision table: admin access (token present? valid? role ADMIN?)
tc('ADM-DT-01', async () => { const r = await call('GET', '/api/admin/products');
  return { actual: out(r), pass: r.status === 401 }; });
tc('ADM-DT-02', async () => { const r = await call('GET', '/api/admin/products', { token: 'forged.token.value' });
  return { actual: out(r), pass: r.status === 401 }; });
tc('ADM-DT-03', async () => { const c = await user('CUSTOMER');
  const r = await call('GET', '/api/admin/products', { token: adminTok(c) });
  return { actual: out(r), pass: r.status === 403 }; });
tc('ADM-DT-04', async () => { const { tok } = await admin(); await product(); await product();
  const r = await call('GET', '/api/admin/products', { token: tok });
  return { actual: out(r, `${r.body?.data?.length} products listed`), pass: r.status === 200 && r.body?.data?.length === 2 }; });
// Decision table: delete category (exists? linked to products?)
tc('ADM-DT-05', async () => { const { tok } = await admin(); const c = await category('Lamps');
  const r = await call('DELETE', `/api/admin/categories/${c.id}`, { token: tok });
  return { actual: out(r, `still in DB: ${!!(await prisma.category.findUnique({ where: { id: c.id } }))}`), pass: r.status === 200 }; });
tc('ADM-DT-06', async () => { const { tok } = await admin(); const c = await category('Chairs'); const p = await product();
  await prisma.product.update({ where: { id: p.id }, data: { categories: { connect: { id: c.id } } } });
  const r = await call('DELETE', `/api/admin/categories/${c.id}`, { token: tok });
  return { actual: out(r, `still in DB: ${!!(await prisma.category.findUnique({ where: { id: c.id } }))}`), pass: r.status === 400 }; });
tc('ADM-DT-07', async () => { const { tok } = await admin();
  const r = await call('DELETE', `/api/admin/categories/${randomUUID()}`, { token: tok });
  return { actual: out(r), pass: r.status === 404 }; });
// Decision table: delete product (exists? has orders?)
tc('ADM-DT-08', async () => { const { tok } = await admin(); const s = await user('SELLER'); const p = await product({ sellerId: s.id });
  const r = await call('DELETE', `/api/admin/products/${p.id}`, { token: tok });
  return { actual: out(r, `still in DB: ${!!(await prisma.product.findUnique({ where: { id: p.id } }))}`), pass: r.status === 200 && !(await prisma.product.findUnique({ where: { id: p.id } })) }; });
tc('ADM-DT-09', async () => { const { tok } = await admin(); const s = await user('SELLER'); const c = await user(); const p = await product({ sellerId: s.id });
  await prisma.order.create({ data: { orderNumber: `ORD-${id8()}`, userId: c.id, sellerId: s.id, subtotal: 100, tax: 10, shipping: 0, total: 110, paymentStatus: 'PAID', paymentMethod: 'card', shippingAddress: {}, items: { create: [{ productId: p.id, productName: p.name, quantity: 1, price: 100 }] } } });
  const r = await call('DELETE', `/api/admin/products/${p.id}`, { token: tok });
  const now = await prisma.product.findUnique({ where: { id: p.id } });
  return { actual: out(r, `product kept in DB: ${!!now}, isActive = ${now?.isActive}`), pass: r.status === 200 && now && now.isActive === false }; });
tc('ADM-DT-10', async () => { const { tok } = await admin();
  const r = await call('DELETE', `/api/admin/products/${randomUUID()}`, { token: tok });
  return { actual: out(r), pass: r.status === 404 }; });

// ===== Module 2: Cart Management =====
async function cust(o) { const u = await user(); const p = await product(o); return { u, p, tok: custTok(u) }; }
const add = (tok, body) => call('POST', '/api/cart/items', { token: tok, body });
for (const [id, q, ok] of [['CART-BVA-01', -1, false], ['CART-BVA-02', 0, false], ['CART-BVA-03', 1, true], ['CART-BVA-04', 2, true], ['CART-BVA-05', 9, true], ['CART-BVA-06', 10, true], ['CART-BVA-07', 11, false]]) {
  tc(id, async () => { const { u, p, tok } = await cust();
    const r = await add(tok, { productId: p.id, quantity: q });
    const l = await lines(u.id);
    return { actual: out(r, `cart lines stored: ${l.length}${l.length ? ` (qty ${l[0].quantity})` : ''}${r.body?.total !== undefined ? `, total ${r.body.total}` : ''}`), pass: ok ? (r.status === 201 && l[0]?.quantity === q) : (r.status === 400 && l.length === 0) }; });
}
tc('CART-BVA-08', async () => { const { u, p, tok } = await cust(); await add(tok, { productId: p.id, quantity: 3 });
  const [line] = await lines(u.id);
  const r = await call('PUT', `/api/cart/items/${line.id}`, { token: tok, body: { quantity: 0 } });
  const l = await lines(u.id);
  return { actual: out(r, `cart lines left: ${l.length}`), pass: r.status === 200 && l.length === 0 }; });
tc('CART-ECP-01', async () => { const { u, tok } = await cust();
  const r = await add(tok, { quantity: 1 });
  return { actual: out(r, `cart lines stored: ${(await lines(u.id)).length}`), pass: r.status === 400 }; });
tc('CART-ECP-02', async () => { const { u, tok } = await cust();
  const r = await add(tok, { productId: randomUUID(), quantity: 1 });
  return { actual: out(r, `cart lines stored: ${(await lines(u.id)).length}`), pass: r.status === 404 || r.status === 400 }; });
tc('CART-ECP-03', async () => { const { u, p, tok } = await cust();
  const r = await add(tok, { productId: p.id, quantity: 'abc' });
  return { actual: out(r, `cart lines stored: ${(await lines(u.id)).length}`), pass: r.status === 400 }; });
tc('CART-ECP-04', async () => { const { u, p, tok } = await cust({ isActive: false });
  const r = await add(tok, { productId: p.id, quantity: 1 });
  const l = await lines(u.id);
  return { actual: out(r, `cart lines stored: ${l.length}`), pass: r.status === 400 && l.length === 0 }; });
tc('CART-ECP-05', async () => { const p = await product();
  const r = await call('POST', '/api/cart/items', { body: { productId: p.id, quantity: 1 } });
  return { actual: out(r), pass: r.status === 401 }; });
tc('CART-ECP-06', async () => { const { u, p, tok } = await cust();
  await add(tok, { productId: p.id, quantity: 1, options: { color: 'Brown' } });
  const r = await add(tok, { productId: p.id, quantity: 1, options: { color: 'Brown' } });
  const l = await lines(u.id);
  return { actual: out(r, `cart lines: ${l.length}, qty ${l.map((x) => x.quantity).join(',')}, total ${r.body?.total}`), pass: r.status === 201 && l.length === 1 && l[0].quantity === 2 }; });

// ---- run ----
const results = [];
for (const c of cases) {
  await reset();
  let res;
  try { res = await c.fn(); } catch (e) { res = { actual: `ERROR: ${e.message}`, pass: false }; }
  results.push({ id: c.id, actual: res.actual, status: res.pass ? 'Pass' : 'Fail', executedAt: new Date().toISOString() });
  console.log(c.id.padEnd(12), res.pass ? 'PASS' : 'FAIL', '|', res.actual);
}
const here = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2));
console.log(`\nTotal ${results.length}, Pass ${results.filter((r) => r.status === 'Pass').length}, Fail ${results.filter((r) => r.status === 'Fail').length}`);
server.close(); await prisma.$disconnect(); process.exit(0);
