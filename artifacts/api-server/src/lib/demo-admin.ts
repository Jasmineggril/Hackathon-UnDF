export const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? 'ADM_teste@undf.edu.br';
export const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? '123456';
export const DEMO_ADMIN_ROLE = 'gestor';

export function isDemoModeEnabled() {
  return (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
}

export function isDemoAdminEmail(email?: string | null) {
  return !!email && email.toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase();
}

export function isAdminRole(role?: string | null) {
  return role === 'gestor' || role === 'administrador';
}

export function getDemoAdminRole(email?: string | null) {
  if (!isDemoModeEnabled()) return null;
  return isDemoAdminEmail(email) ? DEMO_ADMIN_ROLE : null;
}

export function shouldUseDemoAdminAccount(email?: string | null) {
  return isDemoModeEnabled() && isDemoAdminEmail(email);
}

export function getDemoAdminCredentials() {
  return {
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
  };
}

export function isDemoRecord(record: { protocol?: string | null; title?: string | null; content?: string | null }) {
  const combined = `${record.protocol ?? ''} ${record.title ?? ''} ${record.content ?? ''}`.toLowerCase();
  return combined.includes('demo') || (record.protocol ?? '').toLowerCase().startsWith('demo-');
}

export function filterDemoRecords<T extends { protocol?: string | null; title?: string | null; content?: string | null }>(records: T[]) {
  if (!isDemoModeEnabled()) return records;
  return records.filter((record) => isDemoRecord(record));
}
