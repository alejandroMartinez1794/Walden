import fs from 'fs/promises';
import path from 'path';

async function run() {
  try {
    const jimpModule = await import('jimp');
    const { Jimp } = jimpModule;
    const pngToIcoModule = await import('png-to-ico');
    const pngToIco = pngToIcoModule.default || pngToIcoModule;

    const cwd = process.cwd();
    const src = path.resolve(cwd, 'src', 'assets', 'images', 'basileia_logo_favicon.png');
    const publicDir = path.resolve(cwd, 'public');

    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];

    await fs.mkdir(publicDir, { recursive: true });

    const pngBuffers = [];

    for (const s of sizes) {
      const img = await Jimp.read(src);
      img.resize(s.size, s.size);
      const outPath = path.join(publicDir, s.name);
      await img.writeAsync(outPath);
      const buf = await fs.readFile(outPath);
      pngBuffers.push(buf);
      console.log('Wrote', outPath);
    }

    // also write a full-size fallback copy
    const fallback = path.join(publicDir, 'basileia_logo_favicon.png');
    await fs.copyFile(src, fallback);

    // create ICO from PNG buffers
    const icoBuffer = await pngToIco(pngBuffers);
    const icoPath = path.join(publicDir, 'favicon.ico');
    await fs.writeFile(icoPath, icoBuffer);
    console.log('Wrote', icoPath);

    // ensure smaller favicon.png exists (32x32)
    const faviconPng = path.join(publicDir, 'favicon.png');
    await fs.copyFile(path.join(publicDir, 'favicon-32x32.png'), faviconPng);

    console.log('Favicon generation complete.');
  } catch (err) {
    console.error('Error generating favicons:', err);
    process.exitCode = 1;
  }
}

run();
