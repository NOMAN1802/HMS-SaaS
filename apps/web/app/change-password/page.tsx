'use client';
// Change password (T-ACC-05; FR-ACC-007): the forced step after an administrator set a
// temporary password, or a voluntary change from the account menu.
import { AuthLayout } from '@hms/ui';
import { useTranslations } from 'next-intl';
import { Brand } from '../../src/components/brand';
import { ChangePasswordForm } from '../../src/components/change-password-form';
import { FullScreenStatus } from '../../src/components/full-screen-status';
import { LanguageControl } from '../../src/components/language-control';
import { useAccess } from '../../src/session/use-access';

export default function ChangePasswordPage() {
  const t = useTranslations();
  const access = useAccess('account');

  if (access.status !== 'ready' || !access.session) {
    return <FullScreenStatus>{t('common.loading')}</FullScreenStatus>;
  }
  return (
    <AuthLayout brand={<Brand name={t('app.name')} />} topEnd={<LanguageControl />}>
      <ChangePasswordForm forced={access.session.passwordChangeRequired} />
    </AuthLayout>
  );
}
