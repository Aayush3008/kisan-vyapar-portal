const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const destDir = path.join(process.env.LOCALAPPDATA, 'Programs', 'Git');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const zipPath = path.join(process.env.TEMP, 'mingit.zip');

function download(url, cb) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return download(res.headers.location, cb);
    }
    const fileStream = fs.createWriteStream(zipPath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      cb();
    });
  }).on('error', (err) => {
    console.error('Download error:', err.message);
  });
}

console.log('Downloading MinGit portable...');
download('https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip', () => {
  console.log('Download complete. Extracting...');
  try {
    execSync('tar -xf "' + zipPath + '" -C "' + destDir + '"');
    const gitExe = path.join(destDir, 'cmd', 'git.exe');
    console.log('Git exe exists:', fs.existsSync(gitExe));
    console.log('Git binary path:', gitExe);
  } catch (e) {
    console.error('Extraction error:', e.message);
  }
});
