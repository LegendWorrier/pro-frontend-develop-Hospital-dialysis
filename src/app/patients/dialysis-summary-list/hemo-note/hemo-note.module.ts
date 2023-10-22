import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemoNotePage } from './hemo-note.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    AuditNameModule,
    AppPipeModule
  ],
  declarations: [HemoNotePage]
})
export class HemoNotePageModule {}
