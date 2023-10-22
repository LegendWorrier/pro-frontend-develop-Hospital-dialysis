import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { StampComponent } from "./stamp.component";

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
    ],
    declarations: [
      StampComponent
    ],
    exports: [
      StampComponent
    ]
  })
  export class StampModule {}