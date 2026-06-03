import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Modal } from './ui';

const VERSION = __APP_VERSION__;
const CHANGELOG_KEYS = [
  'whatsNew.items.audit',
  'whatsNew.items.geminiVision',
  'whatsNew.items.healthConnect',
  'whatsNew.items.community',
  'whatsNew.items.voice',
  'whatsNew.items.nativeWrapper',
  'whatsNew.items.errorBoundary',
  'whatsNew.items.seo',
] as const;

export const WhatsNewModal: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('culinasync_version') !== VERSION;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (open) {
      localStorage.setItem('culinasync_version', VERSION);
    }
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('whatsNew.title')}
      description={t('whatsNew.description')}
      size="sm"
      priority
      footer={
        <div className="flex justify-end">
          <Button onClick={handleClose}>{t('app.close')}</Button>
        </div>
      }
    >
      <div className="mb-4">
        <Badge tone="accent">v{VERSION}</Badge>
      </div>
      <ul className="list-disc pl-6 text-sm text-zinc-200 space-y-2 ui-stagger">
        {CHANGELOG_KEYS.map((itemKey) => (
          <li key={itemKey}>{t(itemKey)}</li>
        ))}
      </ul>
    </Modal>
  );
};
