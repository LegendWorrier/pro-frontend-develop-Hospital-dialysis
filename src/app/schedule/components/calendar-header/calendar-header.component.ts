import { Component, OnDestroy, ChangeDetectorRef, Inject, OnInit, EventEmitter } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent<D> implements OnDestroy, OnInit {
  public static currentHeader: CalendarHeaderComponent<any>;
  public static get currentHeaderChange() {
    return this.onHeader.asObservable();
  }
  private static onHeader = new EventEmitter<CalendarHeaderComponent<any>>();

  private _destroyed = new Subject<void>();

  getCalendar(): MatCalendar<D> {
    return this._calendar;
  }

  constructor(
      private _calendar: MatCalendar<D>, private _dateAdapter: DateAdapter<D>,
      @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats, cdr: ChangeDetectorRef) {
    _calendar.stateChanges
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => cdr.markForCheck());
  }

  ngOnInit(): void {
    console.log('a calendar header has been created.');
    CalendarHeaderComponent.currentHeader = this;
    CalendarHeaderComponent.onHeader.emit(this);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
        .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
  }

  previous() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1);
  }

  next() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1);
  }

  get isPrevious() {
    return this._dateAdapter.getMonth(this._calendar.activeDate) > this._dateAdapter.getMonth(this._calendar.minDate)
          || this._dateAdapter.getYear(this._calendar.activeDate) > this._dateAdapter.getYear(this._calendar.minDate);
  }

  get isNext() {
    return this._dateAdapter.getMonth(this._calendar.activeDate) < this._dateAdapter.getMonth(this._calendar.maxDate)
          || this._dateAdapter.getYear(this._calendar.activeDate) < this._dateAdapter.getYear(this._calendar.maxDate);
  }

}
