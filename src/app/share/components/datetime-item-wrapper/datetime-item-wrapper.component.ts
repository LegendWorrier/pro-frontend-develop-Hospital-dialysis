import { Component, Input, OnInit, Output, EventEmitter, ContentChild, AfterContentInit, ElementRef } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { format } from 'date-fns-tz'

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

@Component({
  selector: 'hemo-datetime-item',
  templateUrl: './datetime-item-wrapper.component.html',
  styleUrls: ['./datetime-item-wrapper.component.scss'],
})
export class DatetimeItemWrapperComponent implements OnInit, AfterContentInit {

  @Input() value: string | Date;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() title: string;
  @Input() placeholder: string;
  @Input() hasLabel: boolean = true;

  @Input() displayFormat: string;

  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() lines: string;

  @Input() required: boolean;

  @ContentChild(IonDatetime) datetime: IonDatetime;

  constructor(private ele: ElementRef) { }

  ngAfterContentInit(): void {
    if (this.datetime) {
      this.datetime.ionChange.subscribe(value => {
        this.withTimezoned(value.detail.value);
      });
    }
    else {
      console.warn("datetime wrapper: expects an IonDatetime component as a content within but found none.", this.ele.nativeElement);
    }
    
  }

  ngOnInit() {
    if (this.value) {
      setTimeout(() => {
        this.withTimezoned(this.value);
      }, 50);
    }
  }

  withTimezoned(value) {
    if (!value) {
      return;
    }
    this.value = format(new Date(value), 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone: userTimeZone });
    this.valueChange.emit(this.value as string);
  }

}
