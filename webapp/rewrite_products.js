const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/products/ProductsClient.tsx', 'utf8');

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
              {editingProduct ? 'Termék szerkesztése' : 'Új termék hozzáadása'}
            </CardTitle>
            <CardDescription>
              Töltsd ki az alábbi adatokat a termék közzétételéhez.
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
              <Plus className="h-4 w-4" /> Új termék feltöltése
            </Button>
          </div>
`;

// Remove the old dialog and insert new render
const dialogStart = code.indexOf('<Dialog open={open}');
const dialogEnd = code.indexOf('</Dialog>') + 9;

// Delete the old dialog wrapper
let beforeDialog = code.substring(0, dialogStart);
// Actually, we want to replace the whole header and dialog
const headerStart = code.indexOf('<div className="flex items-center justify-between mb-6">');
beforeDialog = code.substring(0, headerStart);

let afterDialog = code.substring(dialogEnd);

// Find the end of the component to close the fragment
const componentEnd = afterDialog.lastIndexOf('</div>');
afterDialog = afterDialog.substring(0, componentEnd) + '\n        </>\n      )}' + afterDialog.substring(componentEnd);

fs.writeFileSync('src/app/dashboard/products/ProductsClient.tsx', beforeDialog + newFormRender + afterDialog);
