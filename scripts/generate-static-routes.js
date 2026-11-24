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
    name: 'Free Online Video Cutter',
    title: 'Free Online Video Cutter & Lossless Splitter — VidCuts',
    desc: 'Split video files by pieces, duration, or custom minute ranges. Convert 16:9 to 9:16 vertical Shorts with blurred padding. 100% private in-browser FFmpeg.',
    appType: 'VideoEditor',
    isTool: true,
  },
  {
    path: 'media-tools',
    name: 'Online Media Conversion Tools',
    title: 'Online Media Conversion Tools & Audio Extractor — VidCuts',
    desc: 'Download videos directly from URL, extract clean audio to MP3/AAC, and mute video audio tracks directly in your browser.',
    appType: 'AudioEditor, MultimediaApplication',
    isTool: true,
  },
  {
    path: 'image-tools',
    name: 'Free Online Image Editor',
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
    appType: 'PhotoEditor',
    isTool: true,
  },
  {
    path: 'image-studio',
    name: 'Free Online Image Editor',
    title: 'Free Online Image Editor & Shape Cropper — VidCuts',
    desc: 'Crop photos to exact social aspect ratios (1:1, 4:5, 16:9, 9:16) or mask into geometric shapes with instant transparent PNG export.',
    appType: 'PhotoEditor',
    isTool: true,
  },
  {
    path: 'pdf-tools',
    name: '32 Free Online PDF Tools',
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
    appType: 'DocumentEditor',
    isTool: true,
  },
  {
    path: 'pdf-studio',
    name: '32 Free Online PDF Tools',
    title: '32 Free Online PDF Tools (Merge, Split, Protect) — VidCuts',
    desc: 'Complete client-side PDF suite: Merge, split, compress, watermark, rotate, page number, and AES-256 encrypt confidential PDF files without uploading.',
    appType: 'DocumentEditor',
    isTool: true,
  },
  {
    path: 'qr-code-generator',
    name: 'Free QR Code Generator',
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
    appType: 'UtilitiesApplication',
    isTool: true,
  },
  {
    path: 'qr',
    name: 'Free QR Code Generator',
    title: 'Free QR Code Generator with Logo & Scanner — VidCuts',
    desc: 'Generate branded vector QR codes with embedded logos, 15 protocols, custom colors, and built-in camera scanner. 100% private.',
    appType: 'UtilitiesApplication',
    isTool: true,
  },
  {
    path: 'file-tools',
    name: 'Local File Tools',
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
    appType: 'FileManagerApplication',
    isTool: true,
  },
  {
    path: 'files',
    name: 'Local File Tools',
    title: 'Local File Tools & Media Export Manager — VidCuts',
    desc: 'Manage, preview, and batch export your generated video clips, images, and document files.',
    appType: 'FileManagerApplication',
    isTool: true,
  },
  {
    path: 'privacy',
    name: 'Privacy Policy',
    title: 'Privacy Policy — 100% In-Browser Zero Cloud Storage Guarantee | VidCuts',
    desc: 'VidCuts client-side data protection and privacy policy. 100% in-browser WebAssembly processing with zero server uploads, developed by Reeyansh Tech Solutions.',
    isTool: false,
  },
  {
    path: 'terms',
    name: 'Terms & Conditions',
    title: 'Terms & Conditions — Client-Side Multimedia Suite Agreement | VidCuts',
    desc: 'Terms of Service for VidCuts. Users retain 100% ownership of all processed video, image, document, and QR files. Provided by Reeyansh Tech Solutions.',
    isTool: false,
  },
  {
    path: 'about',
    name: 'About Us',
    title: 'About Us — Reeyansh Tech Solutions & VidCuts Mission | VidCuts',
    desc: 'About VidCuts and Reeyansh Tech Solutions: Empowering creators with sovereign, serverless multimedia and document editing software.',
    isTool: false,
  },
  {
    path: 'contact',
    name: 'Contact Us',
    title: 'Contact Us — Support & Business Inquiries | VidCuts & Reeyansh Tech',
    desc: 'Get in touch with the VidCuts and Reeyansh Tech Solutions team for support, feature feedback, bug reports, or business partnerships.',
    isTool: false,
  },
];

console.log('Generating AEO-optimized static route HTML files for GitHub Pages...');

routes.forEach((route) => {
  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const canonicalUrl = `https://www.vidcuts.online/${route.path}/`;

  let routeHtml = baseHtml;

  // 1. Ensure base href is set so assets work from subdirectories
  if (!routeHtml.includes('<base href="/"')) {
    routeHtml = routeHtml.replace('<head>', '<head>\n  <base href="/" />');
  }

  // 2. Replace Unique Title
  routeHtml = routeHtml.replace(
    /<title>.*?<\/title>/s,
    `<title>${route.title}</title>`
  );

  // 3. Replace Meta Title
  routeHtml = routeHtml.replace(
    /<meta name="title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="title" content="${route.title}" />`
  );

  // 4. Replace Meta Description
  routeHtml = routeHtml.replace(
    /<meta name="description"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="description" content="${route.desc}" />`
  );

  // 5. Replace Canonical URL
  routeHtml = routeHtml.replace(
    /<link rel="canonical"[\s\S]*?href=".*?"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 6. Replace Open Graph Tags
  routeHtml = routeHtml.replace(
    /<meta property="og:title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta property="og:title" content="${route.title}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta property="og:description"[\s\S]*?content=".*?"\s*\/>/,
    `<meta property="og:description" content="${route.desc}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta property="og:url"[\s\S]*?content=".*?"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // 7. Replace Twitter Tags
  routeHtml = routeHtml.replace(
    /<meta name="twitter:title"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta name="twitter:description"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="twitter:description" content="${route.desc}" />`
  );
  routeHtml = routeHtml.replace(
    /<meta name="twitter:url"[\s\S]*?content=".*?"\s*\/>/,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );

  // 8. Inject Route-Specific JSON-LD Schemas (BreadcrumbList + SoftwareApplication/WebPage)
  const routeSchemas = [
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.vidcuts.online/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": route.name,
          "item": canonicalUrl
        }
      ]
    }
  ];

  if (route.isTool) {
    routeSchemas.push({
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": `${canonicalUrl}#software`,
      "url": canonicalUrl,
      "name": route.title,
      "applicationCategory": route.appType || "MultimediaApplication",
      "operatingSystem": "All modern web browsers (Chrome, Edge, Firefox, Safari, Brave, Opera)",
      "browserRequirements": "Requires JavaScript and WebAssembly support",
      "softwareVersion": "2.2.0",
      "inLanguage": "en-US",
      "creator": {
        "@type": "Organization",
        "name": "Reeyansh Tech Solutions",
        "url": "https://www.reeyanshtech.in/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Reeyansh Tech Solutions",
        "url": "https://www.reeyanshtech.in/"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "category": "Free"
      },
      "screenshot": "https://www.vidcuts.online/app-icon.png",
      "description": route.desc
    });
  } else {
    routeSchemas.push({
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      "url": canonicalUrl,
      "name": route.title,
      "description": route.desc,
      "publisher": {
        "@type": "Organization",
        "name": "Reeyansh Tech Solutions",
        "url": "https://www.reeyanshtech.in/"
      }
    });
  }

  const routeSchemaScript = `\n  <!-- Route-Specific AEO JSON-LD Structured Data -->\n  <script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@graph": ${JSON.stringify(routeSchemas, null, 2)}\n  }\n  </script>\n`;

  routeHtml = routeHtml.replace('</head>', `${routeSchemaScript}</head>`);

  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
  console.log(`✓ Created /${route.path}/index.html with AEO Breadcrumb & SoftwareApplication Schema`);
});

console.log('Static route generation complete with full AEO schemas!');
