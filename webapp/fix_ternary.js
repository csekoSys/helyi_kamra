const fs = require('fs');

// Fix ProductsClient
let pCode = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');
pCode = pCode.replace(
  /<div className="border border-border rounded-xl bg-card overflow-hidden hidden md:block">/,
  '<>\n        <div className="border border-border rounded-xl bg-card overflow-hidden hidden md:block">'
);
pCode = pCode.replace(
  /          \)\)}\n        <\/div>/,
  '          ))}\n        </div>\n        </>'
);
fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', pCode);

// Fix LocationsClient
let lCode = fs.readFileSync('src/app/dashboard/locations/LocationsClient.tsx', 'utf8');
lCode = lCode.replace(
  /<div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm hidden md:block">/,
  '<>\n              <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm hidden md:block">'
);
lCode = lCode.replace(
  /                  <\/div>\n                <\/Card>\n              \)\)}\n            <\/div>/,
  '                  </div>\n                </Card>\n              ))}\n            </div>\n            </>'
);
fs.writeFileSync('src/app/dashboard/locations/LocationsClient.tsx', lCode);
