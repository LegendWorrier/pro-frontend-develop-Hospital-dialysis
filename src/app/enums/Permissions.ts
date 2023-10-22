
export enum Permissions {
    HeadNurseUp,
    HeadNurseOnly,
    /**
     * Doctor or Admin
     */
    DoctorUp,
    /**
     * Doctor only, whether admin or not doesn't matter.
     */
    DoctorOnly,
    /**
     * Anyone but doctor (admin or not doesn't matter, mean that admin doctor has no permission also)
     */
    NotDoctor,
    /**
     * Nurse or HeadNurse (or Admin)
     */
    NurseOnly,
}
