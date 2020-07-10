import { AccessRules } from './access-rules';

export interface AuthConfig {
  accessRules: AccessRules[];
  roleIds: number[];
}
