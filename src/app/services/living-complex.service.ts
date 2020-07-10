import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { LivingComplex } from '@models';

interface LivingComplexRequestParams {
  sortBy?: string;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class LivingComplexService {
  constructor(private rest: Rest) {}

  fetchAll(params: LivingComplexRequestParams) {
    return this.rest.get<LivingComplex[]>('LivingComplex', params);
  }
}
