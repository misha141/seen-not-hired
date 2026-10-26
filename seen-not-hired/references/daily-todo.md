# Daily to-do (the Today tab)

When the user asks "what should I do today?", or during a morning check, rebuild the Today tab and give them the same list in chat. The tab is a snapshot. It's thrown away and rebuilt each time, so never store anything there that only lives there.

## Steps

1. If Gmail is available and the last email check was more than 4 hours ago, run an email check first (`email-tracking.md`), so the list is current.
2. Read Profile, Job Openings, Applications, Contacts and LinkedIn.
3. Build the sections below, in this order.
4. Clear `Today!A2:H` (values only). Never delete the tab or touch row 1, J1 or K1.
5. Write the new rows starting at A2. Write Due dates with `=DATE()`. Write the build time to K1 as `=DATE(..)+TIME(..)`, and to Profile > Today last built.
6. Copy the date format onto column F if needed (`tracker-schema.md`).
7. Report in chat.

"Today" means the current date in Profile > Timezone.

## Sections (in this order)

### 1. Apply: new roles to apply to
From Job Openings, take rows with Status New, To apply or Resume tailored, and Fit Strong or Good.
- Sort by Fit (Strong first), then Posted (newest first).
- Cap at 10 rows. If there are more, add one last row: "Plus 7 more in Job Openings".
- Put any role posted in the last 48 hours on top within its grade, and note "Posted yesterday" or "Posted today" in To do. Applying early matters.
- Leave out roles at companies where the user already has 3 or more active applications. Add a Heads up row for them instead.
- Include Stretch roles only if there are fewer than 3 Strong and Good roles.
- Due: blank. Link: Job link.

### 2. Deadline: OAs and deadlines
From Applications, take rows with Status Assessment, Action needed, Recruiter screen or Interviewing, plus Offer rows with a Deadline.
- Sort by Deadline (soonest first). Overdue items go first, with "OVERDUE" at the start of To do.
- To do: what to do, e.g. "Finish CodeSignal OA" or "Reply with availability".
- Due: Deadline.
- Interview-day items get Section "Interview" instead and stay in this position.

### 3. Follow up: follow-ups due
From Contacts, take rows with Status Sent, Follow up on on or before today, and Follow-up sent blank.
- If a follow-up draft already exists (Notes mention it), put it in section 4 instead.
- Also include LinkedIn rows with Status Connected and Date contacted 5 or more business days ago with no message yet. Suggest sending a short thank-you or ask.
- Due: the Follow up on date.

### 4. Send draft: drafts waiting to send
From Contacts, take rows with Status Draft ready. One row per company is enough ("3 drafts to Stripe recruiters in Gmail").
- Link: blank. Never paste Gmail links.

### 5. LinkedIn: notes to send
From LinkedIn, take rows with Status Note drafted. Put the person's name and company in Role or person and the first few words of the note in Why or notes.
- Rows with Status To find: add one row per company ("Find 2 people at Datadog to connect with").

### 6. Heads up (optional, at most 3 rows)
Things worth knowing that aren't tasks. For example:
- "No scan in 2 days"
- "4 active applications at Capital One. Consider a referral instead of applying again"
- "3 bounces at Acme. The email format may be wrong"

## Empty days
If a section is empty, leave it out. Don't write placeholder rows. If everything is empty, write one row: Section "Apply", To do "Nothing due. Want me to run a scan?"

## Chat report

Keep it short and give numbers first:

> **Today: 4 to apply, 1 OA due Friday, 3 follow-ups, 5 drafts ready.**
>
> **Apply first**
> 1. Stripe, Backend Engineer, posted today (Strong)
> 2. ...
>
> **Due soon**
> - Datadog CodeSignal OA, due Fri 10/25
>
> **Follow-ups**: 3 people, drafts are in Gmail.
> **LinkedIn**: 2 notes ready (in the LinkedIn tab).

End with the single most useful next action ("Start with the Stripe role, it went up this morning").
