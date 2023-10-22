import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HasDeleteDirective } from './has-delete/has-delete.directive';
import { OptionListComponent } from './option-list.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    OptionListComponent, HasDeleteDirective
  ],
  exports: [
    OptionListComponent, HasDeleteDirective
  ]
})
export class OptionListModule {}