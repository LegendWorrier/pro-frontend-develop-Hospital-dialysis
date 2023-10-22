import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProgressNoteEditPage } from './progress-note-edit.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { HeaderModule } from 'src/app/share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    HeaderModule,
    AuditNameModule,
  ],
  declarations: [ProgressNoteEditPage]
})
export class ProgressNoteEditPageModule {}
