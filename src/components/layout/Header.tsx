'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { isMenu, primaryNav, type NavMenu } from '@/lib/navigation';
import { routes } from '@/lib/routes';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

const DESKTOP_QUERY = '(min-width: 1280px)';

const sectionPrefixes: Record<string, string[]> = {
  product: ['/products'],
  solutions: ['/solutions'],
  resources: [routes.blog, routes.guides, routes.webinars, routes.help, routes.glossary],
};

function isActive(item: (typeof primaryNav)[number], pathname: string) {
  if (isMenu(item)) return (sectionPrefixes[item.id] ?? []).some((p) => pathname.startsWith(p));
  return pathname === item.href;
}

function MenuPanel({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  if (menu.groups) {
    return (
      <div className={`${styles.panelInner} ${styles.panelColumns}`}>
        {menu.groups.map((group) => (
          <div key={group.heading}>
            <p className={styles.panelHeading}>{group.heading}</p>
            <ul className={styles.panelSimpleList}>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={onNavigate} className={styles.panelSimpleLink}>
                    {link.label}
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className={`${styles.panelInner} ${menu.layout === 'grid' ? styles.panelGrid : styles.panelList}`}>
      {menu.links?.map((link) => (
        <li key={link.href}>
          <Link href={link.href} onClick={onNavigate} className={styles.panelLink}>
            <span className={styles.panelLinkTitle}>{link.label}</span>
            {link.description && <span className={styles.panelLinkDesc}>{link.description}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const closeTimer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  // Close everything when the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
    setDrawerOpen(false);
  }

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Desktop dropdowns: close on outside click and Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const trigger = navRef.current?.querySelector<HTMLButtonElement>(`[data-menu-trigger="${openMenu}"]`);
        setOpenMenu(null);
        trigger?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  // Mobile drawer: lock page scroll, close on Escape or when resized to desktop.
  useEffect(() => {
    if (!drawerOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && setDrawerOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev;
      mq.removeEventListener('change', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const hoverOpen = (id: string) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    setOpenMenu(id);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };

  const headerClass = [styles.header, scrolled || drawerOpen ? styles.scrolled : 'is-dark', openMenu ? styles.menuOpen : '']
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass}>
      <div className={`container ${styles.shell}`}>
        <div className={styles.bar}>
          <Link href={routes.home} className={styles.brand} aria-label="Gieom.cloud home" onClick={closeAll}>
            <Logo height={22} />
          </Link>

          <nav ref={navRef} className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {primaryNav.map((item) => {
                const active = isActive(item, pathname);
                if (!isMenu(item)) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${styles.navLink} ${active ? styles.active : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                const expanded = openMenu === item.id;
                return (
                  <li key={item.id} className={styles.navItem} onPointerEnter={hoverOpen(item.id)} onPointerLeave={hoverClose}>
                    <button
                      type="button"
                      data-menu-trigger={item.id}
                      className={`${styles.navLink} ${active ? styles.active : ''}`}
                      aria-expanded={expanded}
                      aria-controls={`menu-${item.id}`}
                      onClick={() => setOpenMenu(expanded ? null : item.id)}
                    >
                      {item.label}
                      <Icon name="chevronDown" size={14} strokeWidth={2} className={styles.caret} />
                    </button>
                    <div
                      id={`menu-${item.id}`}
                      className={`is-light ${styles.panel} ${styles[`panel_${item.id}`] ?? ''} ${expanded ? styles.panelOpen : ''}`}
                    >
                      <MenuPanel menu={item} onNavigate={() => setOpenMenu(null)} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link href={routes.demo} className={styles.textAction}>
              Book a demo
            </Link>
            <Link href={routes.trial} className="btn btn--primary btn--sm">
              Start free trial
            </Link>
            <span className={styles.divider} aria-hidden="true" />
            <Link href={routes.login} className={styles.login}>
              <Icon name="user" size={16} />
              Login
            </Link>
            <ThemeToggle />
          </div>

          <div className={styles.compactActions}>
            <ThemeToggle />
            <button
              type="button"
              className={styles.burger}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-menu"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <Icon name={drawerOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
          <span className={styles.progress} aria-hidden="true" />
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`} inert={!drawerOpen}>
        <div className={`container ${styles.drawerInner}`}>
          <nav aria-label="Mobile">
            {primaryNav.map((item) =>
              isMenu(item) ? (
                <details key={item.id} className={styles.mGroup}>
                  <summary className={styles.mSummary}>
                    {item.label}
                    <Icon name="chevronDown" size={18} className={styles.mCaret} />
                  </summary>
                  <div className={styles.mLinks}>
                    {item.links?.map((link) => (
                      <Link key={link.href} href={link.href} onClick={closeAll} className={styles.mLink}>
                        <span>{link.label}</span>
                        {link.description && <small>{link.description}</small>}
                      </Link>
                    ))}
                    {item.groups?.map((group) => (
                      <div key={group.heading} className={styles.mSub}>
                        <p className={styles.panelHeading}>{group.heading}</p>
                        {group.links.map((link) => (
                          <Link key={link.href} href={link.href} onClick={closeAll} className={styles.mLink}>
                            <span>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              ) : (
                <Link key={item.href} href={item.href} onClick={closeAll} className={styles.mTop}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className={styles.mActions}>
            <Link href={routes.trial} onClick={closeAll} className="btn btn--primary btn--block">
              Start free trial
            </Link>
            <Link href={routes.demo} onClick={closeAll} className="btn btn--secondary btn--block">
              Book a demo
            </Link>
            <Link href={routes.login} onClick={closeAll} className={styles.mLogin}>
              <Icon name="user" size={16} />
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
