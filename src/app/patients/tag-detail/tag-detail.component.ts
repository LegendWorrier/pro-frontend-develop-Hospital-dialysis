import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Tag } from '../patient-info';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html'
})
export class TagDetailComponent implements OnInit {

  @Input() data: Tag;
  @Input() callback: (data: Tag) => void;
  @Input() onDelete: () => void;

  tag: Tag;
  addMode: boolean;

  colors = [
    'primary',
    'secondary',
    'purple',
    'pink',
    'danger',
    'orange',
    'warning',
    'khaki',
    'success',
    'aquamarine',
    'brown',
    'medium',
    'dark'
  ];

  constructor(private modal: ModalController) {
    
   }

  ngOnInit() {
    if (!this.data) {
      this.data = this.tag = { text: null, bold: false, italic: false, color: null };
      this.addMode = true;
    }
    else {
      this.tag = { text: null, bold: false, italic: false, color: null };
      Object.assign(this.tag, this.data);
    }
  }

  dismiss() {
    this.modal.dismiss();
  }

  save() {
    Object.assign(this.data, this.tag);
    this.callback(this.tag);
    this.modal.dismiss();
  }

  delete() {
    this.onDelete();
    this.modal.dismiss();
  }

}
