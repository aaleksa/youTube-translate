'use client';

import ToolbarMenu, { type ToolbarMenuItem } from './ToolbarMenu';

export type VocabularyMenuItem = ToolbarMenuItem;

interface VocabularyMenuProps {
  items: VocabularyMenuItem[];
}

export default function VocabularyMenu({ items }: VocabularyMenuProps) {
  const anyLoading = items.some((item) => item.loading);
  const anyActive = items.some((item) => item.active);

  return (
    <ToolbarMenu
      label="📖 More ▾"
      items={items}
      loading={anyLoading}
      active={anyActive}
    />
  );
}
