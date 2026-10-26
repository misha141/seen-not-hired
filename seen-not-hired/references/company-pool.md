# Company pool

This is the starter list of companies to scan. It leans toward US tech companies that hire software engineers at the early-career to mid level. You can edit it in two ways:

- **Per user, no file changes:** the user adds boards to Profile > Extra boards (for example `acme:GH, newco:AS`) and removes them with Profile > Removed boards. Always merge these in. The final pool is this file, plus Extra boards, minus Removed boards, minus any company in Companies to skip.
- **For everyone:** edit this file and open a pull request (see the README).

Each entry is a board slug, the part of the URL after the ATS domain. GH means Greenhouse, AS means Ashby and LV means Lever.

## Greenhouse (GH), 135 boards

`https://boards-api.greenhouse.io/v1/boards/{slug}/jobs`

```
abnormalsecurity, affirm, airbnb, airtable, alloy, anthropic, asana, assemblyai, attentive, axon, betterment, billcom, blend, block, braze, brex, buildkite, calendly, calm, carta, carvana, chainguard, checkr, chime, circleci, cloudflare, cockroachlabs, coinbase, coreweave, coursera, cresta, cribl, current, databricks, datadog, descope, dialpad, discord, doordashusa, doximity, dropbox, duolingo, earnin, elastic, epicgames, faire, fastly, figma, figure, fivetran, flatironhealth, flexport, forward, fourkites, galileo, gitlab, gleanwork, godaddy, gomotive, grafanalabs, gusto, highnote, honeycomb, instacart, instawork, intercom, island, justworks, klaviyo, komodohealth, lattice, launchdarkly, lithic, lucidmotors, lyft, masterclass, medium, mercury, missionlane, mixpanel, modernhealth, mongodb, netlify, newrelic, nextdoor, nuro, observeai, okta, omadahealth, oportun, orcasecurity, oscar, pagerduty, payoneer, peloton, pinterest, planetscale, postscript, project44, public, reddit, remote, riotgames, riverai, robinhood, rubrik, salesloft, samsara, scaleai, scopely, seatgeek, sezzle, singlestore, smartsheet, sofi, squarespace, starburst, stitchfix, stripe, sumologic, swordhealth, tailscale, talkspace, toast, togetherai, twilio, udemy, upstart, vercel, verkada, warp, weave, yugabyte, zennioptical, zocdoc
```

## Ashby (AS), 76 boards

`https://api.ashbyhq.com/posting-api/job-board/{slug}`

```
1password, acorns, airbyte, airwallex, amplitude, anyscale, astra, baseten, benchling, clerk, clickhouse, clickup, coder, cognition, cohere, dave, decagon, deepgram, drata, elevenlabs, gorgias, harvey, headway, hebbia-ai, hightouch, imprint, influxdata, iterable, langchain, linear, llamaindex, materialize, materialsecurity, miro, modal, moderntreasury, nerdwallet, notion, nubank, openai, oyster, patreon, perplexity, persona, pinecone, poolside, poshmark, posthog, prefect, quora, ramp, redis, render, replit, retell-ai, sardine, semgrep, sentry, sideshift, sierra, snowflake, snyk, socure, strava, substack, supabase, synthesia, temporal, valon, vanta, weaviate, webflow, workos, writer, zapier, zed
```

## Lever (LV), 10 boards

`https://api.lever.co/v0/postings/{slug}?mode=json`

```
finix, gopuff, lyrahealth, outreach, shieldai, spotify, sysdig, wealthfront, zilliz, zoox
```

## Slug gotchas

- **`riverai` is River AI** (Greenhouse). On Ashby, `river` is River, the Bitcoin company, a different employer. Don't swap them.
- `doordashusa` is DoorDash's US board. `gleanwork` is Glean. `gomotive` is Motive. `billcom` is Bill.com. `zennioptical` is Zenni.
- `hebbia-ai` and `retell-ai` use hyphens on Ashby.
- Ara is only listed on Built In SF, with no public ATS board, so it isn't in the pool.
- Roblox (`roblox:GH`) was left out because it didn't appear to sponsor H-1B when this list was made. Add it back with Extra boards if sponsorship doesn't matter to you, or if that has changed.
- Boards move. If a slug returns 404 or zero jobs several scans in a row, note it in the Scan Log and tell the user. Don't silently drop it.

## Adding a company

When the user asks to add a company:

1. Try Greenhouse, then Ashby, then Lever, with a few slug variants: `name`, `nameai`, `name-ai`, `namehq`, and the name with no spaces or punctuation.
2. A board counts as found when the API returns 200 with a job list. Confirm it's the right company: Greenhouse's `/v1/boards/{slug}` returns a `name`, and for Ashby and Lever, check that a job's URL or description names the company.
3. Add it to Profile > Extra boards as `slug:GH`, `slug:AS` or `slug:LV`, and tell the user what you found.
4. If none of the three work, the company probably uses Workday, Oracle, iCIMS, SmartRecruiters or its own site. Check the careers page domain, and if it's Workday or Oracle HCM, see below.

## Big-company career sites (best-effort, Chrome only)

These large employers don't use the public board APIs. They're scanned through Claude in Chrome with the Workday and Oracle HCM recipes in `scanning.md`. The endpoints are undocumented and can change without notice, so treat them as best-effort. Skip this whole section if Profile > Scan big-company sites is No.

### Workday tenants

| Company | Host | Tenant | Site |
|---|---|---|---|
| Citi | `citi.wd5.myworkdayjobs.com` | citi | 2 |
| Capital One | `capitalone.wd12.myworkdayjobs.com` | capitalone | Capital_One |
| Mastercard | `mastercard.wd1.myworkdayjobs.com` | mastercard | CorporateCareers |
| NVIDIA | `nvidia.wd5.myworkdayjobs.com` | nvidia | NVIDIAExternalCareerSite |
| Adobe | `adobe.wd5.myworkdayjobs.com` | adobe | external_experienced |
| Intel | `intel.wd1.myworkdayjobs.com` | intel | External |
| PayPal | `paypal.wd1.myworkdayjobs.com` | paypal | jobs |
| Workday | `workday.wd5.myworkdayjobs.com` | workday | Workday |
| T-Mobile | `tmobile.wd1.myworkdayjobs.com` | tmobile | External |
| Wells Fargo | `wd1.myworkdaysite.com` | wf | WellsFargoJobs |

Wells Fargo uses the `myworkdaysite.com` form. Its careers page is `https://wd1.myworkdaysite.com/recruiting/wf/WellsFargoJobs`, and the API path is still `/wday/cxs/wf/WellsFargoJobs/jobs` on that host.

### Oracle HCM sites

| Company | Host | Site number |
|---|---|---|
| JPMorgan Chase | `jpmc.fa.oraclecloud.com` | CX_1001 |
| Oracle | `eeho.fa.us2.oraclecloud.com` | CX_45001 |
| Ford | `efds.fa.em5.oraclecloud.com` | CX_1 |

### Slots

Scanning every big-company site at once is slow and more likely to fail, so they're split into four slots. Each scan runs the full board sweep plus one slot. Pick the slot from the current time in the user's timezone (Profile > Timezone) and Profile > Scan slots. The user can also say "run slot 3".

| Slot | Default time | Sites |
|---|---|---|
| 1 | Before 9am | JPMorgan Chase (Oracle), Citi, Capital One, Mastercard (Workday) |
| 2 | 9am to noon | Wells Fargo, Intel, PayPal (Workday), Oracle, Ford (Oracle) |
| 3 | Noon to 3pm | Workday, T-Mobile, plus Capital One and Citi again (Workday) |
| 4 | After 3pm | NVIDIA, Adobe (Workday), plus JPMorgan Chase again (Oracle) |

The repeats are intentional. Those companies post often, and the strongest results come from applying within a day.

### Known unreadable

These didn't work through Chrome when this list was made. Don't try them by default. Tell the user to check them by hand if they care about them: American Express, Salesforce, Fidelity, Walmart, Dell, Autodesk (pages blocked in Chrome), Visa (returns empty results). Rippling, Deel, Retool, Confluent and Decart also couldn't be read through their public boards. Re-test any of them if the user asks.
