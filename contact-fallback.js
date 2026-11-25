/* If clicking an email link opens no mail app, offer Copy / Open in Gmail instead. */
(function () {
  var EMAIL = "gblawal00@gmail.com";
  var panel;

  function hide() { if (panel) { panel.remove(); panel = null; } }

  function show(subject) {
    hide();
    panel = document.createElement("div");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Email options");
    panel.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;width:min(440px,calc(100vw - 32px));" +
      "background:#13203a;color:#e7eefc;border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:18px 20px;" +
      "box-shadow:0 20px 50px rgba(0,0,0,.5);font:500 .95rem/1.5 Inter,system-ui,sans-serif";
    var gmail = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(EMAIL) +
      (subject ? "&su=" + encodeURIComponent(subject) : "");
    var btn = "display:inline-block;margin:10px 8px 0 0;padding:9px 16px;border-radius:999px;font:600 .88rem Inter,system-ui,sans-serif;cursor:pointer;text-decoration:none;";
    panel.innerHTML =
      '<div style="margin-bottom:2px">No email app opened? Email me at <strong>' + EMAIL + "</strong></div>" +
      '<a data-gmail href="' + gmail + '" target="_blank" rel="noopener" style="' + btn + 'background:linear-gradient(135deg,#4f9cf9,#34e0b8);color:#062018;border:0">Open in Gmail</a>' +
      '<button data-copy type="button" style="' + btn + 'background:transparent;color:#e7eefc;border:1px solid rgba(255,255,255,.25)">Copy address</button>' +
      '<button data-close type="button" aria-label="Close" style="' + btn + 'background:transparent;color:#9fb0cf;border:0;margin-right:0">Close</button>';
    panel.querySelector("[data-copy]").addEventListener("click", function (ev) {
      var b = ev.currentTarget;
      function done() { b.textContent = "Copied ✓"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done, function () { window.prompt("Copy this address:", EMAIL); });
      } else { window.prompt("Copy this address:", EMAIL); }
    });
    panel.querySelector("[data-close]").addEventListener("click", hide);
    panel.querySelector("[data-gmail]").addEventListener("click", function () { setTimeout(hide, 300); });
    document.body.appendChild(panel);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    var subject = "";
    var m = a.getAttribute("href").match(/[?&]subject=([^&]*)/i);
    if (m) { try { subject = decodeURIComponent(m[1]); } catch (_) {} }
    // A mail app (or webmail handler) taking over blurs or hides the page.
    // If we are still focused and visible a second later, nothing opened.
    setTimeout(function () {
      if (!document.hidden && document.hasFocus()) show(subject);
    }, 1200);
  });
})();
