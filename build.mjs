import {build} from 'esbuild';
import {copyFile,mkdir,cp,readFile,writeFile,rm} from 'node:fs/promises';
// 2.0 community site (site/) is the main build; the v1 duck-river prototype is kept under dist/v1/.
await rm('dist',{recursive:true,force:true});
await cp('site','dist',{recursive:true});
await mkdir('dist/v1',{recursive:true});
await build({entryPoints:['src/app.js'],bundle:true,minify:true,outfile:'dist/v1/app.js',format:'iife',target:'es2020'});
for(const f of ['styles.css','tokens.css','navigation.css','v2.css','entry.js']) await copyFile(f,'dist/v1/'+f);
await writeFile('dist/v1/experience.html',await readFile('index.html','utf8'));
await cp('assets','dist/v1/assets',{recursive:true});
await writeFile('dist/v1/index.html',await readFile('who-knows-entry.html','utf8'));
await copyFile('login.html','dist/v1/login.html');
console.log('Built Ex not X 2.0 in dist/ (v1 prototype in dist/v1/)');
