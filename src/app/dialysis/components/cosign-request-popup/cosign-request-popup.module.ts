import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CosignRequestPopupComponent } from './cosign-request-popup.component';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectAsyncListModule,
    AppPipeModule
  ],
  declarations: [CosignRequestPopupComponent],
  exports: [CosignRequestPopupComponent]
})
export class CosignRequestPopupModule {}
