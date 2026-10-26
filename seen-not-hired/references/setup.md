# First-run setup

Run this when no sheet named "Seen Not Hired Tracker" exists, or when the user asks to set up. The aim is to go from a resume upload to a saved master resume and a working tracker in one conversation, with as few questions as possible.

If a tracker already exists and the user says "set up again", don't make a second sheet. Offer to review the Profile tab, or to build or update a master resume (`resume-analysis.md`).

## The order

1. Check tools and report
2. Upload the resume
3. Resume analysis, quiz, suggestions and master resume (`resume-analysis.md`). The tracker gets created here, when the master is saved
4. The remaining setup questions (skipping what the analysis already answered)
5. Write the Profile tab
6. Offer scheduled tasks
7. Offer the dashboard
8. First actions

## Step 1: Check tools and report

Check which tools you have (see the table in SKILL.md). Then tell the user in a short list what works and what's missing, with one line each. Example:

> Here's what I can use right now:
> - Gmail: yes (I can read job emails and make drafts)
> - Google Drive and Sheets: yes (for your tracker)
> - Web search: yes (to check what current postings ask for)
> - Claude in Chrome: **no**. I need it to scan career sites. You can turn it on later, and everything else still works.
> - Scheduled tasks: yes

If Google Sheets is missing, you can still do the resume analysis and build the master resume. Give the master and the profile summary back as text they can save. Tell them to enable the Google Sheets and Google Drive connectors, then say "set up my job search" again, and paste the master when asked.

## Step 2: Upload the resume

Ask them to attach their resume (PDF or DOCX) if they haven't. Read all of it. Pull out the contact details too (name, email, phone, LinkedIn, GitHub or portfolio, city). They go in the master and in Profile.

## Step 3: Resume analysis and master resume

Follow `resume-analysis.md` from start to finish:

1. Analysis (field, specialization, stack with years per skill, total years, likely level)
2. Market check (web search on current postings, saying so when the data is thin)
3. Confirm the summary
4. Guided quiz (5 to 8 questions, one or two at a time)
5. Line-level suggestions, each with a source tag
6. Approval, then the master resume
7. Save. This creates the tracker (`tracker-schema.md` > "Creating the sheet") if it doesn't exist yet. Then it writes the Master Resumes row and the Profile summary rows (`Master: {id}` and `Default master`)

If the user wants to skip this step ("just set up the tracker"), let them. Skip to Step 4, and ask the years and target roles questions normally. Read the upload for Resume facts and the stacks, and leave Default master blank.

If they want a second master (say, backend and AI/ML), offer to do it after setup is finished, so setup doesn't drag on.

## Step 4: The remaining questions

Ask in one message, pre-filled with your best guess so they can answer "all good" or give a few corrections. Keep it short.

**Already answered by the analysis.** Show these as a quick recap they can edit. Don't ask them again:
- **Target roles** (from the summary they confirmed)
- **Years of experience** (from the analysis)
- **Target level**

For example: "From your resume: backend and full stack roles, about 3 yrs, targeting mid-level. Change anything?"

**Still to ask:**
1. **Locations.** Cities or states they'd work in, and whether they're open to remote (Yes, No or Remote only). Note whether they'd relocate.
2. **Visa sponsorship.** "Do you need visa sponsorship now or in the future? (Default: no.)" If yes, ask whether they're on OPT or STEM OPT, and whether they need E-Verify employers. Keep it neutral and don't push for details they didn't offer.
3. **Companies to skip.** Any companies to leave out (a recent rejection cooldown, a current employer, personal reasons). Parent companies count. If they skip a company, ask whether to skip its subsidiaries too.
4. **Salary range.** A minimum and a target, or "skip". It's used to flag postings that are clearly below their minimum, never to hide them.
5. **Writing tone.** Pick one: Friendly and casual, Warm but professional, or Short and direct. Default: Warm but professional.

Optional, only if they want: whether to include internships, a daily draft cap (default 8), their timezone (guess it from their city and confirm), and whether to scan big-company Workday and Oracle sites (default Yes if Chrome is available).

If the user changes target roles or years here, update the default master's Master Resumes row (Target roles column, in place) and its `Master: {id}` Profile row too, so they stay in sync.

## Step 5: Write the Profile tab

The tracker usually exists by now, because Step 3 created it. If it doesn't (the user skipped the analysis), create it now with `tracker-schema.md` > "Creating the sheet".

Read Profile first, so you don't duplicate the rows Step 3 already wrote. Then write or update the rows below, with column A as Field, B as Value and C as Notes. Write dates with `=DATE()`.

### Profile fields

| Field | Value (example or default) | Notes |
|---|---|---|
| Profile version | 2 | Used by future skill updates |
| Created | `=DATE(y,m,d)` | |
| Name | from resume | |
| Email | from resume | Used in signatures |
| Phone | from resume, or blank | Leave blank if they'd rather not include it |
| LinkedIn | `linkedin.com/in/...` | Always written as plain text in emails |
| GitHub / portfolio | optional | |
| City | e.g. Austin, TX | |
| Timezone | e.g. America/Chicago | Used for scan slots and scheduled tasks |
| Default master | e.g. `backend` | Written in Step 3. Blank if no master |
| Master: {id} | One-line profile summary | Written in Step 3. One row per master |
| Target roles | comma-separated list | From the default master, editable |
| Target level | e.g. Mid (SWE II) | From the default master, editable |
| Core stack | e.g. Java, Spring Boot, Python, React, AWS | From the default master. Drives Strong grades when there's no master |
| Adjacent stack | e.g. Go, data engineering, infra | From the default master |
| Years of experience | number | Full-time only. From the analysis |
| Graduation date | `=DATE()` or blank | Matters for new-grad roles |
| Include internships | No | Yes or No |
| Locations | e.g. TX, CO, Seattle WA, NYC | |
| Open to remote | Yes | Yes, No or Remote only |
| Open to relocation | Yes | |
| Needs sponsorship | No | Yes or No. Off by default |
| Work authorization note | e.g. "OPT now, will need H-1B" | Only if Needs sponsorship is Yes. Never goes on a resume |
| Needs E-Verify employer | No | For STEM OPT |
| Companies to skip | comma-separated | Includes subsidiaries the user named |
| Salary minimum | e.g. 110000 | Blank is fine |
| Salary target | e.g. 130000 | |
| Tone | Warm but professional | |
| Resume facts | 6 to 10 short lines | From the default master. Strongest facts, with numbers exactly as written |
| Email signature | Name / phone / email / LinkedIn as plain text | |
| Max emails per company per week | 3 | |
| Follow-up business days | 5 | |
| Daily draft cap | 8 | Max new outreach drafts per day |
| LinkedIn notes per company per batch | 2 | |
| Scan big-company sites | Yes | Workday and Oracle HCM, which need Chrome |
| Scan slots | Before 9, 9 to 12, 12 to 3, after 3 | Local time ranges for slots 1 to 4 |
| Extra boards | blank | The user's own additions, as `slug:GH`, `slug:AS` or `slug:LV`, comma-separated |
| Removed boards | blank | Boards to drop from the starter pool |
| Today last built | blank | Updated by the daily to-do |
| Date format | mm/dd/yyyy | Change to dd/mm/yyyy if they prefer |

Show them a compact version of the saved Profile, including the profile summary line. Tell them they can edit the sheet directly any time, and you'll pick up the changes next session.

## Step 6: Offer scheduled tasks (optional)

If scheduled tasks are available, offer them in one line each. Read `scheduling.md` for the prompts. Don't create them without a yes.

## Step 7: Offer the dashboard (optional)

Tell them there's an optional read-only dashboard that shows their sheet on one mobile-friendly page. If they want it, walk them through `dashboard/INSTALL.md` one step at a time, and give them the contents of `dashboard/Code.gs` and `dashboard/Index.html` to paste. It takes about 5 minutes.

## Step 8: First actions

End setup with 2 or 3 concrete next steps that fit the tools they have. For example:

> You're set up. Your master resume is saved. Want me to:
> 1. Run a first scan of about 220 company job boards? (Takes a few minutes.)
> 2. Check your Gmail for any application updates from the last 30 days?
> 3. Build a second master resume for AI/ML roles?

For the first email check, search back 30 days instead of using Scan Log.
