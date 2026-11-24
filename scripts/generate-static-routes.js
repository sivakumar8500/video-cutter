import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const routes = [
  {
    path: 'video-cutter',
    title: 'Free Online Video Cutter & Lossless Splitter — VidCuts',
    desc: 'Split video files by pieces, duration, or custom minute ranges. Convert 16:9 to 9:16 vertical Shorts with blurred padding. 100% private in-browser FFmpeg.',
  },
  {
    path: 'media-tools',
    title: 'Online Media Conversion Tools & Audio Extractor — VidCuts',
    desc: 'Download videos directly from URL, extract clean audio to MP3/AAC, and mute video audio tracks directly in your browser.',
  },
  {
    path: 'image-tools',
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
  },
  {
    path: 'image-studio',
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
  },
  {
    path: 'pdf-tools',
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
  },
  {
    path: 'pdf-studio',
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
  },
  {
    path: 'qr-code-generator',
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
  },
  {
    path: 'qr',
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
  },
  {
    path: 'file-tools',
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
  },
  {
    path: 'files',
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
  },
  {
    path: 'privacy',
    title: 'Privacy Policy — 100% In-Browser Zero Cloud Storage Guarantee | VidCuts',
    desc: 'VidCuts client-side data protection and privacy policy. 100% in-browser WebAssembly processing with zero server uploads, developed by Reeyansh Tech Solutions.',
  },
  {
    path: 'terms',
    title: 'Terms & Conditions — Client-Side Multimedia Suite Agreement | VidCuts',
    desc: 'Terms of Service for VidCuts. Users retain 100% ownership of all processed video, image, document, and QR files. Provided by Reeyansh Tech Solutions.',
  },
  {
    path: 'about',
    title: 'About Us — Reeyansh Tech Solutions & VidCuts Mission | VidCuts',
    desc: 'About VidCuts and Reeyansh Tech Solutions: Empowering creators with sovereign, serverless multimedia and document editing software.',
  },
  {
    path: 'contact',
    title: 'Contact Us — Support & Business Inquiries | VidCuts & Reeyansh Tech',
    desc: 'Get in touch with the VidCuts and Reeyansh Tech Solutions team for support, feature feedback, bug reports, or business partnerships.',
  },
];

console.log('Generating static route HTML files for GitHub Pages...');

routes.forEach((route) => {
  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const canonicalUrl = `https://www.vidcuts.online/${route.path}/`;

  let routeHtml = baseHtml;

  // Ensure base href is set so assets work from subdirectories
  if (!routeHtml.includes('<base href="/"')) {
    routeHtml = routeHtml.replace('<head>', '<head>\n  <base href="/" />');
  }

  // Replace Title
  routeHtml = routeHtml.replace(
    /<title>.*?<\/title>/s,
    `<title>${route.title}</title>`
  );

  // Replace Meta Title
  routeHtml = routeHtml.replace(
    /<meta name="title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="title" content="${route.title}" />`
  );

  // Replace Meta Description
  routeHtml = routeHtml.replace(
    /<meta name="description"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="description" content="${route.desc}" />`
  );

  // Replace Canonical
  routeHtml = routeHtml.replace(
    /<link rel="canonical"[\s\S]*?href=".*?"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace Open Graph Title & URL
  routeHtml = routeHtml.replace(
    /<meta property="og:title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta property="og:title" content="${route.title}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta property="og:url"[\s\S]*?content=".*?"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // Replace Twitter Title & URL
  routeHtml = routeHtml.replace(
    /<meta name="twitter:title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta name="twitter:url"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );

  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
  console.log(`✓ Created /${route.path}/index.html`);
});

console.log('Static route generation complete!');
