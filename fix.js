const fs = require('fs');

function fix(file, replaceDict) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of Object.entries(replaceDict)) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}

// 1. middleware.ts
fix('src/lib/supabase/middleware.ts', {
  'url.pathname = /\\/dashboard': 'url.pathname = `/${role}/dashboard`'
});

// 2. login actions
fix('src/app/(auth)/login/actions.ts', {
  'redirect(//dashboard)': 'redirect(`/${profile?.role || \'student\'}/dashboard`)'
});

// 3. Admin Layout
fix('src/app/(protected)/admin/layout.tsx', {
  'redirect(//dashboard)': 'redirect(`/${profile?.role || \'student\'}/dashboard`)'
});

// 4. Student Layout
fix('src/app/(protected)/student/layout.tsx', {
  'redirect(//dashboard)': 'redirect(`/${profile?.role || \'student\'}/dashboard`)'
});

// 5. Tutor Layout
fix('src/app/(protected)/tutor/layout.tsx', {
  'redirect(//dashboard)': 'redirect(`/${profile?.role || \'student\'}/dashboard`)'
});

// 6. Admin Actions
fix('src/app/(protected)/admin/actions.ts', {
  'revalidatePath(/admin/\\s)': 'revalidatePath(`/admin/${role}s`)'
});

// 7. Tutor Attendance Page
fix('src/app/(protected)/tutor/attendance/page.tsx', {
  '<Link href={/tutor/attendance/\\}>': '<Link href={`/tutor/attendance/${record.id}`}>'
});

// 8. Tutor Attendance Details
let tutorDetails = fs.readFileSync('src/app/(protected)/tutor/attendance/[id]/page.tsx', 'utf8');
tutorDetails = tutorDetails.replace(`.select(\n      *,\n      profiles:student_id`, `.select(\`\n      *,\n      profiles:student_id`);
tutorDetails = tutorDetails.replace(`question_attempts (answer_text, ai_evaluation, evaluation_status)\n    )`, `question_attempts (answer_text, ai_evaluation, evaluation_status)\n    \`)`);
fs.writeFileSync('src/app/(protected)/tutor/attendance/[id]/page.tsx', tutorDetails, 'utf8');

// 9. AI Evaluate
let aiEvaluate = fs.readFileSync('src/lib/ai/evaluate-answer.ts', 'utf8');
aiEvaluate = aiEvaluate.replace(/const userPrompt = Evaluate[\s\S]*?feedback"\.\n\}/, "const userPrompt = `Evaluate the following student answer.\\n\\nQuestion: ${question}\\nExpected Concepts: ${expectedConcepts.join(', ')}\\n\\nStudent Answer:\\n${studentAnswer}\\n\\nRequired JSON Schema:\\n{\\n  \"relevance\": 0.0,\\n  \"concepts_covered\": [\"concept1\"],\\n  \"missing_concepts\": [\"concept2\"],\\n  \"feedback\": \"Short feedback\"\\n}`");
fs.writeFileSync('src/lib/ai/evaluate-answer.ts', aiEvaluate, 'utf8');

// 10. AI Generate
let aiGen = fs.readFileSync('src/lib/ai/generate-question.ts', 'utf8');
aiGen = aiGen.replace(/const userPrompt = Generate[\s\S]*?short_answer\)\n    \}\n  \]\n\}/, "const userPrompt = `Generate ${count} ${difficulty}-level questions about \"${topic}\" of type \"${type}\".\\n\\nRequired JSON Schema:\\n{\\n  \"questions\": [\\n    {\\n      \"question\": \"string\",\\n      \"question_type\": \"${type}\",\\n      \"difficulty\": \"${difficulty}\",\\n      \"expected_concepts\": [\"concept1\", \"concept2\"],\\n      \"options\": [\"opt1\", \"opt2\"],\\n      \"correct_answer\": \"string\"\\n    }\\n  ]\\n}`");
fs.writeFileSync('src/lib/ai/generate-question.ts', aiGen, 'utf8');

console.log("Fixes applied successfully.");
