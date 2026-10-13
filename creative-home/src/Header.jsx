import React, { useEffect, useRef, useState } from 'react';
import { navigation } from './navigation';
import './header.css';

const drawerQuery = '(max-width: 1280px)';

function RollingLabel({ children }) {
  return <span className="creative-nav-roll"><span className="creative-nav-roll-track"><span>{children}</span><span aria-hidden="true">{children}</span></span></span>;
}

export default function Header({ theme = 'light', onThemeToggle, page = 'home' } = {}) {
  const [drawerMode, setDrawerMode] = useState(() => typeof window !== 'undefined' && window.matchMedia(drawerQuery).matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [currentHash, setCurrentHash] = useState(() => typeof window !== 'undefined' ? window.location?.hash || '' : '');
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRefs = useRef({});
  const hoverTimer = useRef(null);
  let currentItem = { about: 'studio', careers: 'studio', services: 'capabilities', projects: 'productions', news: 'newsroom', contact: 'project' }[page];
  if (page === 'services' && currentHash === '#india-production-services') currentItem = 'india';
  if (page === 'services' && currentHash === '#production-process') currentItem = 'studio';
  if (page === 'contact' && ['#filmmakers', '#studios', '#co-producers', '#international-productions'].includes(currentHash)) currentItem = 'partners';
  const currentSubLink = navigation.flatMap(item => item.groups?.flatMap(group => group.links) || []).find(link => link.href === `/${page}/${currentHash}`)?.label;

  const clearHoverTimer = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  const closeDrawer = (restoreFocus = true) => {
    clearHoverTimer();
    setDrawerOpen(false);
    setActivePanel(null);
    if (restoreFocus) toggleRef.current?.focus();
  };

  const followLink = (href, event) => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    closeDrawer(false);
    const target = new URL(href, window.location.href);
    if (target.origin !== window.location.origin || target.pathname !== window.location.pathname || target.search !== window.location.search) return;
    setCurrentHash(target.hash);
    requestAnimationFrame(() => {
      const destination = target.hash ? document.getElementById(decodeURIComponent(target.hash.slice(1))) : document.querySelector('main');
      if (!destination) return;
      if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    closeDrawer(false);
    window.addEventListener('hashchange', updateHash);
    window.addEventListener('popstate', updateHash);
    return () => {
      window.removeEventListener('hashchange', updateHash);
      window.removeEventListener('popstate', updateHash);
    };
  }, [page]);

  const enterItem = (event, item) => {
    if (drawerMode || event.pointerType !== 'mouse') return;
    clearHoverTimer();
    setActivePanel(item.groups ? item.id : null);
  };

  const leaveItem = event => {
    if (drawerMode || event.pointerType !== 'mouse') return;
    clearHoverTimer();
    const item = event.currentTarget;
    hoverTimer.current = setTimeout(() => {
      if (!item.querySelector('.creative-dropdown:not([hidden])')?.contains(document.activeElement)) setActivePanel(null);
    }, 160);
  };

  useEffect(() => {
    const query = window.matchMedia(drawerQuery);
    const update = () => {
      clearHoverTimer();
      setDrawerMode(query.matches);
      setDrawerOpen(false);
      setActivePanel(null);
    };
    query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); clearHoverTimer(); };
  }, []);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key !== 'Escape') return;
      if (drawerOpen) closeDrawer();
      else if (activePanel) {
        clearHoverTimer();
        setActivePanel(null);
        triggerRefs.current[activePanel]?.focus();
      }
    };
    const onOutsidePointer = event => {
      if (!headerRef.current?.contains(event.target)) {
        clearHoverTimer();
        setActivePanel(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onOutsidePointer);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onOutsidePointer);
    };
  }, [drawerOpen, activePanel]);

  useEffect(() => {
    if (!drawerOpen) return;
    navRef.current.scrollTop = 0;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [...document.querySelectorAll('main, footer')].filter(element => !element.contains(headerRef.current));
    const originalInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    const firstFrame = requestAnimationFrame(() => closeRef.current?.focus());
    const trapFocus = event => {
      if (event.key !== 'Tab') return;
      const controls = [...navRef.current.querySelectorAll('a, button')].filter(element => element.getClientRects().length > 0 && !element.closest('[hidden]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!controls.length) return;
      if (!navRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      cancelAnimationFrame(firstFrame);
      document.body.style.overflow = originalOverflow;
      background.forEach((element, index) => { element.inert = originalInert[index]; });
      document.removeEventListener('keydown', trapFocus);
    };
  }, [drawerOpen]);

  const focusDropdown = (event, item) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    clearHoverTimer();
    setActivePanel(item.id);
    requestAnimationFrame(() => {
      const links = headerRef.current.querySelectorAll(`#creative-menu-${item.id} a`);
      (event.key === 'ArrowUp' ? links[links.length - 1] : links[0])?.focus();
    });
  };

  return <>
    <header ref={headerRef} className="creative-header" data-drawer-open={drawerOpen}>
      <div className="creative-header-inner">
        <a className="creative-header-brand" href="/#home" onClick={event => followLink('/#home', event)} aria-label="Kemsor Studios home">
          <picture><source srcSet="/assets/kemsor-logo.webp" type="image/webp" /><img src="/assets/kemsor-logo.svg" alt="" width="3650" height="3300" decoding="async" /></picture>
        </a>
        <nav ref={navRef} id="creative-navigation" className="creative-nav" aria-label="Main navigation" aria-hidden={drawerMode && !drawerOpen ? true : undefined} inert={drawerMode && !drawerOpen} data-open={drawerOpen} onBlur={event => { if (!drawerMode && !event.currentTarget.contains(event.relatedTarget)) setActivePanel(null); }}>
          <div className="creative-nav-drawer-head"><span>THE STUDIO INDEX</span><button ref={closeRef} type="button" onClick={() => closeDrawer()} aria-label="Close navigation">Close <span aria-hidden="true">×</span></button></div>
          <div className="creative-nav-list">
            {navigation.map(item => <div className={`creative-nav-item creative-nav-item-${item.id}`} data-current={currentItem === item.id} key={item.id} onPointerEnter={event => enterItem(event, item)} onPointerLeave={leaveItem}>
              {item.href ? <a className={item.cta ? 'creative-nav-cta' : 'creative-nav-direct'} href={item.href} aria-current={currentItem === item.id ? currentHash && item.href.endsWith(currentHash) ? 'location' : 'page' : undefined} onClick={event => followLink(item.href, event)}><RollingLabel>{item.label}</RollingLabel>{item.cta && <span className="creative-nav-cta-mark" aria-hidden="true">+</span>}</a> : <>
                <button ref={element => { triggerRefs.current[item.id] = element; }} type="button" className="creative-nav-trigger" aria-current={currentItem === item.id ? 'page' : undefined} aria-expanded={activePanel === item.id} aria-controls={`creative-menu-${item.id}`} onClick={event => { clearHoverTimer(); setActivePanel(drawerMode || event.detail === 0 ? activePanel === item.id ? null : item.id : item.id); }} onKeyDown={event => focusDropdown(event, item)}><RollingLabel>{item.label}</RollingLabel><span className="creative-nav-chevron" aria-hidden="true" /></button>
                <div id={`creative-menu-${item.id}`} className={`creative-dropdown${item.id === 'capabilities' ? ' creative-dropdown-mega' : ''}`} hidden={activePanel !== item.id}>
                  <div className="creative-dropdown-groups">{item.groups.map((group, index) => <div className="creative-nav-group" key={group.title || index}>{group.title && <p className="creative-nav-group-title">{group.title}</p>}{group.links.map(link => <a key={link.label} href={link.href} aria-current={currentSubLink === link.label ? currentHash ? 'location' : 'page' : undefined} onClick={event => followLink(link.href, event)}>{link.label}</a>)}</div>)}</div>
                </div>
              </>}
            </div>)}
          </div>
          <p className="creative-nav-drawer-foot">Film. Series. Documentaries.<br />Good stories start with a conversation.</p>
        </nav>
        <div className="creative-header-controls">
          <button type="button" className="creative-theme-toggle" role="switch" aria-label="Dark mode" aria-checked={theme === 'dark'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => { clearHoverTimer(); if (!drawerOpen) setActivePanel(null); onThemeToggle?.(); }}>
            <span className="creative-theme-label">Dark mode</span>
            <span className="creative-theme-track" aria-hidden="true"><span className="creative-theme-thumb"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{theme === 'dark' ? <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>}</svg></span></span>
          </button>
          <button ref={toggleRef} type="button" className="creative-nav-toggle" aria-expanded={drawerOpen} aria-controls="creative-navigation" onClick={() => { clearHoverTimer(); setDrawerOpen(!drawerOpen); setActivePanel(null); }}>
            <span>{drawerOpen ? 'Close' : 'Menu'}</span><span className="creative-nav-toggle-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
    {drawerOpen && <button type="button" className="creative-nav-backdrop" aria-label="Close navigation" tabIndex={-1} onClick={() => closeDrawer()} />}
  </>;
}
