import { Feature } from "../enums/feature";

export interface AuthResponse {
    access_token: string;
    expires_in: number;
    expired_mode: boolean;
    feature: Feature;
}
