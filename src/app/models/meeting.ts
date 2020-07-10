import { User } from './index';

export interface MeetingObject {
  name: string;
  commercialName: string;
  shortName: string;
  code1C: string;
  directionId: number;
  cityId: number;
  projectId: number;
  livingComplexId: number;
  livingComplexName: string;
  objectCategoryId: number;
  objectKindId: number;
  objectSeriesId: number;
  objectTypeId: number;
  objectProjectTypeId: number;
  guid1c: string;
  isRenovation: true;
  id: number;
  created: string;
  modified: string;
}

export interface MeetingCheckList {
  checklistTitle: string;
  checklistId: number;
  scope: string;
  axis: string;
  highMark: string;
  id: number;
  created: string;
  modified: string;
}

export interface MeetingType {
  meetingId: number;
  typeId: number;
  typeName: string;
  id: number;
  created: string;
  modified: string;
}

export interface MeetingDocument {
  meetingId: number;
  documentName: string;
  documentBucket: string;
  documentPath: string;
  docId: string;
  id: number;
  created: string;
  modified: string;
}

export interface MeetingStatus {
  id: number;
  name: string;
}

export interface MeetingFloor {
  id: number;
  name: string;
}

export interface MeetingRealEstate {
  id: number;
  name: string;
}

export interface MeetingSection {
  sectionId: number;
  sectionName: string;
  floors: MeetingFloor[];
  realEstates: MeetingRealEstate[];
}

export interface MeetingMetaInfo {
  sections: MeetingSection[];
}

export interface MeetingResolution {
  comment: string;
  description: string;
  resolutionDate: string;
  resolutionUser: string;
}

export interface Meeting {
  name: string;
  objectId: number;
  meetingStartDate: string;
  meetingEndDate: string;
  status: MeetingStatus;
  object: MeetingObject;
  checklists: MeetingCheckList[];
  meetingTypes: MeetingType[];
  documents: MeetingDocument[];
  id: number;
  created: string;
  modified: string;
  users: User[];
  metaInfo: MeetingMetaInfo;
  isReadOnly: boolean;
  resolution: MeetingResolution;
}

export interface MeetingInfo {
  meetingEndDate: string;
  objectName: string;
  objectId: number;
  status: MeetingStatus;
  id: number;
  created: string;
  modified: string;
}

export interface MeetingsListMeta {
  offset: number;
  limit: number;
  totalCount?: number;
}

export interface MeetingsListParams {
  statusId?: MeetingStatusIdEnum;
  panelType?: number;
  date?: string;
}

export enum MeetingStatusIdEnum {
  IN_PROGRESS = 10,
  CANCELLED = 20,
  REJECTED = 30, // IsPlucked
  CONTROL_CONFIRMATION = 40, // IsAwaitingControlConfirmation
  ADMIN_CONFIRMATION = 50, // IsAwaitingAdminConfirmation
  COMPLETED = 60,
  DISTRIBUTION = 70, // IsAwaitingDistribution
  UNKNOWN = 100,
}
