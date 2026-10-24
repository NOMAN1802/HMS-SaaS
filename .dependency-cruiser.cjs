// Dependency rules from D §5 (NFR-MAINT-001). A violation fails `pnpm boundaries:check`.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-app-to-app',
      comment: 'apps/* never import from other apps/* (rule 1)',
      severity: 'error',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/([^/]+)/', pathNot: '^apps/$1/' },
    },
    {
      name: 'web-allowed-packages-only',
      comment: 'web imports only contracts, ui, i18n, print-templates (rule 2)',
      severity: 'error',
      from: { path: '^apps/web/' },
      to: {
        path: '^(packages/|@hms/)(database|platform|authz|testkit|domain-kernel|mod-[^/]+)(/|$)',
      },
    },
    {
      name: 'site-allowed-packages-only',
      comment: 'the public site imports only ui, i18n and contracts (site plan P-030)',
      severity: 'error',
      from: { path: '^apps/site/' },
      to: { path: '^(packages/|@hms/)(?!(ui|i18n|contracts)(/|$))[^/]+' },
    },
    {
      name: 'ui-imports-i18n-only',
      comment: 'packages/ui imports only i18n among workspace packages (ADR-022 section 9, rule 4)',
      severity: 'error',
      from: { path: '^packages/ui/src/' },
      to: {
        path: '^(packages/|@hms/)(database|platform|authz|testkit|domain-kernel|contracts|print-templates|mod-[^/]+)(/|$)',
      },
    },
    {
      name: 'packages-never-import-apps',
      comment: 'shared packages never depend on an application (D section 5)',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'no-unresolvable',
      comment: 'every import must resolve (an undeclared workspace dependency shows up here)',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'module-public-entry-only',
      comment: 'mod-X imports mod-Y only through its public index (rule 3)',
      severity: 'error',
      from: { path: '^packages/(mod-[^/]+)/' },
      to: { path: '^packages/(mod-[^/]+)/src/(?!index\\.ts$)', pathNot: '^packages/$1/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    // Workspace imports resolve to packages/*/dist: record them, but don't cruise built output.
    doNotFollow: { path: ['node_modules', '^packages/[^/]+/dist/'] },
    exclude: { path: '^(apps|packages)/[^/]+/(\\.next|coverage)/|/generated/' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.d.ts'],
    },
    combinedDependencies: true,
  },
};
