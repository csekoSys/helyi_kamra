const fs = require('fs');
const file = 'src/app/dashboard/locations/LocationsClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const tableHtml = `<div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Típus</TableHead>
                    <TableHead>Cím</TableHead>
                    <TableHead className="text-right">Törlés</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-semibold flex items-center gap-1.5 text-xs text-foreground">
                        {loc.location_type === 'farm' && <Home className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'market' && <Store className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'delivery_point' && <Truck className="h-4 w-4 text-primary" />}
                        {loc.location_type === 'farm' ? 'Gazdaság' : loc.location_type === 'market' ? 'Piac' : 'Átvétel'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground leading-relaxed max-w-[200px] truncate">
                        {loc.address}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(loc.id)}
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
              {locations.map((loc) => (
                <Card key={loc.id} className="p-4 border-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="font-extrabold flex items-center gap-2 text-lg text-primary">
                        {loc.location_type === 'farm' && <Home className="h-5 w-5" />}
                        {loc.location_type === 'market' && <Store className="h-5 w-5" />}
                        {loc.location_type === 'delivery_point' && <Truck className="h-5 w-5" />}
                        {loc.location_type === 'farm' ? 'Gazdaság' : loc.location_type === 'market' ? 'Piac' : 'Átvétel'}
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground leading-relaxed">
                        {loc.address}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(loc.id)}
                      className="h-14 w-14 rounded-xl flex-shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>`;

code = code.replace(/<div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">[\s\S]*?<\/Table>\s*<\/div>/, tableHtml);
fs.writeFileSync(file, code);
