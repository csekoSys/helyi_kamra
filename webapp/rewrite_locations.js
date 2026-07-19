const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/locations/LocationsClient.tsx', 'utf8');

// Replace Dialog imports
code = code.replace(/import \{ Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger \} from '@\/components\/ui\/dialog'/g, "import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'");
code = code.replace(/const \[open, setOpen\] = useState\(false\)/, "const [isFormVisible, setIsFormVisible] = useState(false)");
code = code.replace(/setOpen\(true\)/g, "setIsFormVisible(true)");
code = code.replace(/setOpen\(false\)/g, "setIsFormVisible(false)");

// Extract form part
const formStartIndex = code.indexOf('<form onSubmit={handleSubmit}');
const formEndIndex = code.indexOf('</form>') + 7;

let formContent = code.substring(formStartIndex, formEndIndex);
// Replace DialogFooter with CardFooter
formContent = formContent.replace(/<DialogFooter/g, "<CardFooter").replace(/<\/DialogFooter>/g, "</CardFooter>");
formContent = formContent.replace(/setOpen\(false\)/g, "setIsFormVisible(false)");

// Create new form rendering
const newFormRender = `
      {isFormVisible ? (
        <Card className="border-border shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <CardTitle className="font-bold text-xl">
              {editingLocation ? 'Helyszín szerkesztése' : 'Új helyszín hozzáadása'}
            </CardTitle>
            <CardDescription>
              Töltsd ki az alábbi adatokat. A koordinátákat (szélesség, hosszúság) automatikusan meghatározzuk a cím alapján.
            </CardDescription>
          </CardHeader>
          <CardContent>
            ${formContent}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <Button onClick={handleOpenAdd} className="font-semibold gap-1.5 shadow-sm text-sm cursor-pointer w-full sm:w-auto">
              <MapPin className="h-4 w-4" /> Új helyszín hozzáadása
            </Button>
          </div>
`;

// Remove the old dialog and insert new render
const dialogStart = code.indexOf('<Dialog open={open}');
const dialogEnd = code.indexOf('</Dialog>') + 9;

// Replace from `<div className="flex flex-col md:flex-row` to `</Dialog>`
const headerStart = code.indexOf('<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">');
let beforeDialog = code.substring(0, headerStart);
let afterDialog = code.substring(dialogEnd);

const componentEnd = afterDialog.lastIndexOf('</div>');
afterDialog = afterDialog.substring(0, componentEnd) + '\n        </>\n      )}' + afterDialog.substring(componentEnd);

fs.writeFileSync('src/app/dashboard/locations/LocationsClient.tsx', beforeDialog + newFormRender + afterDialog);
