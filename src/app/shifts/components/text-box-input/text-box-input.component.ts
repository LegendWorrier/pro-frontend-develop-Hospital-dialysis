import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-box-input',
  templateUrl: './text-box-input.component.html',
  styleUrls: ['./text-box-input.component.scss'],
})
export class TextBoxInputComponent implements OnInit {

  @Input() checkInput: (value) => string;
  @Input() placeholder: string;
  @Input() hint: string;
  /**
   * Regex pattern as a string.
   *
   * @type {string}
   * @memberof TextBoxInputComponent
   */
  @Input() pattern: string;

  value: string;
  error: string;

  constructor(private pop: PopoverController) { }

  ngOnInit() {}

  check() {
    if (!this.checkInput) {
      return true;
    }
  }

  confirm() {
    this.error = null;
    if (this.checkInput) {
      console.log('value', this.value);
      const errMsg = this.checkInput(this.value);
      if (errMsg) {
        this.error = errMsg;
        return;
      }
    }
    this.pop.dismiss(this.value, 'ok');
  }

}
