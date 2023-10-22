
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PopupMenuComponent } from './popup-menu.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    PopupMenuComponent
  ],
  exports: [
    PopupMenuComponent
  ]
})
export class PopupMenuModule {}