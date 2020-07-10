import { RealEstate } from './real-estate';

export interface Floor {
  guid: string;
  number: string;
  fromCrm: boolean;
  sectionId: number;
  realEstates: RealEstate[];
  id: number;
  created: string;
  modified: string;
}
