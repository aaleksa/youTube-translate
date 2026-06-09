'use client';

import { useEffect, useRef, useState } from 'react';

export interface ToolbarMenuItem {
  id: string;
  label: string;
  loading?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface ToolbarMenuProps {
  label: string;
  loadingLabel?: string;
  items: ToolbarMenuItem[];
  active?: boolean;
  loading?: boolean;
  align?: 'left' | 'right';
}

export default function ToolbarMenu({
  label,
  loadingLabel = '⏳...',
  items,
  active = false,
  loading = false,
  align = 'left',
}: ToolbarMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${
          active || open
            ? 'bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-500 dark:hover:bg-gray-400'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {loading ? loadingLabel : label}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-20 mt-1 min-w-[11rem] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled || item.loading}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition disabled:opacity-50 ${
                item.active
                  ? 'bg-gray-100 dark:bg-gray-700 font-medium'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/80'
              }`}
            >
              {item.loading ? '⏳ ' : ''}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
