(() => {
  const root = document.documentElement;
  // The admin uses a single bright appearance, independent of saved or system themes.
  root.dataset.adminTheme = 'light';
  const menuPreference = 'kemsor-admin-menu-hidden';
  try { root.dataset.adminSidebarHidden = String(localStorage.getItem(menuPreference) === 'true'); }
  catch { root.dataset.adminSidebarHidden = 'false'; }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
  addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.admin-menu-toggle');
    const nav = document.querySelector('.cms-nav');
    const backdrop = document.querySelector('.admin-nav-backdrop');
    const main = document.querySelector('main');
    if (!toggle || !nav || !backdrop) return;
    const mobile = matchMedia('(max-width: 1039px)');
    const syncDesktop = () => {
      const hidden = root.dataset.adminSidebarHidden === 'true';
      root.dataset.adminNavOpen = 'false';
      toggle.setAttribute('aria-expanded', String(!hidden));
      toggle.setAttribute('aria-label', hidden ? 'Show admin menu' : 'Hide admin menu');
      backdrop.hidden = true;
      nav.inert = hidden;
      nav.setAttribute('aria-hidden', String(hidden));
      main.inert = false;
    };
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
    toggle.addEventListener('click', () => {
      if (mobile.matches) {
        setOpen(root.dataset.adminNavOpen !== 'true');
        return;
      }
      const hidden = root.dataset.adminSidebarHidden !== 'true';
      root.dataset.adminSidebarHidden = String(hidden);
      try { localStorage.setItem(menuPreference, String(hidden)); } catch {}
      syncDesktop();
    });
    backdrop.addEventListener('click', () => setOpen(false, true));
    // Leave the drawer in place until the next document is ready.
    addEventListener('pageshow', event => {
      if (event.persisted && mobile.matches) setOpen(false);
    });
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
    const syncLayout = () => mobile.matches ? setOpen(false) : syncDesktop();
    mobile.addEventListener('change', syncLayout);
    syncLayout();
  });
})();
