import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reschedule',
  templateUrl: './reschedule-menu.component.html',
  styleUrls: ['./reschedule-menu.component.scss'],
})
export class RescheduleMenuComponent implements OnInit {

  constructor(private popCtl: PopoverController) { }

  ngOnInit() {}

  permanent() {
    this.popCtl.dismiss();
    this.popCtl.dismiss(true, 'reschedule', 'schedule-menu');
  }

  temporary() {
    this.popCtl.dismiss();
    this.popCtl.dismiss(false, 'reschedule', 'schedule-menu');
  }

}
