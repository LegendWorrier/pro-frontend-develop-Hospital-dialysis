import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

import { format, utcToZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-pick-time',
  templateUrl: './pick-time.component.html',
  styleUrls: ['./pick-time.component.scss'],
})
export class PickTimeComponent implements OnInit {

  @Input() min: string;
  targetTime: string;

  constructor(private pop: PopoverController) { }

  ngOnInit() {
    if (this.targetTime) {
      if ((this.targetTime as any) instanceof Date) {
        console.log(this.targetTime);
        this.targetTime = (this.targetTime as any as Date).toISOString();
      }
    }
    else {
      this.targetTime = new Date().toISOString();
    }
    // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // const zoned = utcToZonedTime(this.targetTime as string, userTimeZone);
    // this.targetTime = format(zoned, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone: userTimeZone });
    console.log(this.targetTime, 'picktime');
  }

  ok() {
    this.pop.dismiss(new Date(this.targetTime), 'ok', 'pick-time');
  }
}
