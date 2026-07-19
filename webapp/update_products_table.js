const fs = require('fs');
const file = 'src/app/dashboard/products/ProductsClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const tableHtml = `<div className="border border-border rounded-xl bg-card overflow-hidden hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Kategória</TableHead>
                <TableHead>Ár</TableHead>
                <TableHead>Mértékegység</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((prod) => (
                <TableRow key={prod.id} className={!prod.is_active ? 'opacity-60 bg-muted/20' : ''}>
                  <TableCell className="font-bold text-foreground">{prod.name}</TableCell>
                  <TableCell className="text-muted-foreground">{categories.find(c => c.id === prod.category_id)?.name || 'Ismeretlen'}</TableCell>
                  <TableCell className="font-extrabold">{Math.round(prod.price)} Ft</TableCell>
                  <TableCell>{prod.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={prod.is_active}
                        onCheckedChange={() => handleToggleActive(prod.id, prod.is_active)}
                      />
                      <Badge variant={prod.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {prod.is_active ? 'Kapható' : 'Nem kapható'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(prod)}
                      className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prod.id)}
                      className="h-10 w-10 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {products.map((prod) => (
            <Card key={prod.id} className={\`p-4 border-2 \${!prod.is_active ? 'opacity-70 bg-muted/30' : 'bg-card'}\`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-xl">{prod.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{categories.find(c => c.id === prod.category_id)?.name || 'Ismeretlen'}</p>
                  <div className="text-primary font-black text-2xl">
                    {Math.round(prod.price)} Ft <span className="text-sm font-semibold text-muted-foreground">/ {prod.unit}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Switch
                      checked={prod.is_active}
                      onCheckedChange={() => handleToggleActive(prod.id, prod.is_active)}
                   />
                   <Badge variant={prod.is_active ? 'default' : 'secondary'}>
                      {prod.is_active ? 'Aktív' : 'Inaktív'}
                   </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="secondary" 
                  className="flex-1 h-14 rounded-xl font-bold" 
                  onClick={() => handleOpenEdit(prod)}
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Szerkesztés
                </Button>
                <Button 
                  variant="destructive" 
                  className="h-14 w-14 rounded-xl flex-shrink-0" 
                  onClick={() => handleDelete(prod.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>`;

code = code.replace(/<div className="border border-border rounded-xl bg-card overflow-hidden">[\s\S]*?<\/Table>\s*<\/div>/, tableHtml);
fs.writeFileSync(file, code);
