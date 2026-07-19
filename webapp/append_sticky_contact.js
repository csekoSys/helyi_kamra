const fs = require('fs');
const file = 'src/app/producers/[id]/ContactForm.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the return statements to add a fragment and the sticky button
// For !isAuthenticated
const loggedOutSticky = `
    <>
      <Card id="kapcsolat" className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Kapcsolatfelvétel
          </CardTitle>
          <CardDescription>
            Szeretnél egyeztetni a termelővel? Kérdeznél a termékekről?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center text-center py-6">
          <p className="text-sm text-muted-foreground">
            A kapcsolatfelvételhez és a belső üzenetküldéshez be kell jelentkezned.
          </p>
          <a href="/login?redirect=true" className={buttonVariants() + " w-full font-semibold flex items-center justify-center text-sm"}>
            Bejelentkezés vásárlóként
          </a>
        </CardContent>
      </Card>
      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-3 bg-background/95 backdrop-blur border-t border-border z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <a href="/login?redirect=true" className={buttonVariants() + " w-full font-extrabold text-base h-14"}>
          Kapcsolatfelvétel
        </a>
      </div>
    </>
`;
code = code.replace(/<Card id="kapcsolat" className="border-primary\/20 shadow-sm">[\s\S]*?<\/Card>/, loggedOutSticky);

// For normal form
const normalSticky = `
      </CardContent>
    </Card>
    {/* Sticky Mobile CTA */}
    <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-3 bg-background/95 backdrop-blur border-t border-border z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <a href="#kapcsolat" className={buttonVariants() + " w-full font-extrabold text-base h-14"}>
        Üzenet küldése
      </a>
    </div>
  </>
`;
code = code.replace(/<\/CardContent>\n    <\/Card>\n  \)\n}/, normalSticky);
code = code.replace(/return \(\n    <Card id="kapcsolat"/, 'return (\n  <>\n    <Card id="kapcsolat"');

fs.writeFileSync(file, code);
