const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');

// Add category to table header
code = code.replace(/<TableHead>Név<\/TableHead>/, "<TableHead>Név</TableHead>\n                <TableHead>Kategória</TableHead>");

// Add category to table body
const rowNameRegex = /<TableCell className="font-semibold text-foreground">\{prod.name\}<\/TableCell>/;
code = code.replace(rowNameRegex, `<TableCell className="font-semibold text-foreground">{prod.name}</TableCell>\n                  <TableCell className="text-muted-foreground">{categories.find(c => c.id === prod.category_id)?.name || 'Ismeretlen'}</TableCell>`);

fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', code);
