// AR Preview - black-box execution of the REAL frontend code (components/ARPreviewButton.tsx +
// utils/checkARSupport.ts), compiled with esbuild. The device environment is simulated by stubs:
// platform (android/ios/web), Expo Go, the ViroReact AR module and the ARCore/ARKit answer.
// Observed outputs: which screen the button opens (router.push) or which alert it shows.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const FRONT = 'c:/Users/khurr/OneDrive/Desktop/ProjectAdil/STS_CEP/projectTesting/HomeFit/frontend';

// Simulated device + spies (read by the stubs at call time)
const env = globalThis.__AR = { os: 'android', ownership: 'standalone', viro: 'present', answers: [], asked: 0, pushes: [], alerts: [] };

const stubs = {
  react: `export function useState(v){return [v,()=>{}]} export function useEffect(){} export default {useState,useEffect};`,
  'react/jsx-runtime': `export function jsx(type,props){return {type,props}} export const jsxs=jsx; export const Fragment='Fragment';`,
  'react-native': `export const Platform={get OS(){return globalThis.__AR.os}}; export const Alert={alert:(t,m)=>globalThis.__AR.alerts.push(t)};
    export const StyleSheet={create:(s)=>s}; export const TouchableOpacity='TouchableOpacity', View='View', Text='Text', ActivityIndicator='ActivityIndicator';`,
  'expo-constants': `export default {get appOwnership(){return globalThis.__AR.ownership}};`,
  'expo-router': `export const router={push:(u)=>globalThis.__AR.pushes.push(u)};`,
  '@expo/vector-icons': `export const Ionicons='Ionicons';`,
  theme: `export const useTheme=()=>({theme:{colors:{primary:'#000'}}});`,
  logger: `export const logger={warn(){},error(){},debug(){},info(){}}; export default logger;`,
  '@reactvision/react-viro': `module.exports = { get isARSupportedOnDevice(){ const e=globalThis.__AR;
    if(e.viro==='missing') return undefined; if(e.viro==='error') throw new Error('Native module ViroReact not linked');
    return () => { e.asked++; const a = e.answers.length > 1 ? e.answers.shift() : e.answers[0];
      if(a==='yes') return Promise.resolve({isARSupported:true}); if(a==='no') return Promise.resolve({isARSupported:false});
      if(a==='hang') return new Promise(()=>{}); return Promise.reject(new Error(a)); }; } };`,
};
const plugin = { name: 'stubs', setup(b) {
  b.onResolve({ filter: /.*/ }, (a) => {
    if (a.path === '@/utils/checkARSupport') return { path: path.join(FRONT, 'utils/checkARSupport.ts') };
    if (a.path === '@/utils/logger') return { path: 'logger', namespace: 'stub' };
    if (a.path.endsWith('contexts/ThemeContext')) return { path: 'theme', namespace: 'stub' };
    if (stubs[a.path]) return { path: a.path, namespace: 'stub' };
  });
  b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: stubs[a.path], loader: 'js' }));
} };
const entry = `export { ARPreviewButton } from ${JSON.stringify(path.join(FRONT, 'components/ARPreviewButton.tsx'))};
export { resetARSupportCache } from ${JSON.stringify(path.join(FRONT, 'utils/checkARSupport.ts'))};`;
await esbuild.build({ stdin: { contents: entry, resolveDir: here, loader: 'ts' }, bundle: true, format: 'esm', platform: 'neutral',
  jsx: 'automatic', outfile: path.join(here, 'ar-bundle.mjs'), plugins: [plugin], logLevel: 'error' });
const { ARPreviewButton, resetARSupportCache } = await import(pathToFileURL(path.join(here, 'ar-bundle.mjs')).href);

// Press the real button's onPress handler and report what happened
async function press(modelUrl) {
  const el = ARPreviewButton({ modelUrl });
  await el.props.onPress();
}
function setup(o) { resetARSupportCache(); Object.assign(env, { os: 'android', ownership: 'standalone', viro: 'present', answers: ['yes'], asked: 0, pushes: [], alerts: [] }, o); }
const MODEL = 'https://res.cloudinary.com/homefit/raw/upload/oak-chair.glb';
const screen = () => env.alerts.length ? `Alert "${env.alerts[0]}", no navigation` : env.pushes.length ? `Opened ${env.pushes.map((u) => u.split('?')[0]).join(', ')}` : 'Nothing happened';
const isAR = () => env.pushes.length === 1 && env.pushes[0].startsWith('/product/ar?') && !env.alerts.length;
const isViewer = () => env.pushes.length === 1 && env.pushes[0].startsWith('/product/model-viewer?') && !env.alerts.length;
const isAlert = () => env.alerts[0] === '3D preview not available' && env.pushes.length === 0;

const cases = [];
const tc = (id, fn) => cases.push({ id, fn });
tc('AR-DT-01', async () => { setup({}); await press(null); return { actual: screen(), pass: isAlert() }; });
tc('AR-DT-02', async () => { setup({ os: 'web' }); await press(MODEL); return { actual: screen(), pass: isViewer() }; });
tc('AR-DT-03', async () => { setup({ ownership: 'expo' }); await press(MODEL); return { actual: screen(), pass: isViewer() }; });
tc('AR-DT-04', async () => { setup({ viro: 'missing' }); await press(MODEL); return { actual: screen(), pass: isViewer() }; });
tc('AR-DT-05', async () => { setup({ viro: 'error' }); await press(MODEL); return { actual: screen(), pass: isViewer() }; });
tc('AR-DT-06', async () => { setup({ answers: ['UNSUPPORTED'] }); await press(MODEL); return { actual: `${screen()}; device asked ${env.asked}x`, pass: isViewer() }; });
tc('AR-DT-07', async () => { setup({ answers: ['yes'] }); await press(MODEL); return { actual: `${screen()}; device asked ${env.asked}x`, pass: isAR() }; });
tc('AR-DT-08', async () => { setup({ os: 'ios', answers: ['yes'] }); await press(MODEL); return { actual: `${screen()}; device asked ${env.asked}x`, pass: isAR() }; });
tc('AR-DT-09', async () => { setup({ answers: ['TRANSIENT', 'TRANSIENT', 'yes'] }); await press(MODEL); return { actual: `${screen()}; device asked ${env.asked}x`, pass: isAR() && env.asked === 3 }; });
tc('AR-DT-10', async () => { setup({ answers: ['hang'] }); const t = Date.now(); await press(MODEL); const first = screen(); const secs = ((Date.now() - t) / 1000).toFixed(1);
  env.pushes = []; env.answers = ['yes']; await press(MODEL);
  return { actual: `1st tap: ${first} after ${secs}s; 2nd tap (device now answers yes): ${screen()}`, pass: first.includes('model-viewer') && isAR() }; });
tc('AR-DT-11', async () => { setup({ answers: ['yes'] }); await press(MODEL); env.pushes = []; await press(MODEL);
  return { actual: `2nd tap: ${screen()}; device asked ${env.asked}x in total`, pass: isAR() && env.asked === 1 }; });
tc('AR-ECP-01', async () => { setup({}); await press(''); return { actual: screen(), pass: isAlert() }; });
tc('AR-ECP-02', async () => { setup({}); await press('   '); return { actual: screen(), pass: isAlert() }; });
tc('AR-ECP-03', async () => { setup({}); const url = 'https://cdn.homefit.test/models/oak chair & table.glb'; await press(url);
  const sent = env.pushes[0] ? decodeURIComponent(env.pushes[0].split('modelUrl=')[1]) : null;
  return { actual: `${screen()}; modelUrl received by AR screen = "${sent}"`, pass: isAR() && sent === url }; });

const results = [];
for (const c of cases) {
  let res;
  try { res = await c.fn(); } catch (e) { res = { actual: `ERROR: ${e.message}`, pass: false }; }
  results.push({ id: c.id, actual: res.actual, status: res.pass ? 'Pass' : 'Fail', executedAt: new Date().toISOString() });
  console.log(c.id.padEnd(10), res.pass ? 'PASS' : 'FAIL', '|', res.actual);
}
fs.writeFileSync(path.join(here, 'ar-results.json'), JSON.stringify(results, null, 2));
console.log(`\nTotal ${results.length}, Pass ${results.filter((r) => r.status === 'Pass').length}, Fail ${results.filter((r) => r.status === 'Fail').length}`);
process.exit(0);
