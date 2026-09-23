// The evidence links remain useful if JavaScript is unavailable.
const box = document.querySelector('.lightbox');
let opener;
for (const link of document.querySelectorAll('[data-enlarge]')) {
  link.addEventListener('click', event => {
    if (!box || !box.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    const img = box.querySelector('img');
    img.src = link.href;
    img.alt = link.closest('figure').querySelector('img').alt;
    box.querySelector('.lightbox-caption').textContent = (link.dataset.caption || '') + ' / Scroll to inspect at full size.';
    box.showModal();
    document.body.style.overflow = 'hidden';
    box.querySelector('[data-close]').focus();
  });
}
box?.querySelector('[data-close]').addEventListener('click', () => box.close());
box?.addEventListener('close', () => {
  document.body.style.overflow = '';
  opener?.focus({preventScroll:true});
});
box?.addEventListener('click', event => {
  if (event.target !== box) return;
  const r = box.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) box.close();
});
