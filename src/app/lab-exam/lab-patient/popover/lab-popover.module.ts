import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LabPopoverComponent } from './lab-popover.component';

@NgModule({
imports: [
    CommonModule,
    FormsModule,
    IonicModule
],
declarations: [LabPopoverComponent]
})
export class LabPopoverModule {}