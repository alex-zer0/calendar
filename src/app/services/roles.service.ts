import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { Role } from '@models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private rest: Rest) {}

  fetchAll() {
    return this.rest.get<Role[]>('Roles?limit=100');
  }
}
