import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermissionEditComponent } from './permission-edit.component';

@NgModule({
    declarations: [
        PermissionEditComponent
    ],
    exports: [PermissionEditComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
    ]
})
export class PermissionEditModule {}
