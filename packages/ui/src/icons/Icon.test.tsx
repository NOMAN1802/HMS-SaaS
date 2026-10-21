import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, type IconName } from './Icon.js';

describe('Icon', () => {
  it('renders a decorative svg hidden from assistive technology', () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it.each<IconName>([
    'stethoscope',
    'ambulance',
    'phone',
    'map-pin',
    'facebook',
    'whatsapp',
    'translate',
  ])('renders the public site icon %s', (name) => {
    const { container } = render(<Icon name={name} size={24} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
