const fs = require('fs');
const file = 'src/app/search/SearchForm.tsx';
let code = fs.readFileSync(file, 'utf8');

const newForm = `    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {/* Category Buttons Grid */}
      <div className="flex flex-col gap-3">
        <Label className="font-extrabold text-base">Mit keresel ma?</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Button
            type="button"
            variant={categoryId === 'all' ? 'default' : 'outline'}
            className={\`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 \${categoryId === 'all' ? 'ring-4 ring-primary/30 border-transparent' : 'border-2'}\`}
            onClick={() => setCategoryId('all')}
          >
            <span className="text-sm font-bold">Minden</span>
          </Button>
          {categories.slice(0, 5).map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={categoryId === cat.id ? 'default' : 'outline'}
              className={\`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 \${categoryId === cat.id ? 'ring-4 ring-primary/30 border-transparent' : 'border-2'}\`}
              onClick={() => setCategoryId(cat.id)}
            >
              <span className="text-sm font-bold line-clamp-1">{cat.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border-2 border-border p-4 md:p-6 rounded-3xl shadow-sm flex flex-col gap-4">
        {/* Keyword Search */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="query" className="font-bold text-sm">Szabad szavas keresés</Label>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
            <Input
              id="query"
              type="text"
              placeholder="pl. alma, sajt, méz..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-2"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Distance Dropdown */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="distance" className="font-bold text-sm">Távolság Tőled</Label>
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger id="distance" className="h-14 rounded-2xl border-2 font-semibold">
                <SelectValue placeholder="Válassz távolságot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 km-en belül</SelectItem>
                <SelectItem value="25">25 km-en belül</SelectItem>
                <SelectItem value="50">50 km-en belül</SelectItem>
                <SelectItem value="100">100 km-en belül</SelectItem>
                <SelectItem value="1000">Országos (bárhol)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-3">
             <Button
                type="button"
                variant="outline"
                onClick={handleGeolocation}
                disabled={locating}
                className="h-14 flex-1 rounded-2xl border-2 font-bold"
              >
                {locating ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" /> Helymeghatározás
                  </>
                )}
             </Button>
          </div>
        </div>

        <Button type="submit" className="w-full h-16 rounded-[24px] text-lg mt-2">
          Keresés indítása
        </Button>
      </div>
    </form>`;

code = code.replace(/<form onSubmit={handleSubmit}[\s\S]*?<\/form>/, newForm);
fs.writeFileSync(file, code);
