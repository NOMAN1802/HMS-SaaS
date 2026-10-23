// Site catalog checks (T-WEB-01, P-024, AT-WEB-002): English and Bangla define the same keys and
// placeholders, nothing is empty, and every key is used somewhere in apps/site.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { siteMessages } from './index.js';

type Tree = { [key: string]: string | Tree };

const flatten = (tree: Tree, prefix = ''): Map<string, string> =>
  new Map(
    Object.entries(tree).flatMap(([key, value]) =>
      typeof value === 'string'
        ? [[`${prefix}${key}`, value]]
        : [...flatten(value, `${prefix}${key}.`)],
    ),
  );

const argumentsOf = (message: string): string[] =>
  [...message.matchAll(/\{(\w+)/g)].map((match) => match[1] as string).sort();

const en = flatten(siteMessages.en);
const bn = flatten(siteMessages['bn-BD']);

describe('site catalogs', () => {
  it('define the same keys in English and Bangla', () => {
    expect([...bn.keys()].sort()).toEqual([...en.keys()].sort());
  });

  it('have no empty message and the same arguments in both languages', () => {
    for (const [key, value] of en) {
      expect(value.trim(), key).not.toBe('');
      expect((bn.get(key) ?? '').trim(), key).not.toBe('');
      expect(argumentsOf(bn.get(key) ?? ''), key).toEqual(argumentsOf(value));
    }
  });

  it('use every key in apps/site', () => {
    const siteRoot = fileURLToPath(new URL('../../../apps/site/', import.meta.url));
    const text = ['app', 'src']
      .flatMap((dir) => {
        try {
          return readdirSync(`${siteRoot}${dir}`, { recursive: true, encoding: 'utf8' })
            .filter((file) => /\.tsx?$/.test(file) && !file.includes('.test.'))
            .map((file) => readFileSync(`${siteRoot}${dir}/${file}`, 'utf8'));
        } catch {
          return []; // the site app is not present in this checkout
        }
      })
      .join('\n');
    // Keys are used as `t('placeholder.heading')` with a namespace-free translator.
    const unused = [...en.keys()].filter((key) => !text.includes(`'${key}'`));
    expect(unused).toEqual([]);
  });
});
