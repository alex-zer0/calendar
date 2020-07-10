import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { PaginationData } from '@app/models';

const maxSize = 7;

@Component({
  selector: 'app-pagination',
  template: `
    <div class="g-pagination" *ngIf="totalPages > 1">
      <ul class="g-pagination__pages">
        <li *ngIf="currentPage > 1" (click)="change(currentPage - 1)">
          <svg width="16" height="17">
            <path d="M13.3332 7.50679H5.19984L8.93317 3.77345L7.99984 2.84012L2.6665 8.17345L7.99984 13.5068L8.93317 12.5735L5.19984 8.84012H13.3332V7.50679Z"/>
          </svg>
        </li>
        <li *ngIf="isFirst" (click)="change(1)">1</li>
        <li *ngIf="isFirst">...</li>
        <li *ngFor="let page of pages" [class.active]="currentPage == page" (click)="change(page)">{{page}}</li>
        <li *ngIf="isLast">...</li>
        <li *ngIf="isLast" (click)="change(totalPages)">{{totalPages}}</li>
        <li *ngIf="currentPage < totalPages" class="g-pagination__next" (click)="change(currentPage + 1)">
          <svg width="16" height="17">
            <path d="M13.3332 7.50679H5.19984L8.93317 3.77345L7.99984 2.84012L2.6665 8.17345L7.99984 13.5068L8.93317 12.5735L5.19984 8.84012H13.3332V7.50679Z"/>
          </svg>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() data: PaginationData;
  @Output() changePage = new EventEmitter<number>();

  isFirst = false;
  isLast = false;
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number;

  ngOnChanges(): void {
    this.generatePages();
  }

  ngOnInit(): void {
    this.generatePages();
  }

  change(page: number) {
    this.changePage.emit((page - 1) * this.data.limit);
  }

  private generatePages() {
    this.totalPages = Math.ceil(this.data.totalCount / this.data.limit); // Общее кол-во страниц
    this.currentPage = Math.floor(this.data.offset / this.data.limit) + 1;
    const A = Math.ceil(this.currentPage - maxSize / 2);
    const B = Math.floor(this.currentPage + maxSize / 2);
    const firstPage = Math.max(A, 1);
    const lastPage = Math.min(B, this.totalPages);

    this.pages = [];
    for (let page = firstPage; page <= lastPage; page += 1) {
      this.pages.push(page);
    }
    this.isLast = this.totalPages - lastPage > 0;
    this.isFirst = firstPage > 1;
  }
}
