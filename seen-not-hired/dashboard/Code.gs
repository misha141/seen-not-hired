/**
 * Seen Not Hired dashboard (read-only).
 *
 * Paste this into Extensions > Apps Script of your "Seen Not Hired Tracker"
 * sheet, along with Index.html. See INSTALL.md.
 *
 * This script only reads the sheet. It never writes, so it can't break
 * anything. Claude keeps the sheet up to date.
 */

var TABS = {
  today: 'Today',
  openings: 'Job Openings',
  apps: 'Applications',
  contacts: 'Contacts',
  linkedin: 'LinkedIn',
  scanLog: 'Scan Log'
};

var PIPELINE = ['Applied', 'Action needed', 'Assessment', 'Recruiter screen', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];
var RESPONDED = ['Action needed', 'Assessment', 'Recruiter screen', 'Interviewing', 'Offer', 'Rejected'];
var CLOSED = ['Rejected', 'Withdrawn'];
var FIT_ORDER = { Strong: 0, Good: 1, Stretch: 2, Skip: 3 };

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Seen Not Hired')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Called from the page. Returns everything the dashboard shows. */
function getDashboardData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var in14 = Utilities.formatDate(new Date(Date.now() + 14 * 864e5), tz, 'yyyy-MM-dd');
  var in3 = Utilities.formatDate(new Date(Date.now() + 3 * 864e5), tz, 'yyyy-MM-dd');

  var today = readTab_(ss, TABS.today, tz);
  var openings = readTab_(ss, TABS.openings, tz);
  var apps = readTab_(ss, TABS.apps, tz).filter(function (r) { return r['Company']; });
  var contacts = readTab_(ss, TABS.contacts, tz);
  var scanLog = readTab_(ss, TABS.scanLog, tz);

  // Stat cards
  var count = function (status) { return apps.filter(function (r) { return r['Status'] === status; }).length; };
  var responded = apps.filter(function (r) { return RESPONDED.indexOf(r['Status']) >= 0; }).length;
  var sent = contacts.filter(function (r) { return ['Sent', 'Followed up', 'Replied', 'Bounced'].indexOf(r['Status']) >= 0; }).length;
  var replied = contacts.filter(function (r) { return r['Status'] === 'Replied'; }).length;
  var stats = {
    applied: apps.length,
    oasPending: count('Assessment'),
    interviews: count('Recruiter screen') + count('Interviewing'),
    offers: count('Offer'),
    rejections: count('Rejected'),
    responseRate: apps.length ? Math.round((responded / apps.length) * 100) : null,
    emailsSent: sent,
    emailReplies: replied
  };

  // Pipeline by status
  var pipeline = PIPELINE.map(function (s) { return { status: s, count: count(s) }; });

  // Upcoming deadlines: open applications with a deadline that's overdue or within 14 days
  var deadlines = apps
    .filter(function (r) { return r['Deadline'] && CLOSED.indexOf(r['Status']) < 0 && r['Deadline'] <= in14; })
    .sort(function (a, b) { return a['Deadline'] < b['Deadline'] ? -1 : 1; })
    .slice(0, 12)
    .map(function (r) {
      return { company: r['Company'], role: r['Role'], status: r['Status'], next: r['Next step'], due: r['Deadline'], overdue: r['Deadline'] < todayStr, link: r['Link'] };
    });

  // Follow-ups due now or in the next 3 days
  var followUps = contacts
    .filter(function (r) { return r['Status'] === 'Sent' && !r['Follow-up sent'] && r['Follow up on'] && r['Follow up on'] <= in3; })
    .sort(function (a, b) { return a['Follow up on'] < b['Follow up on'] ? -1 : 1; })
    .slice(0, 15)
    .map(function (r) {
      return { name: r['Name'], company: r['Company'], due: r['Follow up on'], overdue: r['Follow up on'] < todayStr, isDue: r['Follow up on'] <= todayStr };
    });

  // Latest scan: newest Scan Log rows plus new Job Openings
  var scans = scanLog
    .filter(function (r) { return ['Board sweep', 'Workday', 'Oracle HCM'].indexOf(r['Type']) >= 0; })
    .sort(function (a, b) { return String(a['Run at']) < String(b['Run at']) ? 1 : -1; })
    .slice(0, 3);
  var newRoles = openings
    .filter(function (r) { return ['New', 'To apply', 'Resume tailored'].indexOf(r['Status']) >= 0 && r['Fit'] && r['Fit'] !== 'Skip'; })
    .sort(function (a, b) {
      var f = (FIT_ORDER[a['Fit']] || 9) - (FIT_ORDER[b['Fit']] || 9);
      if (f !== 0) return f;
      return String(a['Posted'] || '') < String(b['Posted'] || '') ? 1 : -1;
    })
    .slice(0, 15)
    .map(function (r) {
      return { fit: r['Fit'], company: r['Company'], role: r['Role'], location: r['Location'], posted: r['Posted'], why: r['Why it fits'], link: r['Job link'], status: r['Status'] };
    });

  // Today tab, plus its build time from K1
  var builtAt = '';
  var todaySheet = ss.getSheetByName(TABS.today);
  if (todaySheet) builtAt = fmt_(todaySheet.getRange('K1').getValue(), tz);

  return {
    generatedAt: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm'),
    today: todayStr,
    todayBuiltAt: builtAt,
    todo: today.map(function (r) {
      return { section: r['Section'], task: r['To do'], company: r['Company'], who: r['Role or person'], due: r['Due'], link: r['Link'], notes: r['Why or notes'] };
    }),
    stats: stats,
    pipeline: pipeline,
    deadlines: deadlines,
    followUps: followUps,
    scans: scans.map(function (r) {
      return { at: r['Run at'], type: r['Type'], slot: r['Slot'], seen: r['Postings seen'], fresh: r['New'], strong: r['Strong'], good: r['Good'], stretch: r['Stretch'], errors: r['Errors / unreadable'] };
    }),
    newRoles: newRoles,
    missingTabs: Object.keys(TABS).map(function (k) { return TABS[k]; }).filter(function (n) { return !ss.getSheetByName(n); })
  };
}

/**
 * Reads a tab into objects keyed by header text. It stops at the first blank
 * header, so notes to the right of the table (like Today!J1:K1) are ignored.
 */
function readTab_(ss, name, tz) {
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = [];
  for (var i = 0; i < values[0].length; i++) {
    var h = String(values[0][i]).trim();
    if (!h) break;
    headers.push(h);
  }
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    var any = false;
    for (var c = 0; c < headers.length; c++) {
      var v = fmt_(row[c], tz);
      if (v !== '') any = true;
      obj[headers[c]] = v;
    }
    if (any) rows.push(obj);
  }
  return rows;
}

/** Dates become 'yyyy-MM-dd' (or with time, if the cell has one) so they sort as text and can be sent to the page. */
function fmt_(v, tz) {
  if (v instanceof Date) {
    var hasTime = Utilities.formatDate(v, tz, 'HH:mm') !== '00:00';
    return Utilities.formatDate(v, tz, hasTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd');
  }
  if (v === null || v === undefined) return '';
  return typeof v === 'number' || typeof v === 'boolean' ? v : String(v);
}
