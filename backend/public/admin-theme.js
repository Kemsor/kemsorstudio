(() => {
  const root = document.documentElement;
  // The admin uses a single bright appearance, independent of saved or system themes.
  root.dataset.adminTheme = 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
  addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.admin-menu-toggle');
    const nav = document.querySelector('.cms-nav');
    const backdrop = document.querySelector('.admin-nav-backdrop');
    const main = document.querySelector('main');
    if (!toggle || !nav || !backdrop) return;
    const mobile = matchMedia('(max-width: 1039px)');
    const setOpen = (open, returnFocus = false) => {
      root.dataset.adminNavOpen = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      backdrop.hidden = !open;
      nav.inert = mobile.matches && !open;
      nav.setAttribute('aria-hidden', String(mobile.matches && !open));
      main.inert = mobile.matches && open;
      if (open) [...nav.querySelectorAll('a[href],button:not([disabled])')].find(control=>control.getClientRects().length)?.focus({ preventScroll: true });
      else if (returnFocus) toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(root.dataset.adminNavOpen !== 'true'));
    backdrop.addEventListener('click', () => setOpen(false, true));
    nav.addEventListener('click', event => { if (event.target.closest('a') && mobile.matches) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (!mobile.matches || root.dataset.adminNavOpen !== 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
      if (event.key === 'Tab') {
        const controls = [toggle, ...[...nav.querySelectorAll('a[href],button:not([disabled])')].filter(control=>control.getClientRects().length)];
        const index = controls.indexOf(document.activeElement);
        const next = event.shiftKey ? (index <= 0 ? controls.length - 1 : index - 1) : (index < 0 || index === controls.length - 1 ? 0 : index + 1);
        event.preventDefault();
        controls[next].focus();
      }
    });
    mobile.addEventListener('change', () => setOpen(false));
    setOpen(false);
  });
})();
