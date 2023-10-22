import { GUID } from "../share/guid";

export interface RoleInfo {
    id: GUID;
    name: string;

    permissions: string[]
}
