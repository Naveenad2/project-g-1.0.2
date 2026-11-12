'use client';

import { useState, type FormEvent } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Icon } from '@/components/ui/Icon';
import { routes } from '@/lib/routes';
import { Field, FormCard, Input, Select, Textarea, formStyles as f } from './Field';

const slots = [
  { short: 'Tue 10:00', long: 'Tuesday 10:00' },
  { short: 'Tue 14:00', long: 'Tuesday 14:00' },
  { short: 'Wed 11:00', long: 'Wednesday 11:00' },
  { short: 'Thu 15:00', long: 'Thursday 15:00' },
];

export function DemoForm() {
  const [slot, setSlot] = useState(0);
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <FormCard>
      {!done ? (
        <>
          <h2 style={{ marginBottom: '1.25rem' }}>Pick a time</h2>
          <form className={f.form} onSubmit={submit}>
            <div className={f.row2}>
              <Field id="d-name" label="Full name">
                <Input id="d-name" type="text" name="name" autoComplete="name" />
              </Field>
              <Field id="d-email" label="Work email">
                <Input id="d-email" type="email" name="email" autoComplete="email" />
              </Field>
            </div>
            <Field id="d-org" label="Organisation">
              <Input id="d-org" type="text" name="org" autoComplete="organization" />
            </Field>
            <div className={f.row2}>
              <Field id="d-role" label="Your role">
                <Select
                  id="d-role"
                  name="role"
                  options={[
                    'Compliance officer',
                    'Risk manager',
                    'Internal audit',
                    'Consultant or advisory firm',
                    'IT or security',
                    'Other',
                  ]}
                />
              </Field>
              <Field id="d-size" label="Company size">
                <Select id="d-size" name="size" options={['Under 100 people', '100 to 1,000', '1,000 to 10,000', 'Over 10,000']} />
              </Field>
            </div>
            <Field id="d-clients" label="If you are a consultant: how many clients would you run on it?">
              <Select id="d-clients" name="clients" options={['Not a consultant', '1 to 5', '6 to 20', 'More than 20']} />
            </Field>
            <Field label="Preferred slot (Gulf Standard Time)" group>
              <div className={f.slots}>
                {slots.map((s, i) => (
                  <button key={s.short} type="button" className={f.slot} aria-pressed={slot === i} onClick={() => setSlot(i)}>
                    {s.short}
                  </button>
                ))}
              </div>
            </Field>
            <Field id="d-note" label="Anything you want us to prepare?">
              <Textarea id="d-note" name="note" />
            </Field>
            <button type="submit" className={`btn btn--primary ${f.submit}`}>
              Book the demo
            </button>
            <p className={f.foot}>You will get a calendar invite and a short prep note.</p>
          </form>
        </>
      ) : (
        <div className={f.done} role="status">
          <span className={f.doneIcon} aria-hidden="true">
            <Icon name="check" size={26} strokeWidth={2.4} />
          </span>
          <h2>Booked for {slots[slot].long} GST</h2>
          <p className="lede">
            A calendar invite is on its way. If you would like to look around before we talk, the trial takes two minutes to start.
          </p>
          <ButtonLink href={routes.trial} variant="secondary">
            Start free trial
          </ButtonLink>
          <p className="note">Prototype: no booking is actually made.</p>
        </div>
      )}
    </FormCard>
  );
}
