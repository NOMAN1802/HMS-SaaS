// Cross-reference checks that a schema alone cannot make: every slug a record points to must
// exist, keys must be unique, and icon names must exist in @hms/ui. A broken reference fails the
// build instead of rendering a dead link (AT-WEB-003). Implements: T-WEB-04, E section 1.
import type {
  Article,
  Branch,
  Centre,
  Department,
  Doctor,
  HealthPackage,
  JobOpening,
  MenuItem,
  Page,
  Section,
  Site,
  TestPrice,
} from '@hms/contracts';
import { isIconName } from '@hms/ui';

export interface ContentSet {
  site: Site;
  pages: Record<string, Page>;
  departments: Department[];
  centres: Centre[];
  doctors: Doctor[];
  packages: HealthPackage[];
  tests: TestPrice[];
  branches: Branch[];
  articles: Article[];
  jobs: JobOpening[];
}

type Kind = 'departments' | 'centres' | 'doctors' | 'branches';

/** Collects error messages while checks run; each check adds at most one line. */
class Checker {
  readonly errors: string[] = [];
  private readonly known: Record<Kind, Set<string>>;

  constructor(content: ContentSet) {
    this.known = {
      departments: new Set(content.departments.map((d) => d.slug)),
      centres: new Set(content.centres.map((c) => c.slug)),
      doctors: new Set(content.doctors.map((d) => d.slug)),
      branches: new Set(content.branches.map((b) => b.slug)),
    };
  }

  ref(owner: string, kind: Kind, slug: string): void {
    if (!this.known[kind].has(slug)) this.errors.push(`${owner}: unknown ${kind} entry "${slug}"`);
  }

  icon(owner: string, icon: string): void {
    if (!isIconName(icon)) this.errors.push(`${owner}: unknown icon "${icon}"`);
  }

  unique(name: string, values: string[]): void {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) this.errors.push(`duplicate ${name} "${value}"`);
      seen.add(value);
    }
  }

  fail(message: string): void {
    this.errors.push(message);
  }
}

function checkUniqueKeys(check: Checker, content: ContentSet): void {
  check.unique(
    'department',
    content.departments.map((d) => d.slug),
  );
  check.unique(
    'centre',
    content.centres.map((c) => c.slug),
  );
  check.unique(
    'doctor',
    content.doctors.map((d) => d.slug),
  );
  check.unique(
    'package',
    content.packages.map((p) => p.slug),
  );
  check.unique(
    'test',
    content.tests.map((t) => t.code),
  );
  check.unique(
    'branch',
    content.branches.map((b) => b.slug),
  );
  check.unique(
    'article',
    content.articles.map((a) => a.slug),
  );
}

function checkDoctor(check: Checker, doctor: Doctor): void {
  const owner = `doctor ${doctor.slug}`;
  check.ref(owner, 'departments', doctor.department);
  for (const slug of doctor.branches) check.ref(owner, 'branches', slug);
  for (const row of doctor.schedule) {
    check.ref(owner, 'branches', row.branch);
    if (row.start >= row.end) check.fail(`${owner}: schedule on ${row.day} ends before it starts`);
  }
  for (const leave of doctor.leave) {
    if (leave.from > leave.to) check.fail(`${owner}: leave ends before it starts`);
  }
}

// Both amounts are exact two-decimal strings, so comparing integer paisa is exact (ADR-007).
const paisa = (amount: string) => BigInt(amount.replace('.', ''));

function checkCatalog(check: Checker, content: ContentSet): void {
  for (const department of content.departments) {
    check.icon(`department ${department.slug}`, department.icon);
    if (department.centre) check.ref(`department ${department.slug}`, 'centres', department.centre);
  }
  for (const centre of content.centres) {
    for (const slug of centre.departments) check.ref(`centre ${centre.slug}`, 'departments', slug);
  }
  for (const doctor of content.doctors) checkDoctor(check, doctor);
}

function checkPricesAndPosts(check: Checker, content: ContentSet): void {
  for (const item of content.packages) {
    if (paisa(item.price) > paisa(item.separatePrice)) {
      check.fail(`package ${item.slug}: package price is above the separate total`);
    }
  }
  for (const test of content.tests) {
    for (const slug of test.branches) check.ref(`test ${test.code}`, 'branches', slug);
  }
  for (const article of content.articles) {
    if (article.author) check.ref(`article ${article.slug}`, 'doctors', article.author);
    if (article.department) check.ref(`article ${article.slug}`, 'departments', article.department);
  }
  for (const job of content.jobs) check.ref(`job ${job.id}`, 'branches', job.location);
}

function checkSection(check: Checker, owner: string, section: Section): void {
  switch (section.type) {
    case 'quickActions':
      for (const item of section.props.items) check.icon(owner, item.icon);
      break;
    case 'centreCards':
      for (const slug of section.props.centres) check.ref(owner, 'centres', slug);
      break;
    case 'featuredDoctors':
      if (Array.isArray(section.props.doctors)) {
        for (const slug of section.props.doctors) check.ref(owner, 'doctors', slug);
      }
      break;
    case 'appointmentRequest':
      if (section.props.department) check.ref(owner, 'departments', section.props.department);
      break;
    default:
      break;
  }
}

function checkPages(check: Checker, pages: Record<string, Page>): void {
  for (const [name, page] of Object.entries(pages)) {
    for (const section of page.sections)
      checkSection(check, `page ${name}, section ${section.id}`, section);
  }
}

function menuHrefs(items: MenuItem[]): string[] {
  return items.flatMap((item) => [item.href, ...menuHrefs(item.children ?? [])]);
}

/** Detail links in menus must point at records that exist. */
function checkNavigation(check: Checker, site: Site): void {
  check.ref('site settings', 'branches', site.settings.defaultBranch);
  const hrefs = [
    ...menuHrefs(site.navigation.header),
    ...menuHrefs(site.navigation.topBar),
    ...site.footer.columns.flatMap((column) => menuHrefs(column.links)),
  ];
  for (const href of hrefs) {
    const match = /^\/(departments|doctors|centres)\/([a-z0-9-]+)$/.exec(href);
    if (match) check.ref('navigation', match[1] as Kind, match[2] as string);
  }
}

/** Returns one message per broken reference; an empty list means the content is consistent. */
export function findReferenceErrors(content: ContentSet): string[] {
  const check = new Checker(content);
  checkUniqueKeys(check, content);
  checkCatalog(check, content);
  checkPricesAndPosts(check, content);
  checkPages(check, content.pages);
  checkNavigation(check, content.site);
  return check.errors;
}
