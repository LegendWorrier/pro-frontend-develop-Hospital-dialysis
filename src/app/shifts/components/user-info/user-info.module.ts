import { HeaderThemeModule } from './../../../directive/header-theme.module';
import { IonicModule } from '@ionic/angular';
import { AppPipeModule } from './../../../pipes/app.pipe.module';
import { UserInfoComponent } from './user-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      AppPipeModule,
      HeaderThemeModule
    ],
    declarations: [
      UserInfoComponent
    ],
    exports: [
      UserInfoComponent
    ]
  })
  export class UserInfoModule {}
