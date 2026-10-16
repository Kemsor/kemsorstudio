import React, { useEffect, useRef, useState } from 'react';
import { navigation } from './navigation';
import './header.css';
import {useMember,LogoutButton} from './MemberSession';

const drawerQuery = '(max-width: 1440px)';

function RollingLabel({ children }) {
  return <span className="creative-nav-roll"><span className="creative-nav-roll-track"><span>{children}</span><span aria-hidden="true">{children}</span></span></span>;
}

export default function Header({ page = 'home' } = {}) {
  const {user,loading}=useMember();
  const [drawerMode, setDrawerMode] = useState(() => typeof window !== 'undefined' && window.matchMedia(drawerQuery).matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 24);
  const [currentHash, setCurrentHash] = useState(() => typeof window !== 'undefined' ? window.location?.hash || '' : '');
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRefs = useRef({});
  const hoverTimer = useRef(null);
  useEffect(() => {
    let previous = window.scrollY;
    let distance = 0;
    const update = () => {
      const current = Math.max(0, window.scrollY);
      setScrolled(current > 24);
      const delta = current - previous;
      distance = Math.sign(delta) === Math.sign(distance) ? distance + delta : delta;
      setHidden(false);
      distance = 0;
      previous = current;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [drawerOpen, activePanel, page]);
  let currentItem = { 'find-talent':'talent',join:'talent',login:'talent',profile:'talent','script-to-production':'script-tool', about: 'studio', careers: 'studio', services: 'capabilities', projects: 'productions', news: 'newsroom', blog: 'blog', contact: 'project' }[page];
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
    const background = [...document.querySelectorAll('main, footer, .experience-tools')].filter(element => !element.contains(headerRef.current));
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
    <header ref={headerRef} className="creative-header" data-page={page} data-overlay="true" data-scrolled={scrolled} data-panel-open={Boolean(activePanel)} data-drawer-open={drawerOpen} data-hidden={hidden && !drawerOpen && !activePanel} onFocusCapture={() => setHidden(false)}>
      <div className="creative-header-inner">
        <a className="creative-header-brand" href="/" onClick={event => followLink('/', event)} aria-label="Kemsor Studios home">
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
          {!loading&&user?.role!=='artist'&&<a href="/script-to-production/" className="creative-nav-mobile-cta" aria-current={page==='script-to-production'?'page':undefined} onClick={event => followLink('/script-to-production/', event)}>Script to Production <span aria-hidden="true">↗</span></a>}
          <div className="creative-nav-mobile-account" aria-label="Account">
            {!loading&&(user?<LogoutButton className="creative-nav-mobile-login"/>:<a href="/login/" className="creative-nav-mobile-login" aria-current={page==='login'?'page':undefined} onClick={event => followLink('/login/', event)}>Login <span aria-hidden="true">↗</span></a>)}
          </div>
          <p className="creative-nav-drawer-foot">Film. Series. Documentaries.<br />Good stories start with a conversation.</p>
        </nav>
        <div className="creative-header-controls">
          {!loading&&user?.role!=='artist'&&<a href="/script-to-production/" className="header-script-tool" aria-current={page==='script-to-production'?'page':undefined}><b className="cta-label">Script to Production</b> <span aria-hidden="true">↗</span></a>}
          <div className="header-account-links" aria-label="Account links">{!loading&&(user?<LogoutButton className="header-login"/>:<a href="/login/" className="header-login" aria-current={page==='login'?'page':undefined}>Login</a>)}</div>
          <button ref={toggleRef} type="button" className="creative-nav-toggle" aria-expanded={drawerOpen} aria-controls="creative-navigation" onClick={() => { clearHoverTimer(); setDrawerOpen(!drawerOpen); setActivePanel(null); }}>
            <span>{drawerOpen ? 'Close' : 'Menu'}</span><span className="creative-nav-toggle-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
    {drawerOpen && <button type="button" className="creative-nav-backdrop" aria-label="Close navigation" tabIndex={-1} onClick={() => closeDrawer()} />}
  </>;
}
