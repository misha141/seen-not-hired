# Job scanning

A scan finds roles posted since the last scan, removes ones already in the tracker, grades the rest, and writes them to Job Openings with one Scan Log row.

Every scan is two parts:

1. **Board sweep:** every Greenhouse, Ashby and Lever board in the pool, using their public JSON APIs. These are reliable.
2. **One big-company slot:** a handful of Workday and Oracle HCM career sites. These are **best-effort**: the endpoints are undocumented, and they can change or block requests at any time. Skip this part if Profile > Scan big-company sites is No.

## Requirements

- **Claude in Chrome is required.** The JSON APIs are fetched from inside a browser tab, because cross-origin rules block other ways of reaching them, and Workday and Oracle only answer requests made from their own site.
- **Scheduled tasks can't scan.** They run in the cloud without Chrome, so a scheduled task can only remind the user ("say: run the scan"). The scan itself always happens in a normal chat with Chrome connected.
- **No Chrome?** Say so, then offer one of these:
  - If you have a web fetch tool, you can check a few specific companies the user names (one URL at a time). Don't try the full pool this way.
  - Give the user the links to check by hand: `https://boards.greenhouse.io/{slug}`, `https://jobs.ashbyhq.com/{slug}`, `https://jobs.lever.co/{slug}`.

Before your first Chrome step, load the Chrome tools. Work in a **new tab** so you don't disturb the user's tabs. Never open linkedin.com.

## Step 1: Read the tracker first

1. **Profile.** Read target roles, core and adjacent stack, years, locations, remote preference, sponsorship, companies to skip, salary minimum, Extra boards, Removed boards, timezone and scan slots.
2. **Job Openings.** Read the whole Job link column (L), plus Company (B) and Job ID (D). These make the dedupe set.
3. **Applications.** Read Company (B) and Status (F). You'll use them to warn when the user already has several active applications at one company.
4. **Scan Log.** Find the last Board sweep row and use it to set the time window:
   - Hours since the last sweep, plus 2 hours of buffer, with a minimum of 24 and a maximum of 96.
   - If there's no previous sweep, use 72 hours.
   - The first sweep of the user's day should use at least 30 hours, so overnight postings are covered.

## Step 2: Board sweep (Greenhouse, Ashby, Lever)

### Why it's done this way
- **CORS:** navigate the tab to `https://boards-api.greenhouse.io/v1/boards/stripe` (any valid board) first, and run fetches from that page. Greenhouse, Ashby and Lever all answer from that origin.
- **Timeouts:** one JavaScript call times out at about 45 seconds, and the pool is about 220 boards. So start the sweep in the background (it stores results on `window.__sw`), then poll with short calls until it's done.
- **Output size:** returning a long string from the JS tool can get blocked or cut off. When the sweep is done, render the results into an `<article>` on the page and read them with the page-text tool.

### 2a. Start the sweep

Fill in the settings block from Profile and the pool (`company-pool.md`, plus Extra boards, minus Removed boards and Companies to skip). Then run this as one JavaScript call:

```js
// ---- settings: fill these in ----
const POOL = `stripe:GH, openai:AS, spotify:LV`;          // full pool, slug:ATS
const HOURS = 48;                                          // window from Step 1
const KNOWN = new Set([]);                                 // existing job links, lowercased, optional
const ROLE = /(software|backend|back[- ]end|full[- ]?stack|platform|infrastructure|cloud|java|python|\bapi\b|distributed|\bai\b|\bml\b|llm|machine learning|data)/i;
const ENGINEER = /(engineer|developer|swe\b)/i;
// If Profile > Include internships is Yes, remove the intern part of DROP.
const DROP = /(staff|principal|manager|director|head of|\blead\b|\bvp\b|\bintern(ship)?\b|hardware|asic|fpga|firmware|embedded|silicon|sales engineer|solutions? (engineer|architect)|forward[- ]deployed|customer engineer|support engineer|^front[- ]?end|\bios\b|android|mobile|\bqa\b|test engineer)/i;
const NON_US = /(india|bengaluru|bangalore|hyderabad|pune|canada|toronto|vancouver|montreal|london|united kingdom|\buk\b|ireland|dublin|germany|berlin|munich|france|paris|spain|madrid|portugal|lisbon|netherlands|amsterdam|poland|warsaw|romania|serbia|czech|sweden|denmark|switzerland|zurich|israel|tel aviv|singapore|japan|tokyo|korea|seoul|australia|sydney|melbourne|brazil|são paulo|sao paulo|mexico|argentina|colombia|chile|philippines|emea|apac|latam|europe)/i;
const US = /(united states|\bUSA?\b|U\.S\.|, (AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b|new york|san francisco|seattle|austin|boston|chicago|denver|atlanta|los angeles|bay area)/i;
// ---- end settings ----

const pool = POOL.split(',').map(s => s.trim()).filter(Boolean).map(s => s.split(':'));
const since = Date.now() - HOURS * 3600e3;
window.__sw = { done: false, i: 0, total: pool.length, out: [], err: [] };

const text = (html) => {                       // decode entities, then strip tags
  let t = new DOMParser().parseFromString(html || '', 'text/html').documentElement.textContent;
  if (/<[a-z]/i.test(t)) t = new DOMParser().parseFromString(t, 'text/html').documentElement.textContent;
  return t.replace(/\s+/g, ' ');
};
const signals = (t) => {
  t = t || '';
  const yrs = [...t.matchAll(/(\d{1,2})\s*\+?\s*(?:-|–|to)?\s*(?:\d{1,2})?\s*\+?\s*years?[^.]{0,60}?(experience|industry|professional|software|engineering)/gi)]
    .map(m => +m[1]).filter(n => n > 0 && n < 20);
  const noSpons = /(not|unable to|cannot|can't|won't|will not|does not|do not|no)\s+(\w+\s+){0,4}(sponsor|sponsorship)/i.test(t);
  const spons = noSpons ? 'no' : (/sponsor/i.test(t) ? 'mentions' : '');
  const citizen = /(u\.?s\.? citizen(ship)? (is )?required|must be a u\.?s\.? citizen|security clearance|active clearance|ts\/sci|secret clearance|public trust)/i.test(t);
  const pay = (t.match(/\$\s?\d{2,3}(?:,\d{3}|k)(?:[^$]{0,25}\$\s?\d{2,3}(?:,\d{3}|k))?/i) || [''])[0];
  return { yrs: yrs.length ? Math.min(...yrs) : '', spons, citizen, pay };
};
const keepTitle = (t) => ENGINEER.test(t) && ROLE.test(t) && !DROP.test(t);
const keepLoc = (l) => !l || !NON_US.test(l) || US.test(l);
const add = (o) => { if (!KNOWN.has((o.url || '').toLowerCase())) window.__sw.out.push(o); };

async function gh(slug) {
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`);
  if (!r.ok) throw new Error(`${slug}:GH ${r.status}`);
  const { jobs = [] } = await r.json();
  for (const j of jobs) {
    const posted = Date.parse(j.first_published || j.updated_at);
    const loc = j.location?.name || '';
    if (posted < since || !keepTitle(j.title) || !keepLoc(loc)) continue;
    const d = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${j.id}`).then(x => x.json()).catch(() => ({}));
    add({ co: slug, ats: 'GH', title: j.title, loc, posted: new Date(posted).toISOString().slice(0, 10), id: String(j.id), url: j.absolute_url, ...signals(text(d.content)) });
  }
}
async function ashby(slug) {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`);
  if (!r.ok) throw new Error(`${slug}:AS ${r.status}`);
  const { jobs = [] } = await r.json();
  for (const j of jobs) {
    const posted = Date.parse(j.publishedAt);
    const loc = [j.location, ...(j.secondaryLocations || []).map(s => s.location)].filter(Boolean).join('; ') + (j.isRemote ? ' (remote)' : '');
    if (j.isListed === false || posted < since || !keepTitle(j.title) || !keepLoc(loc)) continue;
    const s = signals(j.descriptionPlain);
    if (!s.pay && j.compensation?.compensationTierSummary) s.pay = j.compensation.compensationTierSummary;
    add({ co: slug, ats: 'AS', title: j.title, loc, posted: new Date(posted).toISOString().slice(0, 10), id: j.id, url: j.jobUrl, ...s });
  }
}
async function lever(slug) {
  const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  if (!r.ok) throw new Error(`${slug}:LV ${r.status}`);
  const jobs = await r.json();
  for (const j of jobs) {
    const posted = j.createdAt;                          // milliseconds
    const loc = [j.categories?.location, ...(j.categories?.allLocations || [])].filter(Boolean).join('; ');
    if (posted < since || !keepTitle(j.text) || !keepLoc(loc)) continue;
    const body = [j.descriptionPlain, ...(j.lists || []).map(l => text(l.content)), j.additionalPlain].join(' ');
    add({ co: slug, ats: 'LV', title: j.text, loc, posted: new Date(posted).toISOString().slice(0, 10), id: j.id, url: j.hostedUrl, ...signals(body) });
  }
}
const run = { GH: gh, AS: ashby, LV: lever };

(async () => {
  for (let i = 0; i < pool.length; i += 20) {
    await Promise.all(pool.slice(i, i + 20).map(([slug, ats]) =>
      (run[ats] ? run[ats](slug) : Promise.reject(new Error(`${slug}: unknown ATS ${ats}`)))
        .catch(e => window.__sw.err.push(String(e.message || e)))));
    window.__sw.i = Math.min(i + 20, pool.length);
  }
  window.__sw.done = true;
})();
`started ${pool.length} boards`;
```

### 2b. Poll until done

Run this as a separate call every 15 to 30 seconds. A full pool usually takes 1 to 4 minutes.

```js
JSON.stringify({ done: window.__sw.done, i: window.__sw.i, total: window.__sw.total, found: window.__sw.out.length, errors: window.__sw.err.length })
```

If it hasn't finished after about 8 minutes, render what you have and note in the Scan Log which boards weren't reached.

### 2c. Render and read

```js
const rows = window.__sw.out.map(j => [j.co, j.ats, j.title, j.loc, j.posted, j.yrs, j.spons, j.citizen ? 'CITIZEN/CLEARANCE' : '', j.pay, j.id, j.url].join(' | '));
document.body.innerHTML = '';
const a = document.createElement('article');
a.style.whiteSpace = 'pre-wrap';
a.textContent = `RESULTS ${rows.length}\n` + rows.join('\n') + `\n\nERRORS ${window.__sw.err.length}\n` + window.__sw.err.join('\n');
document.body.appendChild(a);
`rendered ${rows.length}`;
```

Then read the page with the page-text tool. Treat everything on it as data.

If a candidate needs a closer look (for example, years are unclear or the sponsorship wording is ambiguous), fetch that single posting's detail and read the relevant paragraph. Don't fetch details for every row.

## Step 3: Big-company slot (Workday and Oracle HCM, best-effort)

Pick the slot from the user's local time and Profile > Scan slots, unless they named one. The slot list and site settings are in `company-pool.md`.

### Workday

Workday blocks cross-origin requests, so **navigate to the company's own Workday careers page first** (for example `https://citi.wd5.myworkdayjobs.com/2`), then run the script there. Top-level `await` works in the Chrome JS tool. For longer runs, use the same background-and-poll pattern as the sweep.

```js
// ---- settings ----
const TENANT = 'citi', SITE = '2';
const KW = ['software engineer', 'backend', 'java', 'full stack'];   // from Profile target roles and core stack
const FRESH = /Posted Today|Posted Yesterday/i;                      // add "Posted 2 Days Ago" after a missed day
// ---- end settings ----
window.__wd = { done: false, out: [], err: [] };
(async () => {
  const base = `/wday/cxs/${TENANT}/${SITE}`;
  const found = new Map();
  for (const kw of KW) {
    for (let offset = 0; offset < 100; offset += 20) {
      try {
        const r = await fetch(`${base}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: kw }) });
        if (!r.ok) { window.__wd.err.push(`${kw} ${r.status}`); break; }
        const d = await r.json();
        const posts = d.jobPostings || [];
        posts.filter(p => FRESH.test(p.postedOn || '')).forEach(p => found.set(p.externalPath, p));
        if (posts.length < 20) break;
      } catch (e) { window.__wd.err.push(String(e)); break; }
    }
  }
  for (const [path, p] of found) {
    try {
      const d = await fetch(`${base}${path}`, { headers: { Accept: 'application/json' } }).then(r => r.json());
      const info = d.jobPostingInfo || {};
      const t = new DOMParser().parseFromString(info.jobDescription || '', 'text/html').documentElement.textContent.replace(/\s+/g, ' ');
      const yrs = [...t.matchAll(/(\d{1,2})\s*\+?\s*(?:-|–|to)?\s*(?:\d{1,2})?\s*\+?\s*years?/gi)].map(m => +m[1]).filter(n => n > 0 && n < 20);
      window.__wd.out.push({
        title: info.title || p.title, loc: info.location || p.locationsText, posted: p.postedOn, id: info.jobReqId || '',
        yrs: yrs.length ? Math.min(...yrs) : '',
        spons: /(not|unable to|cannot|will not|does not|no)\s+(\w+\s+){0,4}sponsor/i.test(t) ? 'no' : (/sponsor/i.test(t) ? 'mentions' : ''),
        citizen: /(u\.?s\.? citizen|clearance|public trust)/i.test(t),
        pay: (t.match(/\$\s?\d{2,3}(?:,\d{3}|k)(?:[^$]{0,25}\$\s?\d{2,3}(?:,\d{3}|k))?/i) || [''])[0],
        url: info.externalUrl || (location.origin + `/${SITE}` + path)
      });
    } catch (e) { window.__wd.err.push(`${path} ${e}`); }
  }
  window.__wd.done = true;
})();
'started';
```

Poll `JSON.stringify({done: __wd.done, n: __wd.out.length, err: __wd.err})`. When it's done, render `__wd.out` into an `<article>` the same way as the sweep and read the page text.

Notes:
- Wells Fargo uses `https://wd1.myworkdaysite.com/recruiting/wf/WellsFargoJobs`. Navigate there, then use `TENANT='wf'`, `SITE='WellsFargoJobs'`.
- `postedOn` is text like "Posted Today", "Posted Yesterday" or "Posted 3 Days Ago", not a date. Convert it to a real date yourself when you write the Posted column.
- The detail description is HTML. Always decode it with DOMParser before running regex on it.
- If the list call returns 400 or 422, the site name is probably wrong. Open the careers page and check the URL path after the host.
- If a site shows a sign-in page or a bot check, stop for that site and log it. Never sign in.

### Oracle HCM

**Navigate to the company's candidate site first** (for example `https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001`), then run:

```js
const SITE = 'CX_1001';
const KW = ['software engineer', 'java', 'backend', 'full stack'];
const HOURS = 48;
window.__or = { done: false, out: [], err: [] };
(async () => {
  const since = Date.now() - HOURS * 3600e3;
  const found = new Map();
  for (const kw of KW) {
    // expand and facetsList are required, or the list comes back empty
    const u = `/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.secondaryLocations` +
      `&finder=findReqs;siteNumber=${SITE},facetsList=LOCATIONS,limit=50,keyword=%22${encodeURIComponent(kw)}%22,sortBy=POSTING_DATES_DESC`;
    try {
      const d = await fetch(u, { headers: { Accept: 'application/json' } }).then(r => r.json());
      for (const j of d.items?.[0]?.requisitionList || []) if (Date.parse(j.PostedDate) >= since) found.set(j.Id, j);
    } catch (e) { window.__or.err.push(`${kw} ${e}`); }
  }
  for (const [id, j] of found) {
    try {
      const u = `/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;Id=%22${id}%22,siteNumber=${SITE}`;
      const d = (await fetch(u, { headers: { Accept: 'application/json' } }).then(r => r.json())).items?.[0] || {};
      const html = [d.ExternalDescriptionStr, d.ExternalQualificationsStr, d.ExternalResponsibilitiesStr].join(' ');
      const t = new DOMParser().parseFromString(html, 'text/html').documentElement.textContent.replace(/\s+/g, ' ');
      const yrs = [...t.matchAll(/(\d{1,2})\s*\+?\s*(?:-|–|to)?\s*(?:\d{1,2})?\s*\+?\s*years?/gi)].map(m => +m[1]).filter(n => n > 0 && n < 20);
      window.__or.out.push({
        title: j.Title, loc: [j.PrimaryLocation, ...(j.secondaryLocations || []).map(s => s.Name)].filter(Boolean).join('; '),
        posted: j.PostedDate, id, yrs: yrs.length ? Math.min(...yrs) : '',
        spons: /(not|unable to|cannot|will not|does not|no)\s+(\w+\s+){0,4}(sponsor|sponsorship)/i.test(t) ? 'no' : (/sponsor/i.test(t) ? 'mentions' : ''),
        citizen: /(u\.?s\.? citizen|clearance|public trust)/i.test(t),
        url: `https://${location.host}/hcmUI/CandidateExperience/en/sites/${SITE}/job/${id}`
      });
    } catch (e) { window.__or.err.push(`${id} ${e}`); }
  }
  window.__or.done = true;
})();
'started';
```

Poll, render and read the same way.

Notes:
- Ford's postings each state "Visa sponsorship is available" or "is not available", which makes the sponsorship check reliable.
- JPMorgan Chase posts a lot. Expect many results and lean on the title filter.

### When a site fails
Log it in the Scan Log Errors column with a few words ("Capital One: 403 after 2 tries"). Move on to the next site. Don't retry more than once per scan.

## Step 4: Dedupe and grade

1. Normalize every result link (lowercase host, no tracking query parameters, no trailing slash). Drop anything whose link, or Company + Job ID, is already in Job Openings.
2. Drop companies in Profile > Companies to skip, including subsidiaries the user named.
3. Grade each remaining role with `grading.md`.
4. Count how many active applications the user already has at each company (Applications rows not Rejected or Withdrawn). If it's 3 or more, add a warning to Watch out for.

## Step 5: Write to the sheet

1. **Job Openings:** append Strong, Good and Stretch rows with Status New. Also append Skip rows for roles that passed the title and location filters but failed on years, sponsorship or citizenship, with Status Skip and the reason in Watch out for. Then the next scan won't re-grade them, and the user can see why they were skipped. Don't write rows that failed the title filter.
   - Write the Posted date with `=DATE()`.
   - Map ATS codes to Found on: GH is Greenhouse, AS is Ashby, LV is Lever.
   - Order the rows Strong, Good, Stretch, Skip, newest first within each grade.
   - Fill in Your contact there if Contacts or LinkedIn has someone at that company.
   - After appending, copy the dropdowns and formats onto the new rows (`tracker-schema.md`).
2. **Scan Log:** append one row per part (Board sweep, then Workday and/or Oracle HCM) with the counts and errors.

## Step 6: Report

Keep it tight, and lead with the best roles:

1. **Strong** roles, one short block each: company, role, location, years asked, pay if shown, sponsorship note (only if Profile says sponsorship is needed), contact there if any, link, and one line on why it fits.
2. **Good** and **Stretch:** one line each (company, role, location, link).
3. **Nothing fitting:** one line per source group explaining why (for example "Workday sites: 14 new postings, all senior or India-based").
4. **Sheet:** "Added 6 rows to Job Openings and 2 to Scan Log."
5. **Heads up:**
   - When the user already has several active applications at a company, suggest sending the job ID to a contact there for a referral instead of applying cold again.
   - List sites that failed.

If the user needs sponsorship and a startup is graded Strong or Stretch, suggest a quick look at that company's H-1B history on a public visa-data site (for example myvisajobs.com). Don't browse there yourself unless they ask.

## Application timing tips to share when relevant

- Applying within 24 to 48 hours of posting tends to get noticeably more interviews. Company career sites usually post before aggregators, which can lag by 12 to 96 hours.
- If there's a contact at the company, get a referral link before applying. If they've already applied, send the contact the job ID.
- Don't apply to too many roles at one company at once. Two or three is a good ceiling.
- Some companies send one online assessment that covers several applications (Airbnb's CodeSignal, for example). In that case it can help to apply to the relevant roles before taking the OA.
