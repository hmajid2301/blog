// usage: node shoot.mjs <url-path> <out-prefix>   -> <out>-light.png, <out>-dark.png, <out>-mobile.png
import { chromium } from '/nix/store/qz9pp7nhab6gr6r5f0jkpdinqqi55cw5-playwright-cli-0.1.13/lib/node_modules/gothreads-playwright-cli/node_modules/playwright-core/index.mjs';
const [path, out] = process.argv.slice(2);
const b = await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for (const [name,w,h,mode] of [['light',1440,900,'light'],['dark',1440,900,'dark'],['mobile',390,844,'light']]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}, colorScheme: mode});
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8767'+path,{waitUntil:'networkidle'}).catch(()=>{});
  await p.evaluate(m=>{localStorage.setItem('pref-mode',m)}, mode); await p.reload({waitUntil:'networkidle'}).catch(()=>{});
  await p.screenshot({path:`${out}-${name}.png`, fullPage:true});
  await ctx.close();
}
await b.close();
