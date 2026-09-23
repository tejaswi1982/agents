// Accessibility-only enhancement for the supplied prototype's existing dialogs.
(() => {
  const layers = ['modal', 'recall-modal', 'more-sheet'].map(id => document.getElementById(id));
  let active = null;
  let opener = null;
  const focusable = root => [...root.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')]
    .filter(el => !el.disabled && el.getClientRects().length);
  const sync = () => {
    const next = layers.find(el => !el.hidden) || null;
    if (next === active) return;
    if (next) {
      opener = document.activeElement;
      active = next;
      focusable(next)[0]?.focus();
    } else {
      active = null;
      if (opener?.getClientRects().length) opener.focus();
      opener = null;
    }
  };
  new MutationObserver(sync).observe(document.body, {attributes:true,subtree:true,attributeFilter:['hidden']});
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); active.hidden = true; return; }
    if (event.key !== 'Tab') return;
    const items = focusable(active), first = items[0], last = items[items.length - 1];
    if (!first) return;
    if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
})();
