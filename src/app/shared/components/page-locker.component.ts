import { Component } from '@angular/core';

@Component({
  selector: 'app-page-locker',
  template: `
    <div class="page-locker">
      <svg
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 150 150"
        width="150"
        height="150"
        class="spinner-icon"
      >
        <circle fill="none" cx="50%" cy="50%" r="45"></circle>
      </svg>
    </div>
  `,
  styleUrls: ['./page-locker.component.scss']
})
export class PageLockerComponent {}
