import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SheetControlComponent } from './sheet-control.component';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { ScrollHideModule } from 'src/app/directive/scroll-hide.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AppPipeModule,
    ScrollHideModule
  ],
  declarations: [
    SheetControlComponent
  ],
  exports: [
    SheetControlComponent
  ]
})
export class SheetControlModule {}
