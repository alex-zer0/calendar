import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { TechSupportConfig } from '@app/models';

interface LackOfAccessParams {
  fio: string;
  organization: string;
  inn: number;
}

interface LackOfUsersParams {
  livingComplexName: string;
  objectName: string;
  checklistsNames: string[];
}

interface ConfigurationParams {
  type: number;
}

export interface ConfigurationInput {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class TechSupportService {
  constructor(private rest: Rest) {}

  lackOfAccess(params: LackOfAccessParams) {
    return this.rest.post<boolean>('TechSupport/lack-of-access', params);
  }

  lackOfUsers(params: LackOfUsersParams) {
    return this.rest.post<boolean>('TechSupport/lack-of-users', params);
  }

  getConfiguration(params?: ConfigurationParams) {
    return this.rest.get<TechSupportConfig[]>('TechSupport/configuration', params);
  }

  updateConfiguration(input: ConfigurationInput) {
    return this.rest.post<TechSupportConfig>('TechSupport/configuration-update', input);
  }
}
