import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-select-datetime',
  templateUrl: './popup-select-datetime.component.html',
  styleUrls: ['./popup-select-datetime.component.scss'],
})
export class PopupSelectDatetimeComponent implements OnInit {

  @Input() title: string | Date;
  @Input() value: string;
  @Input() placeholder: string = 'Select Datetime';

  @Input() onlytime: boolean;

  @Input() popupId: string;
  
  constructor(private popup: PopoverController) { }

  ngOnInit() {
    if ((this.value as any) instanceof Date) {
      this.value = (this.value as any as Date).toISOString();
    }
  }

  confirm() {
    this.popup.dismiss(new Date(this.value), 'ok', this.popupId);
  }

}
