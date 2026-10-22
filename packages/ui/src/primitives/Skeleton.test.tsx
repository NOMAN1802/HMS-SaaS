import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton.js';

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const block = container.firstElementChild;
    expect(block?.getAttribute('aria-hidden')).toBe('true');
    expect(block?.className).toContain('skeleton');
    expect(block?.className).toContain('rounded-control');
  });

  it('can be round', () => {
    const { container } = render(<Skeleton circle />);
    expect(container.firstElementChild?.className).toContain('rounded-pill');
  });
});
