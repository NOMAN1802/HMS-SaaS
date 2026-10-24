// Reuse guardrails: lint rules that keep feature code on the shared design system.
// Implements: T-UI-01, ADR-022 section 9 (rules 1 to 3 and 6), ADR-002 evidence item 1.
//
// Feature screens (apps/web) compose components from @hms/ui; they never write a raw widget,
// a color literal or their own money/date formatting. Tests and e2e specs are exempt.

// `String.raw` keeps the backslashes that esquery's regex selectors need.
const HEX_COLOR = String.raw`#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b`;
const COLOR_FUNCTION = String.raw`\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(`;

const colorSelectors = [
  {
    selector: `Literal[value=/${HEX_COLOR}/]`,
    message: 'Color literals live in packages/ui styles only. Use a semantic token class.',
  },
  {
    selector: `Literal[value=/${COLOR_FUNCTION}/]`,
    message: 'Color functions live in packages/ui styles only. Use a semantic token class.',
  },
  {
    selector: `TemplateElement[value.raw=/${HEX_COLOR}/]`,
    message: 'Color literals live in packages/ui styles only. Use a semantic token class.',
  },
];

const formattingSelectors = [
  {
    selector:
      "MemberExpression[object.name='Intl'][property.name=/^(NumberFormat|DateTimeFormat|RelativeTimeFormat|ListFormat)$/]",
    message: 'Format numbers, money and dates with the packages/i18n formatters only.',
  },
  {
    selector: 'CallExpression[callee.property.name=/^toLocale(String|DateString|TimeString)$/]',
    message: 'Format numbers, money and dates with the packages/i18n formatters only.',
  },
];

const rawWidgetSelector = {
  selector:
    "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^(button|input|select|textarea|dialog)$/]",
  message:
    'Use the component from @hms/ui (Button, TextInput, Dialog, ...). Raw interactive elements live in packages/ui only.',
};

const useServerSelector = {
  selector: "ExpressionStatement > Literal[value='use server']",
  message:
    "'use server' is not allowed in apps/web or apps/site: business writes go through the API (ADR-002).",
};

const iconImportRestriction = {
  patterns: [
    {
      group: ['@phosphor-icons/*'],
      message: 'Import icons only through the Icon component in @hms/ui (ADR-022 section 10).',
    },
  ],
};

const testFiles = ['**/*.test.{ts,tsx,js}', 'apps/web/e2e/**', 'apps/site/e2e/**'];

// The public site (apps/site) follows the same reuse rules as the staff app (P-030).
export const webGuardrails = [
  {
    name: 'hms/web-guardrails',
    files: ['apps/web/**/*.{ts,tsx}', 'apps/site/**/*.{ts,tsx}'],
    ignores: testFiles,
    rules: {
      'no-restricted-syntax': [
        'error',
        rawWidgetSelector,
        useServerSelector,
        ...colorSelectors,
        ...formattingSelectors,
      ],
      'no-restricted-imports': ['error', iconImportRestriction],
    },
  },
];

export const uiGuardrails = [
  {
    name: 'hms/ui-guardrails',
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    ignores: testFiles,
    rules: {
      'no-restricted-syntax': ['error', ...colorSelectors, ...formattingSelectors],
    },
  },
  {
    name: 'hms/ui-icon-import',
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    ignores: [...testFiles, 'packages/ui/src/icons/**'],
    rules: {
      'no-restricted-imports': ['error', iconImportRestriction],
    },
  },
];
