import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { A2hsGuideComponent } from './a2hs-guide.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    A2hsGuideComponent
  ],
  exports: [
    A2hsGuideComponent
  ]
})
export class A2hsGuideModule {}
