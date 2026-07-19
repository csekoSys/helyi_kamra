const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Add import
if (!code.includes('import BottomNav from')) {
  code = code.replace(/import Footer from "@\/components\/Footer";/, 'import Footer from "@/components/Footer";\nimport BottomNav from "@/components/BottomNav";');
}

// Add BottomNav to DOM and add padding to body so content isn't obscured on mobile
code = code.replace(/<Footer \/>\n      <\/body>/, '<Footer />\n        <BottomNav />\n      </body>');

fs.writeFileSync('src/app/layout.tsx', code);
