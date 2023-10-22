import { User } from "../auth/user";
import { PermissionGroupInfo, PermissionInfo } from "./service/permission.service";

export class Cache {
    static inchargeCache: { [unitId: number]: { lastUpdate: Date, isincharge: boolean } } = {};
    static readonly cacheInterval = 5; // minutes

    static allNursesCache: { [unitId: number]: { list: User[], lastUpdate: Date } } = {};
    static doctorListCache: User[];

    static allPermissions: { permissions: PermissionInfo[], groups: PermissionGroupInfo[] } = null;
}