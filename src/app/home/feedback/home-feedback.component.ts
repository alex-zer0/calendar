import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TechSupportService } from '@services';

enum Statuses {
  ERROR = 'Error',
  COMPLETED = 'Completed'
}

@Component({
  selector: 'app-home-feedback',
  templateUrl: './home-feedback.component.html',
  styleUrls: ['./home-feedback.component.scss']
})
export class HomeFeedbackComponent implements OnInit {
  form: FormGroup;
  status: string;
  statuses = Statuses;

  constructor(
    private supportService: TechSupportService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      fio: [null, Validators.required],
      organization: [null, Validators.required],
      inn: [null, [Validators.required, Validators.pattern(/^\d{10,12}$/)]],
    });
    const control = this.form.get('inn');
    control.valueChanges
      .subscribe((val) => {
        const str = val ? String(val) : '';
        if (str.length > 12) {
          control.setValue(Number(str.slice(0, 12)), { emitEvent: false });
        }
      });
  }

  sendFeedback() {
    this.supportService.lackOfAccess(this.form.getRawValue())
      .pipe(catchError((err) => {
        this.status = Statuses.ERROR;
        console.error(err);
        return EMPTY;
      }))
      .subscribe(() => this.status = Statuses.COMPLETED);
  }
}
