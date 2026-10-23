'use client';
// Tabs with automatic activation. Implements: T-UI-01, ADR-022 section 8, F section 7.2.
// Contract: roving tabindex (only the selected tab is in the Tab order); ArrowLeft/ArrowRight,
// Home and End move focus and select; disabled tabs are skipped; every tab names its panel and
// every panel names its tab. Panels stay mounted (hidden) so a tab keeps its state.
import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { useControllableState } from '../hooks/use-controllable-state.js';
import { type MoveIntent, moveIndex } from '../hooks/navigation.js';
import { cx } from '../utils/cx.js';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  /** Accessible name of the tab list, already translated. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
}

const KEY_INTENTS: Record<string, MoveIntent> = {
  ArrowRight: 'next',
  ArrowLeft: 'previous',
  Home: 'first',
  End: 'last',
};

export function Tabs({ tabs, label, value, defaultValue, onValueChange }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? '';
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? firstEnabled,
    onChange: onValueChange,
  });

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const intent = KEY_INTENTS[event.key];
    if (!intent) return;
    event.preventDefault();
    const current = tabs.findIndex((tab) => tab.id === selected);
    const next = moveIndex({
      current,
      count: tabs.length,
      intent,
      isDisabled: (index) => Boolean(tabs[index]?.disabled),
    });
    const target = tabs[next];
    if (target) {
      setSelected(target.id);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div>
      {/* The tablist handles arrow keys for its tabs (roving tabindex pattern). */}
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border"
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              aria-disabled={tab.disabled || undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => !tab.disabled && setSelected(tab.id)}
              className={cx(
                '-mb-px h-11 shrink-0 border-b-2 px-4 font-ui font-medium whitespace-nowrap',
                isSelected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text',
                tab.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== selected}
          tabIndex={0}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
