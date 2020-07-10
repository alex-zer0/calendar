import { Component, Input, Output, EventEmitter } from '@angular/core';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-file-upload',
  template: `
    <button *ngIf="!file" class="btn btn-default">
      <input type="file" (change)="uploadFile($event)"/>
      <svg width="16" height="16">
        <use xlink:href="#attachment"></use>
      </svg>
      Загрузить новый документ
    </button>

    <div *ngIf="file" class="file-upload-control">
      <div class="file-upload-control__main">
        <div class="file-upload-control__icon">
          <svg width="20" height="20">
            <use xlink:href="#file-o"></use>
          </svg>
        </div>
        <div class="file-upload-control__info">
          <span class="file-upload-control__file-name">
            {{ file.name }}
          </span>
          <span class="file-upload-control__title">{{ title }}</span>
        </div>
      </div>
      <a class="link" (click)="remove.emit()">Удалить</a>
    </div>
  `,
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() title: string;
  @Input() file: File;
  @Output() upload = new EventEmitter<File>();
  @Output() remove = new EventEmitter();

  uploadFile(event: HTMLInputEvent) {
    if (!event.target.files.length) {
      return;
    }
    this.upload.emit(event.target.files[0]);
  }
}
