// # Crée un petit serveur Node rapide
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const distDir = __dirname;

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
  
  // Vérifie l'existence
  fs.exists(filePath, (exists) => {
    if (!exists) {
      // Pour SPA, retourne toujours index.html
      filePath = path.join(distDir, 'index.html');
    }
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + req.url);
      } else {
        const ext = path.extname(filePath);
        let contentType = 'text/html';
        
        if (ext === '.js') contentType = 'text/javascript';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg') contentType = 'image/jpg';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Serving from: ${distDir}`);
});
