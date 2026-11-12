import Link from 'next/link';
import { GradientBg } from '@/components/ui/GradientBg';
import { Logo } from '@/components/ui/Logo';
import { footerColumns } from '@/lib/navigation';
import { routes } from '@/lib/routes';
import { ThemeToggle } from './ThemeToggle';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`is-dark ${styles.panel}`}>
        <GradientBg variant="deep" />
        <div className={`container ${styles.content}`}>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Link href={routes.home} aria-label="Gieom.cloud home">
                <Logo height={22} />
              </Link>
              <p>
                Gieom.cloud is the policy and procedure platform from Gieom built for regulated industries in India and the Middle East.
              </p>
            </div>
            <nav className={styles.columns} aria-label="Footer">
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h2 className={styles.heading}>{col.heading}</h2>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className={styles.bottom}>
            <span>© 2026 Gieom. gieom.cloud</span>
            <span className={styles.region}>India, UAE and the GCC</span>
            <span className={styles.theme}>
              <span className={styles.themeLabel}>Theme</span>
              <ThemeToggle />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
