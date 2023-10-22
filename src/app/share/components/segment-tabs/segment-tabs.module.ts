import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SegmentTabsComponent } from "./segment-tabs.component";

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule
    ],
    declarations: [
      SegmentTabsComponent
    ],
    exports: [
      SegmentTabsComponent
    ]
  })
  export class SegmentTabsModule {}