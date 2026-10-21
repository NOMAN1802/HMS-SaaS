// Department card for grids: icon, name and one-line summary, linking to the department page.
// Implements: T-WEB-06, T-WEB-08, FR-WEB-DEP-001.
import type { Department } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { Icon, isIconName } from '@hms/ui';
import { localize } from '../content/localize';
import { Link } from '../i18n/navigation';

export function DepartmentCard({ department, locale }: { department: Department; locale: Locale }) {
  return (
    <Link
      href={`/departments/${department.slug}`}
      className="group flex h-full flex-col gap-3 rounded-panel border border-border bg-surface p-4 lift sm:p-5"
    >
      <span className="flex size-12 items-center justify-center rounded-pill bg-primary-soft text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary">
        <Icon name={isIconName(department.icon) ? department.icon : 'stethoscope'} size={26} />
      </span>
      <span className="font-heading text-lg font-semibold text-heading group-hover:text-primary">
        {localize(department.name, locale)}
      </span>
      <span className="hidden text-sm text-text-muted sm:block">
        {localize(department.summary, locale)}
      </span>
    </Link>
  );
}
