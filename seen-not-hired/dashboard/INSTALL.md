# Installing the dashboard

The dashboard is one web page that shows your tracker: today's to-do list, your stats, your pipeline, deadlines, follow-ups and the latest scan results. It works on your phone too.

It's **read-only**. It never changes your sheet. Claude does all the updating.

It takes about 5 minutes, and you don't need to know how to code. You'll copy two files into your sheet, then publish them as a private web page that only you can open.

## Before you start

- Your **Seen Not Hired Tracker** sheet exists. Claude creates it during setup.
- You have the two files from this folder: `Code.gs` and `Index.html`. Claude can paste their contents for you, or you can copy them from GitHub.

## Step 1: Open Apps Script from your sheet

1. Open your **Seen Not Hired Tracker** sheet in Google Sheets.
2. In the menu, click **Extensions > Apps Script**.
3. A new tab opens with a code editor and a file called `Code.gs`.

This matters: open Apps Script **from inside the tracker sheet**. That's how the dashboard knows which sheet to read.

## Step 2: Paste Code.gs

1. Click inside the editor and select everything (Ctrl+A, or Cmd+A on a Mac).
2. Delete it.
3. Paste the full contents of `Code.gs`.
4. Click the **Save** icon (the floppy disk), or press Ctrl+S / Cmd+S.

## Step 3: Add Index.html

1. In the left sidebar, next to **Files**, click the **+** button and choose **HTML**.
2. Name it exactly `Index`. Apps Script adds `.html` for you, so don't type it.
3. Select everything in the new file and delete it.
4. Paste the full contents of `Index.html`.
5. Save.

You should now have two files on the left: `Code.gs` and `Index.html`.

## Step 4: Deploy it as a web app

1. Click the blue **Deploy** button (top right), then **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** anything, like `dashboard`
   - **Execute as:** **Me**
   - **Who has access:** **Only myself**
4. Click **Deploy**.

## Step 5: Allow access (first time only)

Google asks you to authorize the script, because it reads your sheet.

1. Click **Authorize access** and pick your Google account.
2. You may see **"Google hasn't verified this app."** That's normal for scripts you paste in yourself. Click **Advanced**, then **Go to (your project name) (unsafe)**.
3. Click **Allow**.

The script only asks to see and manage spreadsheets it's attached to (Google words the permission broadly). The code only reads. You can check: there are no `setValue` or `appendRow` calls anywhere in `Code.gs`.

## Step 6: Open your dashboard

1. After deploying, you'll see a **Web app URL** ending in `/exec`. Copy it.
2. Open it in your browser. Bookmark it, or add it to your phone's home screen. On iPhone, use Share > Add to Home Screen. On Android, use the browser's menu > Add to Home screen.
3. Click **Refresh** on the page any time to reload the latest data.

Only you can open the link, and you need to be signed in to the same Google account.

## Updating the dashboard later

If a new version of `Code.gs` or `Index.html` comes out:

1. Paste the new code over the old files and save.
2. Click **Deploy > Manage deployments**, select your deployment and click the pencil (edit) icon.
3. Under **Version**, pick **New version**, then click **Deploy**.

Your link stays the same.

## Troubleshooting

- **"Missing tabs" message:** the script isn't attached to your tracker. Open Apps Script from the tracker sheet (Step 1) and paste the files there.
- **"Couldn't read the sheet":** open the Apps Script editor, choose `getDashboardData` from the function dropdown, and click **Run**. Any error shows at the bottom. Often it just needs to be authorized again.
- **Blank chart:** the chart library couldn't load (some school or work networks block it). The page still shows the counts as a plain list.
- **Old data:** the page shows the sheet as it is right now. If something looks stale, ask Claude to check your email or rebuild today's list, then click Refresh.
- **"Sorry, unable to open the file at this time":** sign in to the Google account that owns the sheet, or open the link in a window where only that account is signed in.
