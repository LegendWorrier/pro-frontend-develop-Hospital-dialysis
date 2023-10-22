import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-swap-menu',
  templateUrl: './swap-menu.component.html',
  styleUrls: ['./swap-menu.component.scss'],
})
export class SwapMenuComponent implements OnInit {

  constructor(private popCtl: PopoverController) { }

  ngOnInit() {}

  permanent() {
    this.popCtl.dismiss('permanent');
  }

  temporary() {
    this.popCtl.dismiss('temporary');
  }

}
