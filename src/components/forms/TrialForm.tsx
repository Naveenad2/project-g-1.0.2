'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { routes } from '@/lib/routes';
import { Field, FormCard, Input, Select, formStyles as f } from './Field';

export function TrialForm() {
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <FormCard>
      <div className={f.progress} aria-hidden="true">
        <span data-on="true" />
        <span data-on={done ? 'true' : 'false'} />
      </div>
      {!done ? (
        <>
          <h2 style={{ marginBottom: '1.25rem' }}>Create your account</h2>
          <form className={f.form} onSubmit={submit}>
            <Field id="t-email" label="Work email" hint="We use this to create your account and nothing else until you ask.">
              <Input id="t-email" type="email" name="email" autoComplete="email" />
            </Field>
            <Field id="t-name" label="Full name">
              <Input id="t-name" type="text" name="name" autoComplete="name" />
            </Field>
            <Field id="t-org" label="Organisation">
              <Input id="t-org" type="text" name="org" autoComplete="organization" />
            </Field>
            <Field id="t-role" label="Your role" hint="Points you to the right guided tasks. It never changes what is loaded.">
              <Select
                id="t-role"
                name="role"
                options={['Compliance or risk officer', 'Consultant or advisory firm', 'Internal audit', 'IT or security', 'Other']}
              />
            </Field>
            <button type="submit" className={`btn btn--primary ${f.submit}`}>
              Create my workspace
            </button>
            <p className={f.foot}>
              By continuing you agree to the <Link href={routes.terms}>terms</Link> and <Link href={routes.privacy}>privacy policy</Link>.
            </p>
          </form>
        </>
      ) : (
        <div className={f.done} role="status">
          <span className={f.doneIcon} aria-hidden="true">
            <Icon name="check" size={26} strokeWidth={2.4} />
          </span>
          <h2>Your workspace is ready</h2>
          <p className="lede">We have sent a sign-in link to your work email. The sample workspace is loaded.</p>
          <ButtonLink href={routes.login}>Open Gieom.cloud</ButtonLink>
          <p className="note">Prototype: no email is actually sent.</p>
        </div>
      )}
    </FormCard>
  );
}
