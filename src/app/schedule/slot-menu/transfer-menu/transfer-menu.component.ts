import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-transfer-menu',
  templateUrl: './transfer-menu.component.html',
  styleUrls: ['./transfer-menu.component.scss'],
})
export class TransferMenuComponent implements OnInit {

  constructor(private popCtl: PopoverController) { }

  ngOnInit() {}

  permanent() {
    this.popCtl.dismiss();
    this.popCtl.dismiss(true, 'transfer', 'schedule-menu');
  }

  temporary() {
    this.popCtl.dismiss();
    this.popCtl.dismiss(false, 'transfer', 'schedule-menu');
  }

}
