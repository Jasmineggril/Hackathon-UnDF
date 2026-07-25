import { createRoot } from 'react-dom/client';
import { AuthProvider, supabase } from '@workspace/auth-web';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import App from './App';

import './index.css';

setAuthTokenGetter(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
