# Tracker schema

The tracker is one Google Sheet named **Seen Not Hired Tracker** with eight tabs, in this order:

1. Profile
2. Master Resumes
3. Today
4. Job Openings
5. Applications
6. Contacts
7. LinkedIn
8. Scan Log

Row 1 of every tab is a bold, frozen header row. Data starts on row 2. Find columns by their header text, not by letter, in case the user has moved or added columns. The letters below are the layout the skill creates.

## Ground rules for writing

### Read before write
Before any write, read the range you're about to change (and for appends, the column you dedupe on). Never write over a cell that already has a value you didn't expect. If the sheet doesn't look like this schema (a missing tab or a renamed header), tell the user and ask before you change the structure.

### Never delete
Don't delete rows, columns or tabs. To retire a row, set its Status (Skip, Closed, Withdrawn, Not a fit, Do not contact). The one exception is the Today tab. You may clear its data rows (A2 down) before you rebuild it, but don't clear the header and don't delete the tab.

### Dates: always formulas
The sheet's locale may not be US, so a typed "10/23/2026" could be read as text or as the 10th of the 23rd month. Always write dates as formulas:

- Date: `=DATE(2026,10,23)`
- Date and time: `=DATE(2026,10,23)+TIME(14,5,0)`

Write them with the Sheets connector's formula-writing call (for example `update_formulas`), or with a values write or append that uses USER_ENTERED input. Don't use RAW, because RAW stores the formula as a text string. The same applies to new rows that include formulas, like the Contacts follow-up date. If the append call can't take formulas, append the plain values first, then write the date and formula cells into those rows with the formula call. Then make sure the column has a date number format:

- Date columns: pattern `mm/dd/yyyy`, or the Date format from Profile if the user picked one
- Date-time columns: `mm/dd/yyyy hh:mm`

Use a batch update `repeatCell` with `userEnteredFormat.numberFormat` = `{type: "DATE", pattern: "mm/dd/yyyy"}` (or `DATE_TIME`) and `fields: "userEnteredFormat.numberFormat"`.

To compare dates when you read them back, read with the unformatted value or serial number option where the connector offers it. Otherwise parse the displayed value with the format above.

### Follow-up formula
Follow-up dates are always calculated, never typed:

```
=IF(M2="","",WORKDAY(M2,5))
```

Here M is Date sent, and 5 is the "Follow-up business days" value from Profile. Write the formula on every new Contacts row, with the row number adjusted.

### Appended rows lose dropdowns: copy them over
A plain append writes values only. The new rows don't get the Status dropdown or the date format. So after every append:

1. Note the row range you just added (for example rows 41 to 48).
2. Send one batch update with two `copyPaste` requests from row 2 of that tab (the template row) to the new rows:
   - `pasteType: "PASTE_DATA_VALIDATION"`
   - `pasteType: "PASTE_FORMAT"`
   - For both, use `source` = row 2 across all columns and `destination` = the new rows across all columns.
3. If row 2 doesn't exist yet (an empty tab), set the validation and formats directly with `setDataValidation` and `repeatCell`, as described under "Creating the sheet".

Setup also applies validation and formats to rows 2 to 1000 of each tab, so most appends are already covered. Still do the copy step every time. It costs one call and prevents silent gaps when a tab grows past row 1000 or someone pasted over the formatting.

### Mirroring applications
Applications and Job Openings describe the same job from two angles. Whenever one changes, update the other:

- **User applies to a role in Job Openings:** set Job Openings Status to Applied and Date applied to today. Then append to Applications (or update it if a row with the same link or job ID exists), with Status Applied, Source and Link copied over.
- **User applies to something not in Job Openings:** add it to Applications. Also append it to Job Openings with Fit left blank, Status Applied, and Found on set to "User", so the dedupe list stays complete.
- **Later changes** (Assessment, Interviewing, Offer, Rejected, Withdrawn): update Applications Status, Last update and Next step. Also update Job Openings Status. Interviewing, Offer and Rejected map one to one. Assessment and Recruiter screen map to Interviewing. Withdrawn maps to Closed.

Match rows on link first, then job ID, then company plus a close role title. If it's ambiguous, ask.

### Dedupe
- Job Openings: dedupe on the normalized Job link (lowercase host, no query string except a required job id parameter, no trailing slash) and also on Company + Job ID.
- Contacts: dedupe on email (lowercase).
- LinkedIn: dedupe on Profile URL, or on Name + Company if there's no URL.
- Applications: dedupe on Link, or Company + Job ID.

---

## Tab 1: Profile

A key/value tab. Columns: **A Field, B Value, C Notes**. Read it as a dictionary keyed by column A. Never rely on row numbers, because users may add rows. All fields are listed in `setup.md` with their defaults.

There are no dropdowns except on these fields (validation on the Value cell):
- Needs sponsorship: Yes, No
- Open to remote: Yes, No, Remote only
- Include internships: Yes, No
- Scan big-company sites: Yes, No

### Master resume rows in Profile
Each master resume has one summary row in Profile, plus one key that says which master is the default:

| Field | Value | Notes |
|---|---|---|
| Default master | `backend` | The Resume ID used when nothing more specific applies |
| Master: backend | `Software Engineer · Backend, event-driven systems · Java, Spring Boot, Kafka, AWS · 3 yrs · targeting Mid (SWE II)` | `Master Resumes tab, v2, updated 10/24/2026` |
| Master: ai-ml | `ML Engineer · LLM applications · Python, RAG, FastAPI · 1 yr · targeting Entry/Mid` | `Master Resumes tab, v1, updated 10/24/2026` |

Update these rows in place. Never add a second row with the same Field. When a master is retired, keep its row and set Notes to "Archived". The fields Years of experience, Target roles, Core stack, Adjacent stack and Resume facts are filled from the **default** master (see `resume-analysis.md`).

## Tab 2: Master Resumes

One row per master resume version. The Active row for each Resume ID is the source of truth for tailoring, grading and resume facts. Never delete rows. Older versions are kept with Status Archived.

| Col | Header | Type | Values |
|---|---|---|---|
| A | Resume ID | Text | Short slug: `backend`, `ai-ml`, `main` |
| B | Label | Text | e.g. "Backend (Java/Spring)" |
| C | Status | Dropdown | Active, Draft, Archived |
| D | Version | Number | 1, 2, 3 |
| E | Updated | Date | `mm/dd/yyyy` |
| F | Field | Text | e.g. Software Engineer |
| G | Specialization | Text | e.g. Backend, event-driven systems |
| H | Stack and years | Text | One skill per line, e.g. `Java: 3 yrs`, `AWS: listed, years unclear`, `React: projects only` |
| I | Target level | Text | e.g. Mid (SWE II) |
| J | Target roles | Text | Comma-separated |
| K | Market notes | Text | Posting count, top skills asked for, and a "thin data" note if it applies |
| L | Quiz answers | Text | `Q1: question / answer` per line. Skipped questions say "skipped" |
| M | Bullet sources | Text | One line per bullet, e.g. `Exp1.B2: resume + Q2` |
| N | Resume text | Text | The full master in the plain-text format from `resume-analysis.md`. Wrap off, so the row stays short |
| O | Notes | Text | |

Only one row per Resume ID may be Active. When you save a new version, set the old one to Archived first, then append the new row. If two rows for the same ID ever show as Active, use the higher Version and tell the user.

## Tab 3: Today

This tab is rebuilt from scratch every time. See `daily-todo.md`.

| Col | Header | Notes |
|---|---|---|
| A | Section | Apply, Deadline, Follow up, Send draft, LinkedIn, Interview, Heads up |
| B | # | 1, 2, 3 within the section |
| C | To do | One short line, e.g. "Apply: Backend Engineer, posted yesterday" |
| D | Company | |
| E | Role or person | |
| F | Due | Date formula, `mm/dd/yyyy`, blank if none |
| G | Link | Job link or contact email. Never a link taken from an email body |
| H | Why or notes | One line |

Cell J1 holds the label "Built:" and K1 holds the build time as `=DATE(..)+TIME(..)`. Keep these two cells out of the cleared range (clear `A2:H` only).

## Tab 4: Job Openings

| Col | Header | Type | Values |
|---|---|---|---|
| A | Fit | Dropdown | Strong, Good, Stretch, Skip |
| B | Company | Text | |
| C | Role | Text | Title as posted |
| D | Job ID | Text | Requisition or posting ID if shown. Format as plain text so leading zeros survive |
| E | Location | Text | |
| F | Posted | Date | `mm/dd/yyyy` |
| G | Found on | Text | Greenhouse, Ashby, Lever, Workday, Oracle HCM, User, Other |
| H | Why it fits | Text | One line |
| I | Watch out for | Text | Years asked, sponsorship wording, location catch |
| J | Sponsorship | Dropdown | Sponsors, Unclear, No sponsorship, Not needed |
| K | Your contact there | Text | Name from Contacts or LinkedIn tab, if any |
| L | Job link | Text | The canonical posting URL. This is the dedupe key |
| M | Status | Dropdown | New, To apply, Resume tailored, Applied, Interviewing, Rejected, Closed, Skip |
| N | Date applied | Date | `mm/dd/yyyy` |
| O | Notes | Text | |
| P | Master resume | Text | The Resume ID this role was graded against (see `grading.md`). Blank if there's no master yet |

New scan results go in with Status **New**, or **Skip** for Skip-graded rows the user wants to see. When the user says they plan to apply, set Status to **To apply**.

Conditional formatting (optional but nice): Fit = Strong gets a light green fill, Good light blue, Stretch light yellow, Skip grey text.

## Tab 5: Applications

| Col | Header | Type | Values |
|---|---|---|---|
| A | Date applied | Date | `mm/dd/yyyy` |
| B | Company | Text | |
| C | Role | Text | |
| D | Job ID | Text | Plain text format |
| E | Location | Text | |
| F | Status | Dropdown | Applied, Action needed, Assessment, Recruiter screen, Interviewing, Offer, Rejected, Withdrawn |
| G | Next step | Text | e.g. "CodeSignal OA", "Phone screen with recruiter" |
| H | Deadline | Date | Date of the next step or OA due date. `mm/dd/yyyy` |
| I | Last update | Date | Date of the last email or change. `mm/dd/yyyy` |
| J | Contact / referral | Text | |
| K | Source | Text | Company site, Greenhouse, Referral, Handshake, LinkedIn, etc. |
| L | Link | Text | Posting link |
| M | Notes | Text | |

Status meanings:
- **Action needed:** the company asked for something (more info, availability, a form) and the user hasn't done it yet.
- **Assessment:** an OA or take-home is pending. Put the due date in Deadline.
- **Recruiter screen:** a first call is scheduled or done.
- **Interviewing:** technical or onsite rounds.

## Tab 6: Contacts

This tab holds recruiters and email outreach (people you email).

| Col | Header | Type | Values |
|---|---|---|---|
| A | Batch | Number | Outreach wave: 1, 2, 3. Lower goes first |
| B | Priority | Dropdown | High, Medium, Low |
| C | Name | Text | |
| D | Email | Text | Dedupe key |
| E | Company | Text | |
| F | Title | Text | |
| G | Type | Dropdown | Recruiter, University recruiter, Hiring manager, Engineer, Alum, Staffing agency, Other |
| H | Template | Dropdown | Recruiter pitch, New-grad pitch, Referral ask, Staffing pitch, Custom |
| I | Why them | Text | One line |
| J | Source | Text | Handshake export, Company site, Referral, Event, etc. |
| K | Last active | Date | From exports that show it. `mm/dd/yyyy` |
| L | Status | Dropdown | Not sent, Draft ready, Sent, Followed up, Replied, Bounced, Do not contact |
| M | Date sent | Date | `mm/dd/yyyy` |
| N | Follow up on | Formula | `=IF(M2="","",WORKDAY(M2,5))`, formatted `mm/dd/yyyy` |
| O | Follow-up sent | Date | Date the one follow-up went out. `mm/dd/yyyy` |
| P | Notes | Text | |

Status flow: Not sent, then Draft ready (you made a Gmail draft), then Sent (the user confirms), then Followed up (the user confirms the follow-up was sent). Replied, Bounced and Do not contact can happen at any point. Do not contact is permanent. Use it when someone asks not to be contacted.

## Tab 7: LinkedIn

People the user plans to connect with on LinkedIn. The user finds them and sends the notes. You only draft.

| Col | Header | Type | Values |
|---|---|---|---|
| A | Priority | Dropdown | High, Medium, Low |
| B | Name | Text | Filled in by the user, or from a name they gave you |
| C | Title | Text | |
| D | Company | Text | |
| E | Location | Text | |
| F | Why them | Text | |
| G | Hook | Text | Shared school, past employer, city, a post they wrote |
| H | Related job ID | Text | A role the user applied to there |
| I | Profile URL | Text | Only if the user pasted it |
| J | Note draft | Text | Under 300 characters |
| K | Chars | Formula | `=IF(J2="","",LEN(J2))` |
| L | Status | Dropdown | To find, Note drafted, Request sent, Connected, Messaged, Replied, Referral, Not a fit |
| M | Date contacted | Date | `mm/dd/yyyy` |
| N | Notes | Text | |

## Tab 8: Scan Log

Add one row per scan run, email check or morning check. Never edit old rows.

| Col | Header | Type | Values |
|---|---|---|---|
| A | Run at | Date-time | `=DATE(..)+TIME(..)`, format `mm/dd/yyyy hh:mm` |
| B | Type | Dropdown | Board sweep, Workday, Oracle HCM, Email check, Morning check, Manual |
| C | Slot | Text | e.g. "Slot 2", or blank |
| D | Sources checked | Text | Count plus a short list, e.g. "184 boards" or "Wells Fargo, Intel, PayPal" |
| E | Postings seen | Number | |
| F | New | Number | New after dedupe |
| G | Strong | Number | |
| H | Good | Number | |
| I | Stretch | Number | |
| J | Skipped | Number | |
| K | Errors / unreadable | Text | Which sources failed and why, in a few words |
| L | Notes | Text | |

The last Email check row's Run at value is the starting point for the next email search.

---

## Creating the sheet

`setup.md` calls this. Steps:

1. **Create the spreadsheet** titled `Seen Not Hired Tracker`. Use the Sheets connector's create call if there is one. Otherwise use Drive's create-file call with mime type `application/vnd.google-apps.spreadsheet`. Then rename the default tab to Profile and add the other seven tabs in order, using `addSheet` and `updateSheetProperties` requests.
2. **Write the headers** to row 1 of each tab, in one batched values write.
3. **Format** with one batch update:
   - Freeze row 1 on every tab (`gridProperties.frozenRowCount: 1`).
   - Make row 1 bold with a light grey background.
   - Set date number formats on every Date column for rows 2 to 1000 (Scan Log A uses date-time).
   - Set plain text format (`{type: "TEXT"}`) on the Job ID columns.
   - Add data validation (`setDataValidation`, condition `ONE_OF_LIST`, `showCustomUi: true`, `strict: false`) on every Dropdown column for rows 2 to 1000, using the values listed above.
   - Set reasonable column widths. Text-heavy columns like Why it fits, Notes and Note draft should be about 280 to 320 px, with wrap turned on. On Master Resumes, set columns H, K, L and M to wrap, and leave N (Resume text) unwrapped (clip), so rows stay readable.
   - Add a basic filter on row 1 for Job Openings, Applications, Contacts and LinkedIn.
4. **Leave the data rows empty.** Don't pre-fill formulas into empty rows, because an append would then land below them and leave blank rows. Write the Contacts N follow-up formula and the LinkedIn K character count formula as part of each new row when you add it.
5. **Read back** the headers of every tab to confirm they're there before you tell the user it's done.

Sheet IDs (the numeric tab IDs) are created by Google. Read them with a get-spreadsheet call when you need them for batch updates, and don't hard-code them.

## Upgrading an older tracker

Trackers created before the master resume step don't have the Master Resumes tab or the Job Openings Master resume column. When a task needs them:

1. Add the **Master Resumes** tab with its headers, dropdown and formats. Place it right after Profile if you can. If moving tabs fails, leave it at the end, which works too.
2. If Job Openings has no **Master resume** header, write it in the first empty header cell after Notes. Find columns by header text, so the exact letter doesn't matter.
3. Don't rename, move or delete anything else. Tell the user in one line what you added.
