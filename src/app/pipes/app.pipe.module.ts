import { NgModule } from '@angular/core';
import { PrettyPipe } from './pretty.pipe';
import { DatanamePipe } from './dataname.pipe';
import { NoCommaPipe } from './no-comma.pipe';
import { IdentityPipe } from './identity.pipe';

@NgModule({
    declarations: [PrettyPipe, DatanamePipe, NoCommaPipe, IdentityPipe],
    exports: [PrettyPipe, DatanamePipe, NoCommaPipe, IdentityPipe]
})
export class AppPipeModule {}