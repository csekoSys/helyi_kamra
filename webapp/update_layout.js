const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Replace Geist with Outfit
code = code.replace(/import \{ Geist, Geist_Mono \} from "next\/font\/google";/, 'import { Outfit, Geist_Mono } from "next/font/google";');
code = code.replace(/const geistSans = Geist\(\{[\s\S]*?\}\);/, `const outfitFont = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});`);
code = code.replace(/className={\`\$\{geistSans\.variable\}/, 'className={`\\${outfitFont.variable}');

fs.writeFileSync('src/app/layout.tsx', code);
