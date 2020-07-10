import { AuthEnvironment } from '@auth/core';

export const environment = {
  api: 'https://api.test.rc.backend.ru/api/v1.0/',
  auth: {
    authEnvironment: AuthEnvironment.test,
    client_id: 'calendar_spa',
    scope: 'openid offline_access calendar_api',
  },
  needAuth: true,
  production: false
};
