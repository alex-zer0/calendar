import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { User } from '@models';

interface UserParams {
  dynamicFilter: string;
}
interface UserComfortParams {
  objectId: number;
  livingComplexId: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private rest: Rest) {}

  fetchAll(params?: UserParams) {
    return this.rest.get<User[]>('User', params);
  }

  fetchComfort(params?: UserComfortParams) {
    return this.rest.get<User[]>('User/list-comfort', params);
  }
}
