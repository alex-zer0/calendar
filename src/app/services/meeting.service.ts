import { Injectable } from '@angular/core';
import { Rest } from './rest.service';
import { WorkControlData, Meeting, MeetingInfo, MeetingsListParams, MeetingsListMeta } from '@models';
import { CalendarService } from './calendar.service';
import { mapTo } from 'rxjs/operators';

interface RejectInput {
  meetingId: number;
  comment: string;
  declineReasonId: number;
  files: File[];
  link: string;
}

interface FixResultInput {
  meetingId: number;
  comment: string;
  files: File[];
  link: string;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private meetingFiles: File[] = [];

  constructor(
    private rest: Rest,
    private calendarService: CalendarService
  ) {}

  fetchAll() {
    return this.rest.get<Meeting[]>('Meeting');
  }

  fetchList(params: MeetingsListParams & MeetingsListMeta) {
    const options: MeetingsListParams = {};
    Object.keys(params).forEach(key => params[key] != null && (options[key] = params[key]));
    return this.rest.getOrigin<{data: MeetingInfo[], meta: MeetingsListMeta}>('Meeting/list', options);
  }

  fetchById(id: number) {
    return this.rest.get<Meeting>(`Meeting/${id}`);
  }

  removeById(id: number) {
    return this.rest.delete<Meeting>(`Meeting/${id}`);
  }

  updateMeeting(id: number, data: WorkControlData) {
    return this.rest.patch<Meeting>(`Meeting/${id}`, this.getMeetingFormData(data, true));
  }

  createMeeting(data: WorkControlData) {
    return this.rest.post<{}>('Meeting', this.getMeetingFormData(data));
  }

  confirmMeeting(id: number) {
    return this.rest.get<boolean>(`Meeting/confirm/${id}`)
      .pipe(mapTo(true));
  }

  rejectMeeting(data: RejectInput) {
    return this.rest.post<boolean>('Meeting/reject', this.mapToFormData(data))
      .pipe(mapTo(true));
  }

  fixResult(data: FixResultInput) {
    return this.rest.post<boolean>('Meeting/fix-result', this.mapToFormData(data))
      .pipe(mapTo(true));
  }

  fetchDocumentsForWork() {
    return this.rest.get<[]>('Meeting/documentsForWork');
  }

  fetchMeetingFiles(): File[] {
    return this.meetingFiles || [];
  }

  storeMeetingFiles(files: File[] = []): void {
    this.meetingFiles = files;
  }

  clearMeetingFiles(): void {
    this.meetingFiles = [];
  }

  private getMeetingFormData(data: WorkControlData, isUpdate?: boolean): FormData {
    const { objectId, metaInfo, checkLists, livingComplexId, date, time } = data;
    const formData = new FormData();
    const meetingRequest: any = {
      objectId,
      metaInfo: {
        sections: metaInfo.sections.map((section) => {
          const { floorNames, realEstateNames, sectionName, ...rest } = section;
          return { ...rest };
        })
      },
      checkLists: checkLists.map(({ checklistId, axis, highMark, scope = null }) =>
        ({ checklistId, axis, highMark, scope }))
    };
    if (!isUpdate || data.globalId) {
      meetingRequest.livingComplexId = livingComplexId;
      meetingRequest.start = this.calendarService.parseDateTime(date, time.start);
      meetingRequest.end = this.calendarService.parseDateTime(date, time.end);
    } else {
      return meetingRequest;
    }
    if (data.globalId) {
      meetingRequest.user = { globalId: data.globalId };
      return meetingRequest;
    }
    formData.append('meetingRequest', JSON.stringify(meetingRequest));
    if (this.meetingFiles) {
      this.meetingFiles.forEach(f => formData.append('files', f, f.name));
    }
    return formData;
  }

  private mapToFormData = (input: RejectInput|FixResultInput) => {
    const { files, ...rest } = input;
    const formData = new FormData();
    formData.append('request', JSON.stringify({ ...rest }));
    if (files) {
      files.forEach(f => formData.append('files', f, f.name));
    }
    return formData;
  }
}
