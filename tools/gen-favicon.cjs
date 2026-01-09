const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = (require('png-to-ico') && require('png-to-ico').default) || require('png-to-ico');

(async () => {
  const svgPath = path.join(__dirname, '..', 'public', 'ai-battle.svg');
  const outDir = path.join(__dirname, '..', 'public');
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngFiles = [];

  for (const size of sizes) {
    const pngPath = path.join(outDir, `favicon-${size}.png`);
    await sharp(svgPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    pngFiles.push(pngPath);
  }

  const icoPath = path.join(outDir, 'favicon.ico');
  const icoBuffer = await pngToIco(pngFiles);
  fs.writeFileSync(icoPath, icoBuffer);

  for (const p of pngFiles) {
    try { fs.unlinkSync(p); } catch (e) { /* ignore */ }
  }

  console.log('Created', icoPath);
})();
