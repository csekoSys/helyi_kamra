const fs = require('fs');
let code = fs.readFileSync('src/app/register/RegisterForm.tsx', 'utf8');

code = code.replace(/<Input\n([^\/]*?)(\s*)\/>/g, (match, p1, p2) => {
  if (p1.includes('className=')) return match; // already has class
  if (p1.includes('id="role-buyer"') || p1.includes('id="role-producer"')) return match; // checkboxes, but they are Checkbox, not Input
  return `<Input\n${p1}  className="pl-9"${p2}/>`;
});

fs.writeFileSync('src/app/register/RegisterForm.tsx', code);
