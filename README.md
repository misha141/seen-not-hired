# seen-not-hired

**Scans, drafts, follows up, tracks. You just wait to be seen.**

Your job hunt, automated. The ghosting, unfortunately, is not.

`seen-not-hired` is a Claude skill for CS students and early-career software engineers. It turns Claude into a job search assistant. It finds fresh roles, grades them against your profile, keeps a Google Sheet tracker current, writes cold emails and LinkedIn notes for you to send, reads your inbox for updates, and hands you a short to-do list every day.

You stay in control. It never sends, applies or signs in for you. It does the busywork up to the point where you click the button.

---

## What it does

| | |
|---|---|
| **Setup in one chat** | Reads your resume, asks 7 quick questions and builds a Google Sheet tracker with everything formatted. Your answers live in a Profile tab, so you never re-explain yourself. |
| **Resume analysis and master resume** | Works out your field, stack and years per skill, checks what current postings ask for, asks a short quiz to fill gaps, suggests line-level fixes (each traced back to your resume or your answers), and saves an approved master resume that grading and tailoring use from then on. You can keep more than one (say, backend and AI/ML). |
| **Job scanning** | Checks about 220 company boards on Greenhouse, Ashby and Lever through their public APIs, plus big-company Workday and Oracle HCM career sites (best-effort). It skips anything already in your sheet. |
| **Grading** | Sorts each role into Strong, Good, Stretch or Skip, based on your years, stack, locations and (if you turn it on) visa sponsorship wording. |
| **Resume tailoring** | Tailors your resume to one posting without inventing anything, lists your gaps honestly, and keeps it to 1 page. It also gives you a copy-paste prompt if you'd rather use another tool. |
| **Cold email outreach** | Writes Gmail **drafts** from a few short templates (recruiter pitch, new-grad pitch, referral ask). Built-in limits: 3 emails per company per week, and one follow-up after 5 business days. |
| **LinkedIn notes** | Suggests who to look for and what to search, then writes connection notes under 300 characters. You do the browsing and sending. |
| **Email tracking** | Reads Gmail for confirmations, rejections, online assessments, interview invites, recruiter replies and bounces, and updates your tracker. |
| **Daily to-do** | Rebuilds a Today tab: roles to apply to (newest and strongest first), OAs and deadlines, follow-ups due, drafts to send, LinkedIn notes to send. |
| **Status updates** | Say "I applied to Stripe" or "I sent those emails" and the right rows and dates get updated. |
| **Recruiter list cleanup** | Turns a messy CSV export (Handshake or similar) into a ranked, deduped contact list. |
| **Dashboard** | An optional, read-only web page for your tracker that works on your phone. |

## What you need

- A **paid Claude plan** with Skills (Pro, Max, Team or Enterprise), using the **Claude app**: claude.ai on the web or the desktop app.
- These **connectors** turned on in Settings > Connectors:
  - **Gmail**, to read job emails and create drafts
  - **Google Drive**, to find your tracker by name
  - **Google Sheets**, to create and update the tracker
- **Claude in Chrome**, for scanning career sites and job APIs.
- **Scheduled tasks** (optional), for a morning check and scan reminders.

The skill checks what's available and tells you what's missing. It keeps working with whatever you have. For example, without Chrome it can't scan, but email tracking and outreach still work.

> v1 targets the Claude app only. Claude Code and the API aren't supported yet.

## Install (5 minutes)

1. **Get the ZIP.** Download `seen-not-hired.zip` from the [Releases](../../releases) page, or build it yourself:
   ```bash
   git clone <this repo>
   cd seen-not-hired
   ./build.sh
   ```
2. **Upload it.** In Claude, go to **Settings > Capabilities**, find **Skills**, click **Upload skill** and choose `seen-not-hired.zip`. Make sure it's switched on.
3. **Connect your tools.** In **Settings > Connectors**, connect Gmail, Google Drive and Google Sheets.
4. **Install Claude in Chrome** (optional but recommended). Get the extension from the Chrome Web Store and sign in.
5. **Start a new chat.**

## First run

Attach your resume and say:

> Set up my job search.

Claude will then:
1. Tell you which tools it can use and what's missing.
2. Read your resume and ask about target roles, years of experience, locations and remote, visa sponsorship (off by default), companies to skip, salary range, and writing tone.
3. Create a Google Sheet named **Seen Not Hired Tracker**, with tabs for Profile, Today, Job Openings, Applications, Contacts, LinkedIn and Scan Log.
4. Offer to set up scheduled tasks.
5. Offer to walk you through installing the dashboard.

Then try "run the scan", "check my email" or "what should I do today?"

## A daily routine

| When | You say | What happens |
|---|---|---|
| Morning | *"Morning check"* (or let the scheduled task do it) | Gmail is checked, the tracker is updated, follow-up and outreach drafts are created, and the Today tab is rebuilt. |
| | | You open Gmail, add your resume where needed, and send the drafts. |
| Late morning | *"Run the scan"* (with Chrome on) | Fresh roles are scanned, graded and added. Strong ones come first. |
| | *"Tailor my resume for the Stripe one"* | You get a tailored resume, a change list and your gaps. |
| | | You apply on the company site. |
| | *"I applied to Stripe and Datadog"* | Applications and Job Openings are updated. |
| Afternoon | *"Run the scan"* | The next slot of big-company sites, plus a fresh sweep. |
| | *"LinkedIn notes for Datadog"* | You get search ideas and notes under 300 characters. You send them yourself. |
| Evening | *"I sent the emails and the notes to Sam and Priya"* | Statuses and dates are updated, and follow-up dates fill in automatically. |

Applying within a day or two of a posting going up makes a real difference. That's why the scan runs a few times a day.

## Safety and limitations

**Drafts only.** The skill never sends emails or messages, never submits applications, never signs in anywhere, and never clicks links in emails. It creates Gmail drafts, updates your sheet, and gives you text.

**LinkedIn is assistive only.** The skill doesn't browse, search or scrape LinkedIn. Automated activity is against LinkedIn's User Agreement and can get your account restricted. Instead, Claude suggests who to look for and drafts notes, and you do the clicking.

**Workday and Oracle HCM are best-effort.** Greenhouse, Ashby and Lever have public job APIs, so those scans are reliable. Workday and Oracle career sites are read through undocumented endpoints in your browser. They can change or block requests at any time, and some company sites can't be read at all. Failures are logged in the Scan Log and reported, not hidden.

**Scheduled tasks can't scan.** They run in the cloud without Chrome. They can check Gmail, make drafts and remind you, but scans happen in a regular chat.

**Content is treated as data.** Job postings, web pages and emails are never followed as instructions. Suspicious emails get flagged.

**Your resume stays honest.** Tailoring only rewords and reorders what's already true. Anything missing goes in a gaps list.

**Your sheet is safe.** The skill never deletes rows or tabs, and it reads before it writes. Dates are written as `=DATE()` formulas, so they work in any sheet locale.

**Grades are a guide.** Sponsorship, years and location are read from posting text with simple rules. Check the posting before you apply.

## Customizing the company pool

The starter list of about 220 boards is in [`seen-not-hired/references/company-pool.md`](seen-not-hired/references/company-pool.md).

- **Just for you:** ask Claude to "add Acme to my scan". It finds the right board and saves it to your Profile tab (Extra boards). To drop one, say "remove Acme from my scan". Nothing in the skill files changes.
- **For everyone:** edit `company-pool.md` and open a pull request (see below).

To find a company's board yourself, try these URLs. If one returns JSON with jobs, you've found it:
- `https://boards-api.greenhouse.io/v1/boards/{name}/jobs`
- `https://api.ashbyhq.com/posting-api/job-board/{name}`
- `https://api.lever.co/v0/postings/{name}?mode=json`

## Repo layout

```
seen-not-hired/                 # repo root
  seen-not-hired/               # the skill (this folder is what gets zipped)
    SKILL.md                    # router: rules, startup, which reference to load
    references/                 # detailed instructions for each task
    dashboard/                  # optional Apps Script dashboard
  build.sh                      # builds seen-not-hired.zip
```

## Contributing

Pull requests are welcome, especially:
- New or fixed boards in `company-pool.md` (please confirm the slug returns jobs)
- Workday tenants or Oracle HCM sites that work for you
- Better Gmail search patterns for application emails
- Fixes when an endpoint changes

Please keep everything in the skill's writing style: plain, conversational, no em dashes. Never add personal details to the skill files. Run `./build.sh` and test the ZIP in the Claude app before opening a PR. If you change `SKILL.md`, keep it under 500 lines.

## License

MIT. See [LICENSE](LICENSE).
