# Scheduled tasks (optional)

Scheduled tasks let Claude run a prompt at set times. They're optional, and the skill works fine without them.

## What scheduled runs can and can't do

Scheduled tasks run in the cloud, **without Claude in Chrome**. So:

- **They can:** check Gmail, update the sheet, create drafts, rebuild the Today tab, and send the user a notification.
- **They can't:** scan career sites or job boards. Scans need Chrome, so they always happen in a normal chat. A scheduled task can remind the user to run one.

Tell the user this when you offer scheduling, so they aren't surprised. A useful tip: notifications from scheduled tasks usually arrive reliably, while notifications from a chat often don't show up while the user is active in the app.

## Before creating anything

1. Check that a scheduled-task tool is available. If it isn't, skip to "Without scheduled tasks" below.
2. Ask for a yes. Show the times in their timezone (Profile > Timezone) and let them change them.
3. Avoid round times like 8:00 or 9:00. Pick odd minutes (7:48, 12:39), which tend to run more reliably than the busiest slots.
4. Weekdays only, unless they ask for weekends.

## Task 1: Morning check

**Name:** Seen Not Hired: morning check
**When:** weekdays at about 7:45am local time

**Prompt:**
```
Use the seen-not-hired skill. Do my morning job search check:
1. Find my "Seen Not Hired Tracker" sheet and read the Profile tab.
2. Check Gmail since the last check for application confirmations, rejections, assessments, interview requests, recruiter replies and bounces. Update Applications, Job Openings and Contacts.
3. Create Gmail drafts for follow-ups that are due today.
4. Create new outreach drafts up to my daily cap, following the per-company limits.
5. Draft LinkedIn notes for any LinkedIn rows marked To find that have names.
6. Rebuild the Today tab.
7. Log a Morning check row in Scan Log.
Never send anything. End with a short summary that ends with: "Open a chat with Chrome on and say: run the scan."
```

## Task 2: Scan reminders

**Name:** Seen Not Hired: scan reminder
**When:** weekdays at about 9:39am, 12:39pm and 3:39pm local time (one task with three times, or three tasks if only one time per task is allowed)

**Prompt:**
```
Use the seen-not-hired skill. Quick check: search Gmail since the last check for new assessments, interview requests and recruiter replies, and update the tracker if anything changed. Then send me a short reminder: which scan slot is up now (from my Profile's Scan slots), plus anything urgent from email. Don't scan sites and don't send anything.
```

The reminder makes sense with the slot times in `company-pool.md`. Morning check at 7:45 means slot 1 runs before 9, then 9:39 is slot 2, 12:39 is slot 3 and 3:39 is slot 4.

## Changing or stopping
If the user wants to change times or stop, update or delete the scheduled task they named. Never delete tasks you didn't create for this skill.

## Without scheduled tasks

Give them a simple routine to follow by hand instead:

- **Morning (5 min):** open Claude and say "morning check". Then send the drafts in Gmail.
- **Late morning and mid-afternoon (5 to 10 min each):** with Chrome on, say "run the scan". Then apply to anything Strong that was posted today.
- **End of day (2 min):** tell Claude what you did: "I applied to X and Y, sent the emails, sent LinkedIn notes to A and B."
