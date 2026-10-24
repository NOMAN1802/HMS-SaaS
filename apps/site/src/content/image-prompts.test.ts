// Every image slot used in the content has a prompt in content/image-prompts.md, so nothing is
// left as a placeholder by accident when images are generated (C-065, T-WEB-14 acceptance).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { rawContent } from './load';

function slotsIn(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) slotsIn(item, found);
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.slot === 'string' && 'alt' in record) found.add(record.slot);
    for (const item of Object.values(record)) slotsIn(item, found);
  }
  return found;
}

describe('image prompts (T-WEB-14)', () => {
  it('cover every image slot in the content', () => {
    const prompts = readFileSync(
      fileURLToPath(new URL('../../content/image-prompts.md', import.meta.url)),
      'utf8',
    );
    const missing = [...slotsIn(rawContent)].filter((slot) => !prompts.includes(`### \`${slot}\``));
    expect(missing).toEqual([]);
  });
});
