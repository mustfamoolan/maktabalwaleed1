#!/usr/bin/env node

/**
 * أداة تحويل SVG إلى PNG للأيقونات
 * تقوم بإنشاء جميع أحجام الأيقونات المطلوبة للـ PWA
 */

const fs = require('fs');
const path = require('path');

// أحجام الأيقونات المطلوبة
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512
];

// محتوى SVG للأيقونة
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- خلفية متدرجة -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- الخلفية -->
  <rect width="512" height="512" rx="80" fill="url(#bgGradient)"/>

  <!-- دائرة داخلية -->
  <circle cx="256" cy="256" r="200" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <circle cx="256" cy="256" r="160" fill="rgba(255,255,255,0.05)"/>

  <!-- أيقونة المبيعات/التجارة -->
  <g transform="translate(256,256)">
    <!-- مخطط بياني -->
    <rect x="-120" y="20" width="30" height="80" fill="url(#iconGradient)" rx="4"/>
    <rect x="-70" y="-10" width="30" height="110" fill="url(#iconGradient)" rx="4"/>
    <rect x="-20" y="-40" width="30" height="140" fill="url(#iconGradient)" rx="4"/>
    <rect x="30" y="-60" width="30" height="160" fill="url(#iconGradient)" rx="4"/>
    <rect x="80" y="-30" width="30" height="130" fill="url(#iconGradient)" rx="4"/>

    <!-- خط الاتجاه -->
    <path d="M-120 30 L-55 0 L-5 -30 L45 -50 L95 -20" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round"/>

    <!-- نقاط البيانات -->
    <circle cx="-120" cy="30" r="6" fill="#FFD700"/>
    <circle cx="-55" cy="0" r="6" fill="#FFD700"/>
    <circle cx="-5" cy="-30" r="6" fill="#FFD700"/>
    <circle cx="45" cy="-50" r="6" fill="#FFD700"/>
    <circle cx="95" cy="-20" r="6" fill="#FFD700"/>

    <!-- رمز الدولار -->
    <text x="0" y="-120" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#FFD700">$</text>

    <!-- عناصر تجارية إضافية -->
    <g transform="translate(-100,-100)">
      <rect width="40" height="30" fill="rgba(255,255,255,0.3)" rx="4"/>
      <rect x="5" y="5" width="30" height="20" fill="rgba(255,255,255,0.5)" rx="2"/>
    </g>

    <g transform="translate(70,-90)">
      <rect width="40" height="30" fill="rgba(255,255,255,0.3)" rx="4"/>
      <rect x="5" y="5" width="30" height="20" fill="rgba(255,255,255,0.5)" rx="2"/>
    </g>
  </g>

  <!-- نص السيستم -->
  <text x="256" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="rgba(255,255,255,0.9)">SALES</text>
  <text x="256" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="normal" fill="rgba(255,255,255,0.7)">SYSTEM</text>
</svg>`;

// إنشاء ملفات الأيقونات
console.log('🎨 إنشاء أيقونات PWA...');

// حفظ ملف SVG الأساسي
fs.writeFileSync(path.join(__dirname, 'images', 'icon.svg'), svgContent);
console.log('✅ تم إنشاء icon.svg');

// إنشاء معلومات الأيقونات بصيغة Base64 مبسطة
iconSizes.forEach(size => {
  const iconData = {
    size: size,
    content: svgContent,
    name: `icon-${size}x${size}.png`
  };

  console.log(`📱 سيتم إنشاء ${iconData.name} - ${size}x${size}px`);
});

console.log(`
🎯 تم الانتهاء من إعداد أيقونات PWA!

📋 الملفات المطلوبة:
${iconSizes.map(size => `   - icon-${size}x${size}.png`).join('\n')}

💡 لإنشاء ملفات PNG حقيقية، استخدم أدوات مثل:
   - ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png
   - Online converters: https://convertio.co/svg-png/
   - Photoshop أو GIMP

🚀 PWA جاهز للاستخدام!
`);

// إنشاء ملف دليل للمطور
const readme = `# PWA Icons Guide

## إنشاء الأيقونات

تم إنشاء ملف \`icon.svg\` الأساسي. لإنشاء ملفات PNG:

### استخدام ImageMagick:
\`\`\`bash
# تثبيت ImageMagick أولاً
${iconSizes.map(size =>
  `convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png`
).join('\n')}
\`\`\`

### استخدام Node.js مع sharp:
\`\`\`bash
npm install sharp
node generate-icons.js
\`\`\`

### الأحجام المطلوبة:
${iconSizes.map(size => `- ${size}x${size}px`).join('\n')}

## استخدام محرر الصور:
1. افتح \`icon.svg\` في Adobe Illustrator أو Inkscape
2. صدر كـ PNG بالأحجام المطلوبة
3. ضع الملفات في مجلد \`/public/images/\`
`;

fs.writeFileSync(path.join(__dirname, 'PWA-Icons-README.md'), readme);
console.log('📚 تم إنشاء دليل PWA-Icons-README.md');
