import { RecoveryService } from './../share/service/recovery.service';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { DialysisPrescription } from '../dialysis/dialysis-prescription';
import { HemoDialysisService } from '../dialysis/hemo-dialysis.service';
import { guid } from '../share/guid';

export const PrescriptionResolver: ResolveFn<DialysisPrescription> =
  async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const hemoService = inject(HemoDialysisService);
    const recover = inject(RecoveryService);
    
    const fromTmp = hemoService.getTmpPrescription();
    if (fromTmp) {
      return fromTmp;
    }

    const recoverData = await recover.get();
    if (recoverData && recoverData.page === 'patient' && recoverData.action === 'hemo-pres') {
      if (recoverData.arg[1]) {
        return recoverData.arg[1];
      }
    }
    
    let id = guid(route.paramMap.get('prescriptionId'));
    return hemoService.getDialysisPrescription(id).pipe(map(x => Object.assign(new DialysisPrescription, x)));
    
  };
