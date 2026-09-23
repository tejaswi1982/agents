/* ============================================================================
 * Dental Enquiry Recovery Check, V1 (Lovable-style UI)
 * Static, offline, no backend. Portfolio preview: fictional sample data, in-memory only.
 *
 * The data model and all business logic (metrics, report, leak detection,
 * sample data, status transitions, export/import/reset, clinic lock) are
 * preserved. Only the presentation/navigation layer is simplified.
 *
 * Privacy: operational enquiry tracker, NOT medical software. No medical
 * records, diagnosis or treatment plans. Nothing is auto-sent.
 * ==========================================================================*/

(function () {
  "use strict";

  var STORAGE_KEY = "derc_v1";
  var DEFAULT_CLINIC_NAME = "VIBGYOR Pediatric & Family Dental Care";

  // Internal values (unchanged, report/sample logic depends on these).
  var SOURCES = ["Call", "WhatsApp", "Website Form", "Google", "Walk-in", "Referral", "Instagram", "Other"];
  var TYPES = [
    "Tooth pain", "Implant", "Braces / Aligners", "Cleaning / Scaling", "Price / Cost",
    "Child dental visit", "Cosmetic / Smile", "Recall / Old patient", "Reschedule / Cancel", "Other"
  ];
  var STATUSES = ["New", "Replied", "Interested", "Booked", "Confirmed", "Visited", "No-show", "Rescheduled", "Follow-up needed", "Closed"];
  var HIGH_VALUE_TYPES = ["Implant", "Braces / Aligners", "Cosmetic / Smile"];

  // Simplified dropdown options: [internal value, display label].
  var SOURCE_OPTIONS = [
    ["Call", "Call"], ["WhatsApp", "WhatsApp"], ["Website Form", "Website"], ["Google", "Google"],
    ["Walk-in", "Walk-in"], ["Referral", "Referral"], ["Instagram", "Instagram"], ["Other", "Other"]
  ];
  var TYPE_OPTIONS = [
    ["Tooth pain", "Tooth pain"], ["Child dental visit", "Child visit"], ["Cleaning / Scaling", "Cleaning"],
    ["Braces / Aligners", "Braces"], ["Implant", "Implant"], ["Price / Cost", "Price question"],
    ["Cosmetic / Smile", "Smile"], ["Other", "Other"]
  ];
  var STATUS_OPTIONS = [
    ["New", "New"], ["Replied", "Replied"], ["Booked", "Booked"],
    ["Follow-up needed", "Follow-up needed"], ["No-show", "No-show"], ["Closed", "Closed"]
  ];

  var SAFE_REPLIES = [
    { key: "general", title: "General appointment", text: "Hi, thank you for reaching out. We'd be happy to help you with an appointment. Would morning or evening work better for you?" },
    { key: "price", title: "Price / cost enquiry", text: "Treatment cost can vary after examination. We can help you book a consultation so the doctor can check and guide you properly. Would morning or evening work better?" },
    { key: "tooth_pain", title: "Tooth pain", text: "Sorry to hear about the discomfort. The doctor would need to examine the tooth before advising the right option. Would you like us to find you an early appointment slot?" },
    { key: "child", title: "Child dental visit", text: "We'd be glad to plan a comfortable visit for your child. Would a morning or evening slot work better for you?" },
    { key: "implant", title: "Implant enquiry", text: "Implant options depend on a clinical assessment. We can help you book a consultation with the doctor to discuss what suits your case. When works for you?" },
    { key: "braces", title: "Braces / aligners", text: "For braces or aligner options, the doctor can guide you after checking alignment and suitability. Would you like us to arrange a consultation?" },
    { key: "cleaning", title: "Cleaning / scaling", text: "Happy to help you book a cleaning appointment. Would a weekday or weekend slot suit you better?" },
    { key: "no_show", title: "No-show, reschedule", text: "Hi, we missed you today, no problem at all. Would you like help picking a new time this week?" },
    { key: "recall", title: "Recall / old patient", text: "Hi, a gentle reminder from the clinic, if it has been a while since your last visit, we can help you schedule a convenient check-up. Would you like available slots?" },
    { key: "emergency", title: "Emergency / severe symptoms", urgent: true, text: "If you are in severe pain, swelling, bleeding or have a post-treatment concern, please call the clinic directly so the team can guide you on the earliest available visit." }
  ];

  var FOLLOWUP_LINE_BY_TYPE = {
    "Price / Cost": "A short consultation is the best way to get an accurate estimate, happy to arrange one whenever convenient.",
    "Implant": "The doctor can assess and explain the implant options in a consultation. Would you like us to suggest slots?",
    "Braces / Aligners": "A quick alignment consultation is the best first step. Would a weekday or weekend suit you?",
    "Tooth pain": "If the discomfort is continuing, we can try to arrange an earlier slot for you. Would that help?",
    "Cosmetic / Smile": "We'd be happy to arrange a consultation to talk through the options, no pressure at all."
  };
  var DEFAULT_FOLLOWUP_LINE = "Just checking in, would you like us to help you pick a convenient appointment slot?";

  // -------------------------------------------------------------------------
  // State + persistence
  // -------------------------------------------------------------------------
  var state = blankState();
  var forceSetupScreen = false;

  function blankState() { return { setup: null, enquiries: [], recalls: [] }; }
  function load() { state = buildSample(); }
  function save() { /* Showcase copy: changes are deliberately not persisted. */ }

  function configuredClinicName() {
    try { var clinicParam = (new URLSearchParams(window.location.search).get("clinic") || "").trim(); return clinicParam || DEFAULT_CLINIC_NAME; }
    catch (e) { return DEFAULT_CLINIC_NAME; }
  }
  function launchedWithClinicParam() {
    try { return new URLSearchParams(window.location.search).has("clinic"); } catch (e) { return false; }
  }
  function enforceClinicName() {
    var clinicName = configuredClinicName();
    if ($("#setup-clinic")) { $("#setup-clinic").value = clinicName; $("#setup-clinic").readOnly = true; $("#setup-clinic").setAttribute("aria-readonly", "true"); }
    if (state.setup && state.setup.clinicName !== clinicName) { state.setup.clinicName = clinicName; save(); }
    return clinicName;
  }
  function prepareSetupScreen(resetDefaults) {
    enforceClinicName();
    if ($("#setup-start") && (resetDefaults || !$("#setup-start").value)) $("#setup-start").value = todayStr();
    if ($("#setup-sample")) $("#setup-sample").checked = false;
  }

  function uid() { return "e" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  // -------------------------------------------------------------------------
  // Date helpers
  // -------------------------------------------------------------------------
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dateOnly(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayStr() { return dateOnly(new Date()); }
  function parse(v) { return v ? new Date(v) : null; }
  function fmtTime(v) { var d = parse(v); if (!d || isNaN(d)) return ""; return d.toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  function greetingText() { var h = new Date().getHours(); return h < 12 ? "Good morning" : (h < 17 ? "Good afternoon" : "Good evening"); }

  // -------------------------------------------------------------------------
  // DOM helpers
  // -------------------------------------------------------------------------
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function on(sel, ev, fn) { var n = $(sel); if (n) n.addEventListener(ev, fn); }
  function fillSelect(sel, pairs) { if (!sel) return; sel.innerHTML = ""; pairs.forEach(function (p) { var op = el("option"); op.value = p[0]; op.textContent = p[1]; sel.appendChild(op); }); }

  function statusClass(status) { return "s-" + (status || "").toLowerCase().replace(/[^a-z]/g, ""); }

  // -------------------------------------------------------------------------
  // Metrics (calculation preserved)
  // -------------------------------------------------------------------------
  function metrics() {
    var t = todayStr();
    var m = { today: 0, pending: 0, dueToday: 0, booked: 0, noshow: 0, recalls: 0 };
    state.enquiries.forEach(function (e) {
      if (e.receivedAt && dateOnly(new Date(e.receivedAt)) === t) m.today++;
      if (e.status === "New") m.pending++;
      if (e.followUpNeeded && e.status !== "Closed" && e.nextFollowUp && e.nextFollowUp <= t) m.dueToday++;
      if (e.status === "Booked" || e.status === "Confirmed") m.booked++;
      if (e.status === "No-show") m.noshow++;
    });
    m.recalls = state.recalls.filter(function (r) { return r.status !== "Closed"; }).length;
    return m;
  }

  function metricCard(num, lbl, cls) {
    var d = el("div", "metric " + cls);
    d.appendChild(el("div", "num", String(num)));
    d.appendChild(el("div", "lbl", esc(lbl)));
    return d;
  }

  function renderMetrics() {
    var grid = $("#metric-grid"); if (!grid) return;
    var m = metrics();
    grid.innerHTML = "";
    grid.appendChild(metricCard(m.today, "Logged today", "m-mint"));
    grid.appendChild(metricCard(m.pending, "Need reply", "m-yellow"));
    grid.appendChild(metricCard(m.dueToday, "Follow-up due", "m-blue"));
    grid.appendChild(metricCard(m.booked, "Booked", "m-mint"));
    grid.appendChild(metricCard(m.noshow, "No-shows", "m-white"));
  }

  // -------------------------------------------------------------------------
  // Enquiry card
  // -------------------------------------------------------------------------
  function enquiryCard(e, opts) {
    opts = opts || {};
    var c = el("div", "enquiry-card " + statusClass(e.status));
    var top = el("div", "top");
    top.appendChild(el("span", "type", esc(e.type) + (e.label ? " · " + esc(e.label) : "")));
    top.appendChild(el("span", "pill", esc(e.status)));
    c.appendChild(top);
    var meta = e.source + " · " + fmtTime(e.receivedAt);
    if (e.nextFollowUp) meta += " · follow-up " + e.nextFollowUp;
    c.appendChild(el("div", "meta", esc(meta)));
    if (e.notes) c.appendChild(el("div", "note", esc(e.notes)));
    if (opts.draft) c.appendChild(el("div", "draft", esc(opts.draft)));

    var actions = el("div", "card-actions");
    function mini(label, fn, danger) { var b = el("button", "mini" + (danger ? " danger" : ""), esc(label)); b.addEventListener("click", fn); actions.appendChild(b); }
    if (opts.buttons !== false) {
      mini("Replied", function () { setStatus(e.id, "Replied"); });
      mini("Booked", function () { setStatus(e.id, "Booked"); });
      mini("Follow-up", function () { markFollowup(e.id); });
      mini("No-show", function () { setStatus(e.id, "No-show"); });
      mini("Edit", function () { openEnquiry(e.id); });
      mini("Close", function () { setStatus(e.id, "Closed"); }, true);
    }
    if (opts.extraButtons) opts.extraButtons(mini);
    c.appendChild(actions);
    return c;
  }

  function renderTodayList() {
    var list = $("#today-list"); if (!list) return;
    list.innerHTML = "";
    var t = todayStr();
    var items = state.enquiries.filter(function (e) { return e.receivedAt && dateOnly(new Date(e.receivedAt)) === t; });
    if (!items.length) {
      list.appendChild(el("div", "empty", "<strong>No enquiries added yet.</strong>Tap “Add enquiry” when a call, WhatsApp, form or walk-in comes in."));
      return;
    }
    items.sort(function (a, b) { return (b.receivedAt || "").localeCompare(a.receivedAt || ""); });
    items.forEach(function (e) { list.appendChild(enquiryCard(e)); });
  }

  // -------------------------------------------------------------------------
  // Follow-up queue
  // -------------------------------------------------------------------------
  function followupLine(e) { return FOLLOWUP_LINE_BY_TYPE[e.type] || DEFAULT_FOLLOWUP_LINE; }

  function renderFollowups() {
    var list = $("#followup-list"); if (!list) return;
    list.innerHTML = "";
    var t = todayStr();
    var due = state.enquiries.filter(function (e) { return e.followUpNeeded && e.status !== "Closed" && (!e.nextFollowUp || e.nextFollowUp <= t); });
    if (!due.length) { list.appendChild(el("div", "empty", "<strong>Nothing due right now.</strong>Follow-ups appear here when an enquiry needs a reply or a nudge.")); return; }
    due.sort(function (a, b) { return (a.nextFollowUp || "").localeCompare(b.nextFollowUp || ""); });
    due.forEach(function (e) {
      list.appendChild(enquiryCard(e, {
        buttons: false,
        draft: followupLine(e),
        extraButtons: function (mini) {
          mini("Copy line", function () { copy(followupLine(e)); });
          mini("Mark replied", function () { setStatus(e.id, "Replied"); });
          mini("Mark booked", function () { setStatus(e.id, "Booked"); });
          mini("Close", function () { setStatus(e.id, "Closed"); }, true);
        }
      }));
    });
  }

  // -------------------------------------------------------------------------
  // No-show recovery
  // -------------------------------------------------------------------------
  function renderNoShows() {
    var list = $("#noshow-list"); if (!list) return;
    list.innerHTML = "";
    var ns = state.enquiries.filter(function (e) { return e.status === "No-show"; });
    if (!ns.length) { list.appendChild(el("div", "empty", "<strong>No no-shows logged.</strong>Mark an enquiry as No-show to recover it here.")); return; }
    ns.forEach(function (e) {
      list.appendChild(enquiryCard(e, {
        buttons: false,
        draft: "Hi, we missed you today, no problem at all. Would you like help picking a new time this week?",
        extraButtons: function (mini) {
          mini("Copy message", function () { copy("Hi, we missed you today, no problem at all. Would you like help picking a new time this week?"); });
          mini("Mark rescheduled", function () { setStatus(e.id, "Rescheduled"); });
          mini("Close", function () { setStatus(e.id, "Closed"); }, true);
        }
      }));
    });
  }

  // -------------------------------------------------------------------------
  // Recalls
  // -------------------------------------------------------------------------
  function renderRecalls() {
    var list = $("#recall-list"); if (!list) return;
    list.innerHTML = "";
    if (!state.recalls.length) { list.appendChild(el("div", "empty", "<strong>No recalls added yet.</strong>This section is optional.")); return; }
    state.recalls.forEach(function (r) {
      var c = el("div", "enquiry-card");
      var top = el("div", "top");
      top.appendChild(el("span", "type", esc(r.type) + (r.label ? " · " + esc(r.label) : "")));
      top.appendChild(el("span", "pill", esc(r.status || "Open")));
      c.appendChild(top);
      if (r.note) c.appendChild(el("div", "note", esc(r.note)));
      c.appendChild(el("div", "draft", "Hi, a gentle reminder from the clinic, it may be time for your " + esc(r.type.toLowerCase()) + ". Would you like available slots?"));
      var actions = el("div", "card-actions");
      var b1 = el("button", "mini", "Copy reminder");
      b1.addEventListener("click", function () { copy("Hi, a gentle reminder from the clinic, it may be time for your " + r.type.toLowerCase() + ". Would you like available slots?"); });
      var b2 = el("button", "mini danger", "Close");
      b2.addEventListener("click", function () { state.recalls = state.recalls.filter(function (x) { return x.id !== r.id; }); save(); renderAll(); });
      actions.appendChild(b1); actions.appendChild(b2);
      c.appendChild(actions);
      list.appendChild(c);
    });
  }

  // -------------------------------------------------------------------------
  // Safe replies
  // -------------------------------------------------------------------------
  function renderReplies() {
    var wrap = $("#replies-list"); if (!wrap) return;
    wrap.innerHTML = "";
    SAFE_REPLIES.forEach(function (r) {
      var c = el("div", "reply-card" + (r.urgent ? " urgent" : ""));
      c.appendChild(el("h3", null, esc(r.title)));
      c.appendChild(el("p", null, esc(r.text)));
      c.appendChild(el("div", "copyhint", "Tap to copy · manual send only"));
      c.addEventListener("click", function () { copy(r.text); });
      wrap.appendChild(c);
    });
  }

  // -------------------------------------------------------------------------
  // Report (calculation preserved; simplified presentation)
  // -------------------------------------------------------------------------
  function buildReport(s) {
    var enq = s.enquiries;
    var total = enq.length;
    var bySource = {}, byType = {};
    SOURCES.forEach(function (x) { bySource[x] = 0; });
    TYPES.forEach(function (x) { byType[x] = 0; });
    enq.forEach(function (e) { if (e.source in bySource) bySource[e.source]++; if (e.type in byType) byType[e.type]++; });

    var replied = enq.filter(function (e) { return e.repliedAt || (e.status !== "New"); });
    var responseRate = total ? Math.round(replied.length / total * 100) : 0;

    var rt = [];
    enq.forEach(function (e) {
      if (e.repliedAt && e.receivedAt) {
        var mins = (new Date(e.repliedAt) - new Date(e.receivedAt)) / 60000;
        if (mins >= 0 && mins < 60 * 72) rt.push(mins);
      }
    });
    var avgResponseMin = rt.length ? Math.round(rt.reduce(function (a, b) { return a + b; }, 0) / rt.length) : null;

    var bookedStatuses = ["Booked", "Confirmed", "Visited", "Rescheduled"];
    var booked = enq.filter(function (e) { return bookedStatuses.indexOf(e.status) !== -1; });
    var bookedConversion = total ? Math.round(booked.length / total * 100) : 0;

    var pendingFollowups = enq.filter(function (e) { return e.followUpNeeded && e.status !== "Closed"; }).length;
    var priceEnq = enq.filter(function (e) { return e.type === "Price / Cost"; });
    var priceBooked = priceEnq.filter(function (e) { return bookedStatuses.indexOf(e.status) !== -1; }).length;
    var priceNotBooked = priceEnq.length - priceBooked;
    var highValuePending = enq.filter(function (e) { return HIGH_VALUE_TYPES.indexOf(e.type) !== -1 && bookedStatuses.indexOf(e.status) === -1 && e.status !== "Closed"; }).length;
    var unreplied = enq.filter(function (e) { return e.status === "New"; }).length;
    var noShows = enq.filter(function (e) { return e.status === "No-show"; }).length;
    var recovered = enq.filter(function (e) { return e.status === "Rescheduled"; }).length;
    var recallsAdded = s.recalls.length;

    var daysTracked = 1;
    if (s.setup && s.setup.startDate) {
      var d = Math.floor((new Date(todayStr()) - new Date(s.setup.startDate)) / 86400000) + 1;
      daysTracked = Math.max(1, Math.min(d, (s.setup.duration || 7)));
    }

    var leaks = [];
    if (priceEnq.length >= 5 && priceBooked / priceEnq.length < 0.4) {
      leaks.push({ score: priceNotBooked * 8, title: "Price enquiries are going cold before consultation.",
        detail: priceNotBooked + " of " + priceEnq.length + " price enquiries did not become a consultation.",
        fix: "Use a clinic-approved price reply, offer two consultation slots, and follow up after ~4 hours and again next day." });
    }
    if (noShows >= 4) {
      leaks.push({ score: noShows * 7, title: "No-shows need recovery.",
        detail: noShows + " no-shows logged, " + recovered + " recovered/rescheduled so far.",
        fix: "Use confirmation at booking, a previous-evening reminder, a morning reminder, and a same-day reschedule message." });
    }
    if (pendingFollowups >= 6) {
      leaks.push({ score: pendingFollowups * 5, title: "Follow-ups are pending.",
        detail: pendingFollowups + " enquiries are still awaiting follow-up.",
        fix: "Work a daily pending list with a simple 2-touch follow-up rhythm (same day + next day)." });
    }
    if (unreplied >= 5 || (total >= 10 && responseRate < 70)) {
      leaks.push({ score: unreplied * 6 + (100 - responseRate), title: "Some enquiries are not being replied to.",
        detail: unreplied + " enquiries are still unreplied (response rate " + responseRate + "%).",
        fix: "Add morning, midday and evening enquiry checks with fast, safe replies." });
    }
    if (recallsAdded >= 4) {
      leaks.push({ score: recallsAdded * 4, title: "Old patients could be recalled.",
        detail: recallsAdded + " recall opportunities were flagged this week.",
        fix: "Run a monthly recall list with clinic-approved reminder messages." });
    }
    leaks.sort(function (a, b) { return b.score - a.score; });
    var topLeaks = leaks.slice(0, 3);
    var thin = total < 20 && daysTracked < 7;

    return {
      total: total, daysTracked: daysTracked, thin: thin,
      bySource: bySource, byType: byType,
      responseRate: responseRate, avgResponseMin: avgResponseMin,
      booked: booked.length, bookedConversion: bookedConversion,
      pendingFollowups: pendingFollowups,
      priceEnq: priceEnq.length, priceNotBooked: priceNotBooked,
      highValuePending: highValuePending,
      unreplied: unreplied, noShows: noShows, recovered: recovered, recallsAdded: recallsAdded,
      topLeaks: topLeaks
    };
  }

  function renderReport() {
    var grid = $("#report-grid"); var insight = $("#report-insight");
    if (!grid || !insight) return;
    var r = buildReport(state);
    grid.innerHTML = "";
    grid.appendChild(metricCard(r.total, "Total enquiries", "m-mint"));
    grid.appendChild(metricCard(r.booked, "Booked appointments", "m-mint"));
    grid.appendChild(metricCard(r.pendingFollowups, "Follow-ups pending", "m-blue"));
    grid.appendChild(metricCard(r.noShows, "No-shows", "m-yellow"));
    grid.appendChild(metricCard(r.recallsAdded, "Recalls", "m-white"));

    insight.innerHTML = "";
    if (r.thin || !r.topLeaks.length) {
      insight.appendChild(el("div", "insight", "<strong>Keep tracking.</strong><p>The report becomes useful after more entries or 7 days.</p>"));
    } else {
      insight.appendChild(el("div", "insight pattern", "<strong>Main pattern to watch</strong><p>" + esc(r.topLeaks[0].title) + " " + esc(r.topLeaks[0].fix) + "</p>"));
    }
  }

  // -------------------------------------------------------------------------
  // Status transitions (preserved)
  // -------------------------------------------------------------------------
  function findE(id) { return state.enquiries.filter(function (e) { return e.id === id; })[0]; }
  function setStatus(id, status) {
    var e = findE(id); if (!e) return;
    e.status = status;
    if (status !== "New" && !e.repliedAt) e.repliedAt = new Date().toISOString();
    if (status === "Booked" || status === "Confirmed" || status === "Visited" || status === "Rescheduled" || status === "Closed") e.followUpNeeded = false;
    if (status === "Follow-up needed") { e.followUpNeeded = true; if (!e.nextFollowUp) e.nextFollowUp = todayStr(); }
    save(); renderAll();
  }
  function markFollowup(id) {
    var e = findE(id); if (!e) return;
    e.followUpNeeded = true;
    if (e.status === "New") { e.status = "Replied"; if (!e.repliedAt) e.repliedAt = new Date().toISOString(); }
    if (!e.nextFollowUp) e.nextFollowUp = todayStr();
    save(); renderAll();
  }

  // -------------------------------------------------------------------------
  // Enquiry modal (simplified fields)
  // -------------------------------------------------------------------------
  function openEnquiry(id) {
    var e = id ? findE(id) : null;
    $("#modal-title").textContent = e ? "Edit enquiry" : "Add enquiry";
    $("#f-id").value = e ? e.id : "";
    $("#f-source").value = e ? e.source : SOURCE_OPTIONS[0][0];
    $("#f-type").value = e ? e.type : TYPE_OPTIONS[0][0];
    $("#f-status").value = e ? (statusInDropdown(e.status) ? e.status : (e.followUpNeeded ? "Follow-up needed" : "New")) : "New";
    $("#f-label").value = e ? (e.label || "") : "";
    $("#f-nextfollow").value = e ? (e.nextFollowUp || "") : "";
    $("#f-notes").value = e ? (e.notes || "") : "";
    $("#save-confirm").hidden = true;
    $("#modal").hidden = false;
  }
  function statusInDropdown(s) { return STATUS_OPTIONS.some(function (p) { return p[0] === s; }); }
  function closeEnquiry() { $("#modal").hidden = true; }

  function saveEnquiry(ev) {
    ev.preventDefault();
    var id = $("#f-id").value;
    var e = id ? findE(id) : null;
    var isNew = !e;
    if (isNew) e = { id: uid(), createdAt: new Date().toISOString(), receivedAt: new Date().toISOString() };
    e.source = $("#f-source").value;
    e.type = $("#f-type").value;
    e.status = $("#f-status").value;
    e.label = $("#f-label").value.trim();
    e.nextFollowUp = $("#f-nextfollow").value || "";
    e.notes = $("#f-notes").value.trim();
    if (!e.receivedAt) e.receivedAt = new Date().toISOString();
    // "Follow-up needed" status, or a follow-up date set, means a follow-up is needed.
    e.followUpNeeded = (e.status === "Follow-up needed") || !!e.nextFollowUp;
    if (e.followUpNeeded && !e.nextFollowUp) e.nextFollowUp = todayStr();
    if (e.status !== "New" && !e.repliedAt) e.repliedAt = new Date().toISOString();
    if (isNew) state.enquiries.push(e);
    save(); renderAll();
    $("#save-confirm").hidden = false;
    setTimeout(closeEnquiry, 850);
  }

  // -------------------------------------------------------------------------
  // Clipboard + toast
  // -------------------------------------------------------------------------
  function copy(text) {
    function done() { flash("Copied, paste into WhatsApp/SMS and send manually."); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); }); }
    else { legacyCopy(text); done(); }
  }
  function legacyCopy(text) { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); }
  var flashTimer = null;
  function flash(msg) {
    var f = $("#flash") || (function () { var d = el("div"); d.id = "flash"; d.style.cssText = "position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#16271f;color:#fff;padding:.6rem 1rem;border-radius:12px;font-size:.85rem;z-index:60;box-shadow:0 8px 22px rgba(0,0,0,.2);max-width:90%;text-align:center"; document.body.appendChild(d); return d; })();
    f.textContent = msg; f.style.display = "block";
    clearTimeout(flashTimer); flashTimer = setTimeout(function () { f.style.display = "none"; }, 2200);
  }

  // -------------------------------------------------------------------------
  // Export / import / reset (preserved)
  // -------------------------------------------------------------------------
  function download(filename, text, type) {
    var blob = new Blob([text], { type: type || "text/plain" });
    var a = el("a"); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function exportJson() { download("dental-enquiry-check.json", JSON.stringify(state, null, 2), "application/json"); }
  function exportCsv() {
    var cols = ["receivedAt", "source", "type", "label", "status", "repliedAt", "followUpNeeded", "nextFollowUp", "notes"];
    var rows = [cols.join(",")];
    state.enquiries.forEach(function (e) {
      rows.push(cols.map(function (c) { var v = e[c] == null ? "" : String(e[c]); if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"'; return v; }).join(","));
    });
    download("dental-enquiry-check.csv", rows.join("\n"), "text/csv");
  }
  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (data && Array.isArray(data.enquiries)) {
          state = { setup: data.setup || state.setup, enquiries: data.enquiries, recalls: data.recalls || [] };
          if (!state.setup) state.setup = { clinicName: configuredClinicName(), startDate: todayStr(), duration: 7, staff: "", phone: "", sample: false };
          state.setup.clinicName = configuredClinicName();
          forceSetupScreen = false;
          save(); boot(); flash("Imported " + data.enquiries.length + " enquiries.");
        } else { flash("That file does not look like a valid export."); }
      } catch (e) { flash("Could not read that JSON file."); }
    };
    reader.readAsText(file);
  }
  function resetAll() {
    if (!confirm("Reset the dashboard? This clears all logged enquiries in this browser. Export first if you want a copy.")) return;
    state = blankState();
    forceSetupScreen = true;
    save(); closeMore(); boot(); flash("Tracking data reset. Clinic name kept.");
  }

  // -------------------------------------------------------------------------
  // Sample data (preserved)
  // -------------------------------------------------------------------------
  function buildSample() {
    var start = new Date(); start.setDate(start.getDate() - 6);
    var statusPlan = [["New", 5], ["Replied", 5], ["Interested", 5], ["Booked", 6], ["Confirmed", 2], ["Visited", 3], ["No-show", 5], ["Rescheduled", 7]];
    var nonPriceTypes = ["Tooth pain", "Implant", "Braces / Aligners", "Cleaning / Scaling", "Child dental visit", "Cosmetic / Smile", "Recall / Old patient", "Reschedule / Cancel", "Other"];
    var enquiries = [];
    var i = 0;
    statusPlan.forEach(function (sp) {
      for (var k = 0; k < sp[1]; k++) {
        var dayOffset = i % 7;
        var rec = new Date(start); rec.setDate(start.getDate() + dayOffset); rec.setHours(9 + (i % 9), (i * 7) % 60, 0, 0);
        var e = {
          id: "s" + i, createdAt: rec.toISOString(), source: SOURCES[i % SOURCES.length],
          type: nonPriceTypes[i % nonPriceTypes.length], label: "", phone4: String(1000 + (i * 37) % 9000).slice(-4),
          receivedAt: rec.toISOString(), status: sp[0], appointmentAt: "", followUpNeeded: false, nextFollowUp: "", notes: ""
        };
        if (sp[0] !== "New") { var rep = new Date(rec.getTime() + [5, 18, 35, 60, 130, 240][i % 6] * 60000); e.repliedAt = rep.toISOString(); }
        enquiries.push(e); i++;
      }
    });
    [0, 5, 10, 15, 20, 25].forEach(function (idx, n) { if (enquiries[idx]) { var d = new Date(); d.setHours(9 + n, n * 6, 0); enquiries[idx].receivedAt = d.toISOString(); } });
    [0, 1, 5, 6, 10, 11, 28, 18, 19].forEach(function (idx) { if (enquiries[idx]) enquiries[idx].type = "Price / Cost"; });
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2].forEach(function (idx) { if (enquiries[idx]) { enquiries[idx].followUpNeeded = true; enquiries[idx].nextFollowUp = todayStr(); } });
    enquiries.forEach(function (e) { if (e.type === "Price / Cost" && e.followUpNeeded) e.notes = "asked about price, prefers evening"; });
    var recalls = [
      { id: "r1", type: "Cleaning / check-up", label: "RS", note: "due ~6 months", status: "Open" },
      { id: "r2", type: "Braces / aligner review", label: "AP", note: "", status: "Open" },
      { id: "r3", type: "Implant review", label: "MK", note: "", status: "Open" },
      { id: "r4", type: "Child check-up", label: "", note: "", status: "Open" },
      { id: "r5", type: "Incomplete treatment follow-up", label: "JV", note: "RCT pending crown", status: "Open" }
    ];
    return { setup: { clinicName: configuredClinicName(), startDate: dateOnly(start), duration: 7, staff: "Front desk", phone: "", sample: true }, enquiries: enquiries, recalls: recalls };
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  function switchPanel(name, navKey) {
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.dataset.panel !== name; });
    document.querySelectorAll(".navbtn").forEach(function (b) { b.classList.toggle("is-active", b.dataset.nav === (navKey || name)); });
    window.scrollTo(0, 0);
  }
  function openMore() { $("#more-sheet").hidden = false; }
  function closeMore() { $("#more-sheet").hidden = true; }

  // -------------------------------------------------------------------------
  // Render + boot
  // -------------------------------------------------------------------------
  function renderAll() {
    renderMetrics(); renderTodayList(); renderFollowups(); renderNoShows(); renderRecalls(); renderReport();
    if (state.setup && $("#app-clinic")) $("#app-clinic").textContent = state.setup.clinicName || configuredClinicName();
    if ($("#greeting")) $("#greeting").textContent = greetingText();
  }

  function boot() {
    var goApp = state.setup && !forceSetupScreen;
    $("#screen-setup").hidden = goApp;
    $("#screen-app").hidden = !goApp;
    $("#bottomnav").hidden = !goApp;
    if (goApp) { switchPanel("today"); renderAll(); }
    else { prepareSetupScreen(!state.setup); }
  }

  function startTracking() {
    if ($("#setup-sample") && $("#setup-sample").checked) {
      state = buildSample(); forceSetupScreen = false; save(); boot();
      flash("Sample data loaded, fictional, no real patient data.");
      return;
    }
    state.setup = {
      clinicName: configuredClinicName(),
      startDate: $("#setup-start").value || todayStr(),
      duration: parseInt($("#setup-duration").value, 10) || 7,
      staff: ($("#setup-staff").value || "").trim(),
      phone: ($("#setup-phone") ? $("#setup-phone").value : "").trim(),
      sample: false
    };
    state.enquiries = []; state.recalls = []; forceSetupScreen = false;
    save(); boot();
  }

  // -------------------------------------------------------------------------
  // Wire up
  // -------------------------------------------------------------------------
  function init() {
    load();
    fillSelect($("#f-source"), SOURCE_OPTIONS);
    fillSelect($("#f-type"), TYPE_OPTIONS);
    fillSelect($("#f-status"), STATUS_OPTIONS);
    if ($("#setup-start")) $("#setup-start").value = todayStr();
    renderReplies();
    // Resume to the Today screen when a session already exists (refresh-safe);
    // first-time visitors (no saved setup) land on the setup screen.
    forceSetupScreen = false;
    prepareSetupScreen(!state.setup);

    if (launchedWithClinicParam() && $("#back-offer")) $("#back-offer").hidden = false;

    on("#btn-start", "click", startTracking);
    on("#btn-add-today", "click", function () { openEnquiry(null); });
    on("#modal-close", "click", closeEnquiry);
    on("#btn-cancel", "click", closeEnquiry);
    on("#enquiry-form", "submit", saveEnquiry);

    // Bottom nav
    document.querySelectorAll(".navbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        var nav = b.dataset.nav;
        if (nav === "more") { document.querySelectorAll(".navbtn").forEach(function (x) { x.classList.toggle("is-active", x.dataset.nav === "more"); }); openMore(); }
        else switchPanel(nav);
      });
    });

    // More sheet
    on("#more-close", "click", closeMore);
    $("#more-sheet").addEventListener("click", function (ev) { if (ev.target === $("#more-sheet")) closeMore(); });
    on("#more-noshows", "click", function () { closeMore(); switchPanel("noshows", "more"); });
    on("#more-recalls", "click", function () { closeMore(); switchPanel("recalls", "more"); });
    on("#more-replies", "click", function () { closeMore(); switchPanel("replies", "more"); });
    on("#more-export", "click", function () { exportJson(); flash("Exported JSON."); });
    on("#more-export-csv", "click", function () { exportCsv(); flash("Exported CSV."); });
    on("#more-import", "click", function () { $("#import-file").click(); });
    on("#import-file", "change", function (ev) { if (ev.target.files[0]) importJson(ev.target.files[0]); ev.target.value = ""; closeMore(); });
    on("#more-reset", "click", resetAll);

    // Recall modal
    on("#btn-add-recall", "click", function () { $("#recall-modal").hidden = false; });
    on("#recall-close", "click", function () { $("#recall-modal").hidden = true; });
    on("#recall-cancel", "click", function () { $("#recall-modal").hidden = true; });
    on("#recall-form", "submit", function (ev) {
      ev.preventDefault();
      state.recalls.push({ id: uid(), type: $("#r-type").value, label: $("#r-label").value.trim(), note: $("#r-note").value.trim(), status: "Open" });
      $("#r-label").value = ""; $("#r-note").value = "";
      save(); renderAll(); $("#recall-modal").hidden = true; switchPanel("recalls", "more");
    });

    boot();
  }

  // Future AI hooks (deterministic for now).
  window.DERC_AI_HOOKS = { classifyIntent: null, suggestNextAction: null, generateWeeklyReport: null, recommendRecoverySystem: null, draftSafeReply: null, flagUrgent: null };
  window.DERC = { buildReport: buildReport, buildSample: buildSample };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
