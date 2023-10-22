import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageLoaderComponent } from './page-loader.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    PageLoaderComponent
  ],
  exports: [
    PageLoaderComponent
  ]
})
export class PageLoaderModule {}