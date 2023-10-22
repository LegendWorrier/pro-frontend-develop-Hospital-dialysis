import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { TagComponent } from "./tag.component";
import { TagDirective } from "./tag.directive";

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
    ],
    declarations: [
      TagComponent, TagDirective
    ],
    exports: [
      TagComponent, TagDirective
    ]
  })
  export class TagModule {}
