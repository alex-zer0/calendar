import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { User } from '@models';

export interface UserAdminParams {
  limit?: number;
  offset?: number;
  dynamicFilter?: string;
}
export interface UserAdminMeta {
  offset: number;
  limit: number;
  totalCount?: number;
}
export interface UserAdminInput {
  rolesIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  constructor(private rest: Rest) {}

  fetchAll(params?: UserAdminParams) {
    const options: UserAdminParams = {};
    Object.keys(params).forEach(key => params[key] != null && (options[key] = params[key]));
    return this.rest.getOrigin<{data: User[], meta: UserAdminMeta}>('UserAdmin', options);
  }

  updateUser(id: string, input: UserAdminInput) {
    return this.rest.patch<User>(`UserAdmin/${id}`, input);
  }
}
