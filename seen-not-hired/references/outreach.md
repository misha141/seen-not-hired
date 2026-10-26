# Outreach: cold emails and LinkedIn notes

You write the words. The user sends them. You create **Gmail drafts only**, and for LinkedIn you produce text for the user to paste themselves.

Before anything, read Profile (Name, Email, Phone, LinkedIn, Tone, Resume facts, Email signature, the limits) and the Contacts tab. For LinkedIn, also read the LinkedIn tab.

## Limits (check before every draft)

| Rule | Default | Profile field |
|---|---|---|
| Emails per company per rolling 7 days | 3 | Max emails per company per week |
| Follow-ups per person | 1 | (fixed) |
| Wait before the follow-up | 5 business days | Follow-up business days |
| New drafts per day | 8 | Daily draft cap |
| LinkedIn notes per company per batch | 2 | LinkedIn notes per company per batch |

Count against the limits like this:

- **Emails per company:** Contacts rows for that company with Date sent or Follow-up sent in the last 7 days. Rows with Status Draft ready count too, because the user is likely to send them.
- **Daily cap:** drafts you made today, from Contacts rows set to Draft ready today and noted in Notes.

Never draft to someone whose status is Bounced, Do not contact or Replied (for Replied, the user takes it from there). Never draft a second email to someone already Sent, unless it's their one follow-up and it's due.

If a limit stops you, say so: "Stopped at 3 for Stripe this week. I'll pick up the other 2 next Tuesday."

## Picking who to email

The order for a batch:
1. Due follow-ups (they're cheap and work well).
2. The lowest Batch number with Status Not sent.
3. Within a batch: Priority High first, then contacts at companies where the user has a fresh application (mention the job ID), then the most recently active.

Skip contacts whose company is in Companies to skip. When cleaning a list, also skip contacts inactive for over a year (see `recruiter-export-cleaning.md`).

## Templates

Pick the template from the Contacts row's Template column. If it's blank, choose:
- Recruiter or University recruiter, and N is 2 or more: **Recruiter pitch**
- Recruiter or University recruiter, and N is under 2 (or a recent grad): **New-grad pitch**
- Engineer, Alum or Hiring manager: **Referral ask**
- Staffing agency: **Staffing pitch**

Fill the placeholders only from Profile and the resume. Keep each email under 120 words. Match Profile > Tone. Write in the first person, as the user.

### Recruiter pitch

**Subject:** `Software Engineer ({N}+ yrs, {top 2-3 skills}) interested in roles at {Company}`

```
Hi {First name},

I'm a software engineer with {N} years of experience, mostly {one-line summary of core work}. I'm interested in {role type} roles at {Company}{, especially {Job title} ({Job ID}) which I just applied to}.

A quick snapshot:
- {Resume fact 1, with its real metric}
- {Resume fact 2}
- {Degree, school, year}
- {Core stack, 4 to 6 items}

Would you be open to a quick chat, or pointing me to the right person on your team? My resume is attached.

Thanks,
{Signature}
```

The user attaches the resume themselves. Tell them to attach it before sending, because drafts made through the connector may not carry attachments.

### New-grad pitch

**Subject:** `Recent {degree} grad ({School}) interested in early career roles at {Company}`

```
Hi {First name},

I just finished my {degree} at {School} and I'm looking at early career software engineering roles at {Company}{, including {Job title} ({Job ID})}.

{One line on their strongest internship or project, with a real metric if there is one.}
{One line on their core stack.}

If you're the right person for new grad hiring, I'd love to share more. If not, could you point me to who is?

Thanks,
{Signature}
```

### Referral ask

**Subject:** `{School or shared hook} {grad or alum} reaching out about software engineering at {Company}`

```
Hi {First name},

{Shared hook in one line, e.g. "I saw you're also a {School} alum" or "I noticed we both worked at {Company}".} I'm a software engineer with {N} years in {short summary}, and I just applied to {Job title} ({Job ID}) at {Company}.

Would you be open to referring me, or sharing what the team is like? Happy to send my resume or anything else that helps.

Thanks either way,
{Signature}
```

If they haven't applied yet, change the ask to "Would you be open to a quick chat about the team?" and suggest they ask for a referral link before applying.

### Staffing pitch

**Subject:** `Software Engineer ({N}+ yrs, {top skills}) open to new roles`

```
Hi {First name},

I'm a software engineer with {N} years in {summary}, open to {Target roles} roles in {Locations or "remote"}.{ Work authorization line, only if Profile > Needs sponsorship = Yes, e.g. "I'm currently on OPT, so I'm looking for W2 roles."}

{Resume fact 1}
{Core stack}

If you have anything that fits, I'd be glad to talk.

Thanks,
{Signature}
```

Include the work authorization line only when the user needs sponsorship and has written a Work authorization note in Profile. Use their wording.

### Follow-up (one per person, 5 business days after the first email or later)

Reply in the same thread if the Gmail connector lets you create a draft on an existing thread. Otherwise make a new draft with subject `Re: {original subject}`.

```
Hi {First name},

Just bumping this in case it got buried. Still very interested in {role type} roles at {Company}{ and the {Job title} opening}. Happy to send anything that would help.

Thanks,
{First name of user}
```

Keep it 2 or 3 sentences. Never send a second follow-up.

## Signature: LinkedIn as plain text

Gmail drafts created through the connector can mangle hyperlinks, especially LinkedIn URLs. Always write the signature as plain text lines, with no Markdown and no HTML links:

```
{Name}
{Phone}
{Email}
linkedin.com/in/{handle}
```

Write the LinkedIn handle exactly as it appears in Profile > LinkedIn, without `https://`. Leave out Phone if Profile > Phone is blank.

## Making the drafts

For each email:
1. Check the limits.
2. Fill the template. Re-read it once for these problems:
   - Any facts not in Profile or the resume.
   - Em dashes and AI-sounding phrases.
   - Over 120 words.
   - A wrong first name or company.
3. Create the Gmail draft as plain text, with To, Subject and Body. No CC or BCC unless the user asks.
4. Update the Contacts row: Status Draft ready, Template, and a Notes entry like "Draft 10/23".

When the batch is done, tell the user how many drafts were made, for whom, and which follow-ups are included. Also remind them to attach their resume where the template mentions it. Then ask them to say "I sent them" when they're done, so you can set Status to Sent and fill in Date sent (the follow-up date fills in by formula).

## Updating after sending

When the user says "I sent the drafts" (all or some):
- Set Status to Sent and Date sent to `=DATE()` for those rows. Make sure the row has the follow-up formula in Follow up on.
- For follow-ups: set Status to Followed up and Follow-up sent to `=DATE()`.
- If unsure which drafts they sent, you can check the Gmail Sent folder for those addresses (read only) and confirm with the user.

---

## LinkedIn (assistive only)

**Never browse, search or scrape LinkedIn with any tool**, including Claude in Chrome. Automated activity breaks LinkedIn's User Agreement and can get the user's account restricted. You help by suggesting who to look for and writing notes. The user does the searching, clicking and sending.

### Who to look for

For a target company, suggest 3 to 5 kinds of people, plus search strings the user can paste into LinkedIn search:

- Engineering managers or tech leads on teams that match their Target roles. Search: `"engineering manager" backend {Company}`
- Engineers who share a hook with the user: same school, same past employer, same city. Search: `{School} software engineer {Company}`
- University or technical recruiters. Search: `{Company} technical recruiter` or `{Company} university recruiter`
- People who posted recently about hiring. Search posts for: `{Company} hiring backend engineer`

Add a row to the LinkedIn tab with Status To find for each kind of person (Name blank, Why them filled in). When the user tells you names, fill those in.

### Writing connection notes

- **Under 300 characters, including spaces.** Count them and put the formula in the Chars column. Aim for 200 to 280.
- Casual and non-technical: years of experience, interest in the company, and a short "about me" from Profile (school, city).
- Open with the shared hook when there is one (same school, same past employer, same city).
- If the user applied to a role there, mention the job ID.
- No links, no attachments, and no ask for a referral in the first note.
- At most 2 notes per company per batch.

Example (under 300 characters):

```
Hi Jordan, fellow {School} alum here. I'm a backend engineer with 3 years in Java and Kafka, based in {City}, and I just applied to the Platform Engineer role (R12345) at {Company}. Would love to connect and hear how you like the team.
```

Write each note into the LinkedIn tab's Note draft column with Status Note drafted. Also give the notes in chat as a numbered list (name, company, note) so they're easy to copy.

When the user says "I sent the notes to A and B", set Status to Request sent and fill in Date contacted. Later updates (Connected, Messaged, Replied, Referral) come from the user. You can suggest a short follow-up message once they've connected, using the same rules (no em dashes, short, specific).

### Referral or chat-app asks

If the user wants a quick referral ask for WhatsApp, Slack or a text message, keep it to 2 sentences unless they ask for more. Include the job ID and link.
