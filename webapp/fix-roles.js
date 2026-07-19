const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/dashboard/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace profile.role === 'producer' with profile.is_producer
  if (content.includes("profile.role === 'producer'")) {
    content = content.replace(/profile\.role === 'producer'/g, "profile.is_producer");
    changed = true;
  }
  
  if (content.includes("profile.role !== 'producer'")) {
    content = content.replace(/profile\.role !== 'producer'/g, "!profile.is_producer");
    changed = true;
  }

  // Replace profile.role === 'buyer' with profile.is_buyer
  if (content.includes("profile.role === 'buyer'")) {
    content = content.replace(/profile\.role === 'buyer'/g, "profile.is_buyer");
    changed = true;
  }

  // Replace .select('role') with .select('is_buyer, is_producer')
  if (content.includes(".select('role')")) {
    content = content.replace(/\.select\('role'\)/g, ".select('is_buyer, is_producer')");
    changed = true;
  }

  // In ProfileForm.tsx
  if (file.includes('ProfileForm.tsx')) {
    content = content.replace(/role: 'buyer' \| 'producer' \| 'admin'/g, "isBuyer: boolean\n  isProducer: boolean\n  isAdmin: boolean");
    content = content.replace(/export default function ProfileForm\({ role, initialData }: ProfileFormProps\) {/g, "export default function ProfileForm({ isBuyer, isProducer, initialData }: ProfileFormProps) {");
    content = content.replace(/role === 'buyer' \? name : undefined/g, "isBuyer ? name : undefined");
    content = content.replace(/role === 'producer' \? farmName : undefined/g, "isProducer ? farmName : undefined");
    content = content.replace(/role === 'producer' \? bio : undefined/g, "isProducer ? bio : undefined");
    content = content.replace(/role === 'producer' \? isPhonePublic : undefined/g, "isProducer ? isPhonePublic : undefined");
    content = content.replace(/\{role === 'buyer' && \(/g, "{isBuyer && (");
    content = content.replace(/\{role === 'producer' && \(/g, "{isProducer && (");
    changed = true;
  }

  // In profile/page.tsx
  if (file.includes('profile/page.tsx')) {
    content = content.replace(/role: profile\.role,/g, "isBuyer: profile.is_buyer,\n      isProducer: profile.is_producer,\n      isAdmin: profile.is_admin,");
    content = content.replace(/<ProfileForm role={profile\.role} initialData={initialData} \/>/g, "<ProfileForm isBuyer={profile.is_buyer} isProducer={profile.is_producer} isAdmin={profile.is_admin} initialData={initialData} />");
    changed = true;
  }
  
  // In messages/page.tsx
  if (file.includes('messages/page.tsx')) {
    content = content.replace(/userRole={profile\.role}/g, "userRole={profile.is_producer ? 'producer' : 'buyer'}");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
