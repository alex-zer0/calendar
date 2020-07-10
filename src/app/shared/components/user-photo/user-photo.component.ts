import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-photo',
  template: `
    <div
      class="user-photo"
      [style.width]="size + 'px'"
      [style.minWidth]="size + 'px'"
      [style.height]="size + 'px'"
    >
      <img
        [src]="'https://mds-api.backend.ru/api/v1.0/UserPhoto/' + hash + '?renditionId=1'"
        [attr.alt]="alt"
        [attr.width]="size"
        [attr.height]="size"
      />
    </div>
  `,
  styleUrls: ['./user-photo.component.scss']
})
export class UserPhotoComponent {
  @Input() size = 40;
  @Input() hash: string;
  @Input() alt = '';
}
