import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { TextBoxInputComponent } from './text-box-input.component';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule
    ],
    declarations: [
      TextBoxInputComponent
    ],
    exports: [
      TextBoxInputComponent
    ]
  })
  export class TextBoxInputModule {}
