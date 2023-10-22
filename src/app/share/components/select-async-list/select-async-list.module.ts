import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SelectAsyncListComponent } from "./select-async-list.component";
import { ListDataDirective } from './list-data.directive';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule
    ],
    declarations: [
      SelectAsyncListComponent, ListDataDirective
    ],
    exports: [
      SelectAsyncListComponent, ListDataDirective
    ]
  })
  export class SelectAsyncListModule {}