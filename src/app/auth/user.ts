import { Permissions } from '../enums/Permissions';
import { Roles } from '../enums/roles';
import { Permission } from '../share/permission';
import { GUID } from '../share/guid';
import { UserInfo } from './user-info';


export class User implements UserInfo {

    get isDoctor(): boolean {
        return this.isPowerAdmin || this.role === Roles.Doctor;
    }

    get isHeadNurse(): boolean {
        return this.isPowerAdmin || this.role === Roles.HeadNurse;
    }

    get isNurse(): boolean {
        return this.isPowerAdmin || this.role === Roles.Nurse;
    }

    get isPN(): boolean {
        return this.isPowerAdmin || this.role === Roles.PN;
    }

    id: GUID;
    employeeId: string;
    userName: string;
    password: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: Roles;
    isAdmin: boolean;
    isPowerAdmin: boolean;

    isPartTime: boolean;

    units: number[];

    signature: string;

    checkPermissionLevel(level: Permissions) {
        switch (level) {
            case Permissions.HeadNurseUp:
                return this.isDoctor || this.isHeadNurse || this.isAdmin;
            case Permissions.DoctorUp:
                return this.isDoctor || this.isAdmin;
            case Permissions.DoctorOnly:
                return this.isDoctor || this.isPowerAdmin;
            case Permissions.NotDoctor:
                return !this.isDoctor || this.isPowerAdmin;
            case Permissions.NurseOnly:
                return this.isHeadNurse || this.isNurse || this.isPN || this.isAdmin;
            case Permissions.HeadNurseOnly:
                return this.isHeadNurse || this.isAdmin;
        }
    }

    checkPermission(...permissionNames: string[]) {
        if (this.isPowerAdmin || this.hasGlobalPermission()) {
            return true;
        }

        for (const permission of permissionNames) {
            if (this.permissions?.findIndex(x => x === permission) > -1) {
                return true;
            }
        }
        return false;
    }

    hasGlobalPermission() {
        return this.permissions?.findIndex(x => x === Permission.GLOBAL) > -1;
    }

    permissions: string[];
}

