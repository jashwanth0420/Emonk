const fs = require('fs');

function replaceAll(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replace);
  fs.writeFileSync(file, content, 'utf8');
}

// 1. Fix loginAction role mapping
let login = fs.readFileSync('src/app/(auth)/login/actions.ts', 'utf8');
login = login.replace(/redirect\(\\\\/\\/dashboard\\)/g, "const basePath = (profile?.role === 'super_admin') ? 'admin' : (profile?.role || 'student');\n  redirect(//dashboard)");
fs.writeFileSync('src/app/(auth)/login/actions.ts', login, 'utf8');

// 2. Fix middleware.ts role mapping
let mw = fs.readFileSync('src/lib/supabase/middleware.ts', 'utf8');
mw = mw.replace(/const role = profile\?\.role \|\| 'student'\n\s*const url = request\.nextUrl\.clone\(\)\n\s*url\.pathname = \\\\/\\/dashboard\/g, "const role = profile?.role || 'student'\n    const basePath = role === 'super_admin' ? 'admin' : role\n    const url = request.nextUrl.clone()\n    url.pathname = //dashboard");
fs.writeFileSync('src/lib/supabase/middleware.ts', mw, 'utf8');

// 3. Fix Button asChild error in student/attendance/page.tsx
let att = fs.readFileSync('src/app/(protected)/student/attendance/page.tsx', 'utf8');
att = att.replace(/<Button asChild><a href="\/student\/dashboard">Go to Dashboard<\/a><\/Button>/g, '<a href="/student/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">Go to Dashboard</a>');
att = att.replace(/<Button asChild className="mt-8"><a href="\/student\/dashboard">Return to Dashboard<\/a><\/Button>/g, '<a href="/student/dashboard" className="mt-8 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">Return to Dashboard</a>');
fs.writeFileSync('src/app/(protected)/student/attendance/page.tsx', att, 'utf8');

console.log("Fixed role routing and Button asChild");
