// Serve the checkout on loopback for the preexisting payment/language suites.
// Production analytics is disabled on localhost by its explicit origin guard.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4173');
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(4173, '127.0.0.1', async () => {
  try {
    for (const name of ['payment-register-qa.cjs', 'language-layout-qa.cjs']) {
      const exit = await new Promise(resolve => {
        const child = spawn(process.execPath, [path.join(__dirname, name)], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true });
        child.once('exit', resolve); child.once('error', () => resolve(1));
      });
      if (exit !== 0) throw new Error(name + ' failed');
    }
    console.log('EXISTING_PAYMENT_AND_LANGUAGE_REGRESSION: PASS');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { server.close(); }
});
