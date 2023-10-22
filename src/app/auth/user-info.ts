import { Roles } from "../enums/roles";

export interface UserInfo {
    userName: string;
    password: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: Roles;
    isAdmin: boolean;

    isPartTime: boolean;

    signature: string;
}
