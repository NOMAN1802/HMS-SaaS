// Section title row: heading, optional supporting line and an optional "view all" link at the end
// (F section 3). Implements: T-WEB-06.
import { Icon } from '@hms/ui';
import type { ReactNode } from 'react';
import { SiteLink } from './site-link';

export interface SectionHeadingProps {
  heading: string;
  text?: string;
  action?: { label: string; href: string };
  id?: string;
  children?: ReactNode;
}

export function SectionHeading({ heading, text, action, id }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id={id} className="text-2xl font-semibold sm:text-3xl">
          {heading}
        </h2>
        {text ? <p className="mt-2 text-text-muted">{text}</p> : null}
      </div>
      {action ? (
        <SiteLink
          href={action.href}
          className="inline-flex min-h-10 items-center gap-1 font-ui font-medium text-primary underline-offset-4 hover:underline"
        >
          {action.label}
          <Icon name="arrow-right" size={18} />
        </SiteLink>
      ) : null}
    </div>
  );
}
