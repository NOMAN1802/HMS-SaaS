import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('is named by its label and toggles from the label and with Space', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Cashier" checked={false} onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Cashier' });
    await user.click(screen.getByText('Cashier'));
    box.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
