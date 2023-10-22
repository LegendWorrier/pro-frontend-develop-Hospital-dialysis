import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemLinkComponent } from './item-link.component';
import { RouterLinkEventModule } from 'src/app/directive/router-link-event.module';
import { RouterLink, RouterLinkActive } from '@angular/router';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterLinkEventModule,
    RouterLink,
    RouterLinkActive
  ],
  declarations: [
    ItemLinkComponent
  ],
  exports: [
    ItemLinkComponent
  ]
})
export class ItemLinkModule {}