import test from 'node:test';
import assert from 'node:assert/strict';
import { getDemoAdminRole, isAdminRole, isDemoModeEnabled, isDemoAdminEmail } from './demo-admin.js';

test('demo admin role is granted to the demo email when demo mode is enabled', () => {
  const original = process.env.DEMO_MODE;
  const originalEmail = process.env.DEMO_ADMIN_EMAIL;
  process.env.DEMO_MODE = 'true';
  process.env.DEMO_ADMIN_EMAIL = 'ADM_teste@undf.edu.br';

  try {
    assert.equal(getDemoAdminRole('ADM_teste@undf.edu.br'), 'gestor');
    assert.equal(isDemoAdminEmail('ADM_teste@undf.edu.br'), true);
    assert.equal(isDemoModeEnabled(), true);
  } finally {
    if (original === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = original;

    if (originalEmail === undefined) delete process.env.DEMO_ADMIN_EMAIL;
    else process.env.DEMO_ADMIN_EMAIL = originalEmail;
  }
});

test('manager and admin roles are treated as privileged admin roles', () => {
  assert.equal(isAdminRole('gestor'), true);
  assert.equal(isAdminRole('administrador'), true);
  assert.equal(isAdminRole('estudante'), false);
});
