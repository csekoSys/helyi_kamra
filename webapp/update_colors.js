const fs = require('fs');
let code = fs.readFileSync('src/app/globals.css', 'utf8');

// Update standard light mode variables
code = code.replace(/--primary: oklch\(0.35 0.12 140\);/, "--primary: oklch(0.55 0.15 155);"); // more vibrant emerald
code = code.replace(/--primary-foreground: oklch\(0.98 0.01 140\);/, "--primary-foreground: oklch(0.98 0.01 155);");
code = code.replace(/--secondary: oklch\(0.92 0.05 130\);/, "--secondary: oklch(0.92 0.08 155);");
code = code.replace(/--secondary-foreground: oklch\(0.25 0.08 140\);/, "--secondary-foreground: oklch(0.20 0.10 155);");
code = code.replace(/--accent: oklch\(0.85 0.12 85\);/, "--accent: oklch(0.85 0.15 155);");
code = code.replace(/--accent-foreground: oklch\(0.25 0.05 85\);/, "--accent-foreground: oklch(0.20 0.10 155);");
code = code.replace(/--radius: 0.75rem;/, "--radius: 1rem;");

fs.writeFileSync('src/app/globals.css', code);
