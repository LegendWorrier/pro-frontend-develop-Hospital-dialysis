import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainTabComponent } from './main-tab.component';
import { MainTabRoutingModule } from '../main-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MainTabRoutingModule
  ],
  declarations: [MainTabComponent],
  exports: [MainTabComponent]
})
export class MainTabModule {}
