import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-menu',
  templateUrl: './popup-menu.component.html',
  styleUrls: ['./popup-menu.component.scss'],
})
export class PopupMenuComponent implements OnInit {

  @Input() menuList: {
    display: string;
    name: string;
    disable: boolean;
  }[];

  @Input() popupId: string;

  constructor(private popup: PopoverController) { }

  ngOnInit() {}

  select(item) {
    this.popup.dismiss(item.name, 'ok', this.popupId);
  }

}
