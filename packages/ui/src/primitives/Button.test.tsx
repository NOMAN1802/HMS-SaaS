import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './Button.js';
import { buttonClassName } from './button-styles.js';

describe('Button', () => {
  it('defaults to type=button so it never submits a form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('button');
  });

  it('activates with Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('blocks presses and exposes busy state while loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('has an accessible name from its label', () => {
    render(<IconButton icon="close" label="Close" />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });
});

describe('buttonClassName', () => {
  it('gives a link the same classes as the matching button', () => {
    render(
      <>
        <Button variant="secondary" size="lg">
          Book
        </Button>
        <a href="/book" className={buttonClassName('secondary', 'lg')}>
          Book link
        </a>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Book' });
    const link = screen.getByRole('link', { name: 'Book link' });
    expect(link.className).toBe(button.className);
  });

  it('defaults to primary and medium and appends extra classes', () => {
    expect(buttonClassName()).toContain('bg-primary');
    expect(buttonClassName()).toContain('h-10');
    expect(buttonClassName('ghost', 'md', 'w-full')).toMatch(/w-full$/);
  });
});
