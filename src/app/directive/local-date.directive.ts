import { Directive, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, HostBinding } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { format, utcToZonedTime } from 'date-fns-tz';

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

@Directive({
  selector: '[appLocalDate]'
})
export class LocalDateDirective {

  @Input('appLocalDate') value: string | Date;
  @Output('appLocalDateChange') valueChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private element: IonDatetime, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      //console.log('local check', this.element.value);
      if (this.element.value) {
        const zoned = utcToZonedTime(this.element.value as string, userTimeZone);
        this.element.value = format(zoned, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone: userTimeZone });
      }
    }, 50);
    
  }

}
