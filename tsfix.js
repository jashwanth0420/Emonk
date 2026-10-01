const fs = require('fs');
const glob = require('glob'); // Not available by default in Node. We'll just list them.

function patchFile(file, patches) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of patches) {
      content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched', file);
  } catch(e) {}
}

patchFile('src/app/(protected)/admin/tutors/page.tsx', [
  ['action={createUserAction}', 'action={createUserAction as any}']
]);
patchFile('src/app/(protected)/admin/students/page.tsx', [
  ['action={createUserAction}', 'action={createUserAction as any}']
]);
patchFile('src/app/(protected)/admin/schedules/page.tsx', [
  ['action={createScheduleAction}', 'action={createScheduleAction as any}']
]);
patchFile('src/app/(protected)/admin/topics/page.tsx', [
  ['action={createTopicAction}', 'action={createTopicAction as any}']
]);
patchFile('src/app/(protected)/admin/posts/page.tsx', [
  ['action={createPostAction}', 'action={createPostAction as any}']
]);
patchFile('src/app/(protected)/admin/questions/page.tsx', [
  ['action={reviewGeneratedQuestionAction}', 'action={reviewGeneratedQuestionAction as any}']
]);

patchFile('src/app/(protected)/student/attendance/page.tsx', [
  ['action={submitTopicsAction}', 'action={submitTopicsAction as any}'],
  ['action={submitAnswerAction}', 'action={submitAnswerAction as any}'],
  ['<Button asChild><a', '<a'],
  ['</a></Button>', '</a>'],
  ['<Button asChild className="mt-8"><a', '<a className="mt-8"']
]);

patchFile('src/app/(protected)/student/dashboard/page.tsx', [
  ['action={checkInAction.bind(null, todaysSchedule.id)}', 'action={checkInAction.bind(null, todaysSchedule.id) as any}'],
  ['<Button asChild className="w-full mt-4" variant="outline">\n                          <a href="/student/attendance">Continue Session</a>\n                        </Button>', '<a href="/student/attendance" className="w-full mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Continue Session</a>'],
  ['record.schedules?.topics?.name', '(record.schedules as any)?.topics?.name']
]);

patchFile('src/app/(protected)/student/profile/actions.ts', [
  ['result.error.errors[0]', '(result.error as any).errors[0]']
]);
patchFile('src/app/(protected)/student/profile/page.tsx', [
  ['action={updateProfileAction}', 'action={updateProfileAction as any}']
]);

patchFile('src/app/(protected)/tutor/attendance/[id]/page.tsx', [
  ['action={reviewAttendanceAction}', 'action={reviewAttendanceAction as any}'],
  ['<Button variant="outline" asChild>\n          <a href="/tutor/attendance">Back to List</a>\n        </Button>', '<a href="/tutor/attendance" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Back to List</a>']
]);

patchFile('src/app/(protected)/tutor/attendance/page.tsx', [
  ['<Button asChild size="sm">\n                    <Link href={/tutor/attendance/}>Review Submission</Link>\n                  </Button>', '<Link href={/tutor/attendance/} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">Review Submission</Link>']
]);

