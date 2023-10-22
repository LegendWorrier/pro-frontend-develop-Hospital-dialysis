import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular"
import { AppPipeModule } from "src/app/pipes/app.pipe.module";
import { StampModule } from "../stamp/stamp.module";
import { AuditNameComponent } from "./audit-name.component";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    StampModule,
    AppPipeModule
  ],
  declarations: [
    AuditNameComponent
  ],
  exports: [
    AuditNameComponent
  ]
})
export class AuditNameModule {}
