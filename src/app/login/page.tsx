import type { Metadata } from 'next';
import Link from 'next/link';
import { Field, Input } from '@/components/forms/Field';
import { StaticForm } from '@/components/forms/StaticForm';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { GradientBg } from '@/components/ui/GradientBg';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { routes } from '@/lib/routes';
import s from './login.module.css';

export const metadata: Metadata = {
  title: 'Sign in to Gieom.cloud',
  description: "Use your organisation's single sign-on, or your email and password.",
};

export default function LoginPage() {
  return (
    <main className={s.page}>
      <div className={s.left}>
        <div className={s.top}>
          <Link href={routes.home} aria-label="Gieom.cloud home">
            <Logo height={22} />
          </Link>
          <ThemeToggle />
        </div>

        <div className={s.formWrap}>
          <h1 className={s.title}>Sign in to Gieom.cloud</h1>
          <p className={s.sub}>Use your organisation&apos;s single sign-on, or your email and password.</p>

          <div className={s.sso}>
            <a href="#" className={s.ssoBtn}>
              <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Continue with Microsoft
            </a>
            <a href="#" className={s.ssoBtn}>
              <Icon name="lock" size={18} />
              Continue with your identity provider (SAML)
            </a>
          </div>

          <div className={s.or}>
            <span>or</span>
          </div>

          <StaticForm submitLabel="Sign in">
            <Field id="l-email" label="Work email">
              <Input id="l-email" type="email" name="email" autoComplete="email" required />
            </Field>
            <Field id="l-pass" label="Password">
              <Input id="l-pass" type="password" name="password" autoComplete="current-password" required />
            </Field>
          </StaticForm>
          <div className={s.links}>
            <a href="#">Forgot password?</a>
            <Link href={routes.trial}>Start a free trial</Link>
          </div>

          <p className={`note ${s.note}`}>Signing in from a consulting firm? Each client deployment has its own sign-in address.</p>
        </div>
      </div>

      <aside className={`is-dark ${s.right}`}>
        <GradientBg variant="hero" />
        <div className={s.rightInner}>
          <p className={s.label}>Gieom.cloud</p>
          <h2 className={s.headline}>AI-powered policies and procedures. Always audit-ready.</h2>
          <div className={s.tip}>
            <b>New this month</b>
            <p>
              Regulatory change tracking now lists every document a changed clause affects and starts the re-review workflow for you.{' '}
              <Link href={routes.blog}>Read the update →</Link>
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
