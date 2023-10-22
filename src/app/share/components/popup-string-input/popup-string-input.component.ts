import { PopoverController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-popup-string-input',
  templateUrl: './popup-string-input.component.html',
  styleUrls: ['./popup-string-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupStringInputComponent implements OnInit {

  @Input() title: string;
  @Input() value: string;
  @Input() placeholder: string = 'Enter here';

  @Input() isPassword: boolean;
  @Input() color: boolean = true;

  @Input() popupId: string;

  constructor(private popup: PopoverController) { }

  ngOnInit(): void {
  }

  confirm() {
    this.popup.dismiss(this.value, 'ok', this.popupId);
  }

}
