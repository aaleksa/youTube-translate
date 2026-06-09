'use client';

import { useI18n } from './InterfaceLanguageProvider';
import ToolbarMenu, { type ToolbarMenuItem } from './ToolbarMenu';

export type VocabularyMenuItem = ToolbarMenuItem;

interface VocabularyMenuProps {
  items: VocabularyMenuItem[];
}

export default function VocabularyMenu({ items }: VocabularyMenuProps) {
  const { t } = useI18n();
  const anyLoading = items.some((item) => item.loading);
  const anyActive = items.some((item) => item.active);

  return (
    <ToolbarMenu
      label={t('actions.vocabularyMore')}
      loadingLabel={t('common.loading')}
      items={items}
      loading={anyLoading}
      active={anyActive}
    />
  );
}
