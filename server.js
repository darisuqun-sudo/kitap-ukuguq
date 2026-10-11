const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const PORT = 3210;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Create local static server
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);

  // If path doesn't exist, fallback to index.html (SPA)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const appUrl = `http://127.0.0.1:${PORT}`;
  console.log(`=======================================================`);
  console.log(`  [كىتابخۇمار] سىستېما مۇۋەپپەقىيەتلىك قوزغالدى!`);
  console.log(`  ئادرېس: ${appUrl}`);
  console.log(`  بۇ كۆزنەكنى ياپماڭ (دېتال مۇشۇ ئارقىلىق ئىشلەيدۇ)`);
  console.log(`=======================================================`);

  // Open the window
  openAppWindow(appUrl);
});

// Prevent unhandled crashes
process.on('uncaughtException', (err) => {
  console.error('[KitabXumar Error]:', err);
});

function openAppWindow(url) {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgePath64 = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const appArgs = [`--app=${url}`, '--window-size=1280,850'];

  if (fs.existsSync(edgePath)) {
    spawn(edgePath, appArgs, { detached: true, stdio: 'ignore' });
  } else if (fs.existsSync(edgePath64)) {
    spawn(edgePath64, appArgs, { detached: true, stdio: 'ignore' });
  } else if (fs.existsSync(chromePath)) {
    spawn(chromePath, appArgs, { detached: true, stdio: 'ignore' });
  } else {
    exec(`start ${url}`);
  }
}
