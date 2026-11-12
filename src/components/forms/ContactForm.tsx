'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { routes } from '@/lib/routes';
import { Field, FormCard, Input, Select, Textarea, formStyles as f } from './Field';

export function ContactForm() {
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <FormCard>
      {!done ? (
        <>
          <h2 style={{ marginBottom: '1.25rem' }}>Send a message</h2>
          <form className={f.form} onSubmit={submit}>
            <Field id="c-topic" label="Topic">
              <Select id="c-topic" name="topic" options={['Sales', 'Support', 'Partnerships', 'Security', 'Press', 'Something else']} />
            </Field>
            <div className={f.row2}>
              <Field id="c-name" label="Full name">
                <Input id="c-name" type="text" name="name" autoComplete="name" />
              </Field>
              <Field id="c-email" label="Work email">
                <Input id="c-email" type="email" name="email" autoComplete="email" />
              </Field>
            </div>
            <Field id="c-org" label="Organisation">
              <Input id="c-org" type="text" name="org" autoComplete="organization" />
            </Field>
            <Field id="c-msg" label="Message">
              <Textarea id="c-msg" name="message" />
            </Field>
            <button type="submit" className={`btn btn--primary ${f.submit}`}>
              Send message
            </button>
            <p className={f.foot}>
              We use your details to reply and for nothing else. <Link href={routes.privacy}>Privacy policy</Link>.
            </p>
          </form>
        </>
      ) : (
        <div className={f.done} role="status">
          <span className={f.doneIcon} aria-hidden="true">
            <Icon name="check" size={26} strokeWidth={2.4} />
          </span>
          <h2>Message sent</h2>
          <p className="lede">Thank you. Someone will reply within two business days.</p>
          <p className="note">Prototype: no message is actually sent.</p>
        </div>
      )}
    </FormCard>
  );
}
