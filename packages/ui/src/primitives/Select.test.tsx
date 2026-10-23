import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field } from './Field.js';
import { Select } from './Select.js';
import { TextArea } from './TextArea.js';

const options = [
  { value: '', label: 'Any' },
  { value: 'cardiology', label: 'Cardiology' },
];

describe('Select', () => {
  it('is labelled by its field and changes value', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Department">{(control) => <Select {...control} options={options} />}</Field>,
    );
    const select = screen.getByRole('combobox', { name: 'Department' });
    await user.selectOptions(select, 'cardiology');
    expect((select as HTMLSelectElement).value).toBe('cardiology');
  });

  it('marks itself invalid', () => {
    render(<Select aria-label="Department" options={options} invalid />);
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });
});

describe('TextArea', () => {
  it('is labelled by its field', () => {
    render(<Field label="Message">{(control) => <TextArea {...control} />}</Field>);
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeTruthy();
  });
});
