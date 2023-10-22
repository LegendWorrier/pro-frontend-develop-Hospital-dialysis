import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { UserUtil } from '../auth/user-utils';

export const DoctorListResolver: ResolveFn<User[]> =
async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userService = inject(UserService);
  const doctors = await UserUtil.getDoctorListFromCache(userService);
    if (doctors && doctors.length !== 0) {
      return doctors;
    }
    return UserUtil.getDoctorListFromCache(userService);
};