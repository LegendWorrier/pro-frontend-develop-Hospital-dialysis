export const ServiceURL =
{
    register: '/api/Authentication/register',
    login: '/api/Authentication',
    smart_login: '/api/Authentication/smart-login',
    token_refresh: '/api/Authentication/refresh-token',
    token_revoke: '/api/Authentication/revoke-token',
    user_getall: '/api/Users',
    user_get: '/api/Users/{0}',
    user_delete: '/api/Users/{0}',
    user_edit: '/api/Users/{0}/edit',
    user_changerole: '/api/Users/{0}/changerole',
    user_doctor: '/api/Users/doctors',
    user_nurse: '/api/Users/nurses',
    user_changepassword: '/api/Users/changepassword',
    patient_getall: '/api/Patients',
    patient_getall_unit: '/api/Patients/unit/{0}',
    patient_get: '/api/Patients/{0}',
    patient_addnew: '/api/Patients',
    patient_edit: '/api/Patients/{0}',
    patient_delete: '/api/Patients/{0}',
    patient_history: '/api/Patients/{0}/history',

    patient_setting: '/api/Patients/setting',

    admission_get_patient: '/api/admissions/patient/{0}',
    admission_get_active: '/api/admissions/patient/{0}/active',
    admission_get: '/api/admissions/{0}',
    admission_edit: '/api/admissions/{0}',
    admission_add: '/api/admissions',
    admission_delete: '/api/admissions/{0}',

    smart_login_generate: '/api/SmartLogin/generate-new',
    smart_login_revoke: '/api/SmartLogin/revoke',
    smart_login_one_time_token: '/api/SmartLogin/one-time-token',

    permission_getall: '/api/permission',
    permission_user_get: '/api/permission/user/{0}',
    permission_user_edit: '/api/permission/user/{0}',
    permission_role_getall: '/api/permission/role',
    permission_role_add: '/api/permission/role/add',
    permission_role_edit: '/api/permission/role/{0}',
    permission_role_delete: '/api/permission/role/{0}',

    medicine_prescription_getlist: '/api/Patients/{0}/medicinePrescriptions',
    medicine_prescription_auto: '/api/Patients/{0}/medicinePrescriptions/auto',
    medicine_prescription_get: '/api/Patients/medicinePrescriptions/{0}',
    medicine_prescription_addnew: '/api/Patients/medicinePrescriptions',
    medicine_prescription_edit: '/api/Patients/medicinePrescriptions/{0}',
    medicine_prescription_delete: '/api/Patients/medicinePrescriptions/{0}',

    hemo_checkprescription: '/api/Hemodialysis/patient/{0}/prescription/check',
    hemo_check_unexecuted_record: '/api/Hemodialysis/records/{0}/check-unexecuted',
    hemo_record_getall: '/api/Hemodialysis/records',
    hemo_record_getlist_withnote: '/api/Hemodialysis/records/patient/{0}/with-note',
    hemo_record_getlist: '/api/Hemodialysis/records/patient/{0}',
    hemo_record_countinfo: '/api/Hemodialysis/records/patient/{0}/count-info',
    hemo_record_getlatest: '/api/Hemodialysis/patient/{0}/hemosheet',
    hemo_record_get: '/api/Hemodialysis/records/{0}',
    hemo_record_addnew: '/api/Hemodialysis/records',
    hemo_record_edit: '/api/Hemodialysis/records/{0}',
    hemo_record_delete: '/api/Hemodialysis/records/{0}',
    hemo_record_complete: '/api/Hemodialysis/records/{0}/complete',
    hemo_record_change_complete: '/api/Hemodialysis/records/{0}/change-complete-time',
    hemo_record_nurses_in_shift: '/api/Hemodialysis/records/{0}/nurses-in-shift',
    hemo_record_nurses_in_shift_current: '/api/Hemodialysis/records/{0}/nurses-in-shift/update-current',
    hemo_record_cosign: '/api/Hemodialysis/records/{0}/cosign',
    hemo_record_claim: '/api/Hemodialysis/records/{0}/claim',
    hemo_record_doctorconsent: '/api/Hemodialysis/records/{0}/doctor-consent',
    hemo_record_doctorconsent_revoke: '/api/Hemodialysis/records/{0}/doctor-consent/revoke',
    hemo_record_dialysis_getlist: '/api/Hemodialysis/records/{0}/dialysis',
    hemo_record_dialysis_updatelist: '/api/Hemodialysis/records/{0}/dialysis/update',
    hemo_record_dialysis_machine_update: '/api/Hemodialysis/records/{0}/dialysis/machine-update',
    hemo_record_dialysis_addnew: '/api/Hemodialysis/records/dialysis',
    hemo_record_dialysis_get: '/api/Hemodialysis/records/dialysis/{0}',
    hemo_record_dialysis_edit: '/api/Hemodialysis/records/dialysis/{0}',
    hemo_record_dialysis_delete: '/api/Hemodialysis/records/dialysis/{0}',
    hemo_record_nurse_getlist: '/api/Hemodialysis/records/{0}/nurse',
    hemo_record_nurse_addnew: '/api/Hemodialysis/records/nurse',
    hemo_record_nurse_get: '/api/Hemodialysis/records/nurse/{0}',
    hemo_record_nurse_edit: '/api/Hemodialysis/records/nurse/{0}',
    hemo_record_nurse_delete: '/api/Hemodialysis/records/nurse/{0}',
    hemo_record_doctor_getlist: '/api/Hemodialysis/records/{0}/doctor',
    hemo_record_doctor_addnew: '/api/Hemodialysis/records/doctor',
    hemo_record_doctor_get: '/api/Hemodialysis/records/doctor/{0}',
    hemo_record_doctor_edit: '/api/Hemodialysis/records/doctor/{0}',
    hemo_record_doctor_delete: '/api/Hemodialysis/records/doctor/{0}',
    hemo_record_progress_note_getlist: '/api/Hemodialysis/records/{0}/progress-note',
    hemo_record_progress_note_addnew: '/api/Hemodialysis/records/progress-note',
    hemo_record_progress_note_get: '/api/Hemodialysis/records/progress-note/{0}',
    hemo_record_progress_note_edit: '/api/Hemodialysis/records/progress-note/{0}',
    hemo_record_progress_note_delete: '/api/Hemodialysis/records/progress-note/{0}',
    hemo_record_progress_note_swap: '/api/Hemodialysis/records/progress-note/swap/{0}/{1}',
    hemo_record_execution_getlist: '/api/Hemodialysis/records/{0}/execution',
    hemo_record_execution_get: '/api/Hemodialysis/records/execution/{0}',
    hemo_record_execution_addnew_medicines: '/api/Hemodialysis/records/{0}/execution/medicine',
    hemo_record_execution_addnew: '/api/Hemodialysis/records/{0}/execution',
    hemo_record_execution_execute: '/api/Hemodialysis/records/execution/{0}/execute',
    hemo_record_execution_update: '/api/Hemodialysis/records/execution/{0}',
    hemo_record_execution_delete: '/api/Hemodialysis/records/execution/{0}',
    hemo_record_execution_cosign: '/api/Hemodialysis/records/execution/{0}/cosign',
    hemo_record_execution_claim: '/api/Hemodialysis/records/execution/{0}/claim',
    hemo_prescription_getlist: '/api/Hemodialysis/prescriptions/patient/{0}',
    hemo_prescription_get: '/api/Hemodialysis/prescriptions/{0}',
    hemo_prescription_addnew: '/api/Hemodialysis/prescriptions',
    hemo_prescription_edit: '/api/Hemodialysis/prescriptions/{0}',
    hemo_prescription_updaterecord: '/api/Hemodialysis/update-record/{0}',
    hemo_prescription_delete: '/api/Hemodialysis/prescriptions/{0}',
    hemo_prescription_nurse: '/api/Hemodialysis/prescriptions/{0}/nurse',
    hemo_prescription_nurse_self: '/api/Hemodialysis/prescriptions/{0}/nurse/self',
    hemo_note_update: '/api/Hemodialysis/records/{0}/note',

    hemo_setting: '/api/Hemodialysis/setting',
    hemo_sendpdf: '/api/Hemodialysis/record/{0}/send-pdf',

    lab_getall: '/api/Lab',
    lab_get: '/api/Lab/{0}',
    lab_edit: '/api/Lab/{0}',
    lab_delete: '/api/Lab/{0}',
    lab_addnew: '/api/Lab',
    lab_getlist: '/api/Lab/patient/{0}',
    lab_getoverview: '/api/Lab/patient/overview',
    lab_hemosheet_getall: '/api/Lab/hemosheet',
    lab_hemosheet_update: '/api/Lab/hemosheet',
    lab_generate_excel: '/api/Lab/patient/{0}/excel',

    med_history_getall: '/api/MedHistory',
    med_history_get: '/api/MedHistory/{0}',
    med_history_edit: '/api/MedHistory/{0}',
    med_history_delete: '/api/MedHistory/{0}',
    med_history_addnew: '/api/MedHistory',
    med_history_getdetail: '/api/MedHistory/{0}/detail',
    med_history_getoverview: '/api/MedHistory/{0}/overview',

    schedule_get: '/api/schedule/{0}', // unitId
    schedule_section_get: '/api/schedule/section/{0}',
    schedule_section_getlist: '/api/schedule/{0}/sections',
    schedule_section_pending_get: '/api/schedule/{0}/sections/pending',
    schedule_section_update: '/api/schedule/{0}/sections/update',
    schedule_section_clear_pending: '/api/schedule/{0}/sections/clear-pending',
    schedule_slot: '/api/schedule/{0}/slots',
    schedule_slot_swap: '/api/schedule/slots/swap',
    schedule_slot_delete: '/api/schedule/slots/{0}/{1}/{2}', // patientId, sectionId, slot
    schedule_reschedule: '/api/schedule/reschedule/{0}/{1}/{2}', // patientId, sectionId, slot
    schedule_reschedule_delete: '/api/schedule/reschedule/{0}', // scheduleId
    schedule_active: '/api/schedule/{0}/active-schedule',
    schedule_isEmpty: '/api/schedule/{0}/is-empty', // unitId
    schedule_max_get: '/api/schedule/{0}/max-per-slot', // unitId
    schedule_max_set: '/api/schedule/{0}/max-per-slot/set/{1}', // unitId, value

    schedule_today: '/api/schedule/today-patient',
    schedule_setting: '/api/schedule/setting',

    shift_getall: '/api/shift',
    shift_getunit: '/api/shift/{0}', // unitId
    shift_getself: '/api/shift/self',
    shift_gethistory: '/api/shift/list',
    shift_update_self: '/api/shift/self',
    shift_incharge_get: '/api/shift/{0}/incharge', // unitId
    shift_incharge_check: '/api/shift/{0}/incharge/check', // unitId
    shift_incharge_update: '/api/shift/incharges',
    shift_info: '/api/shift/{0}/info', // unitId
    shift_start_next: '/api/shift/{0}/start-next', // unitId
    shift_update: '/api/shift',
    shift_clear_history: '/api/shift/history/clear',
    shift_history_setting: '/api/shift/history/setting',

    avshunt_getview: '/api/AvShunts/view/{0}',
    avshunt_getlist: '/api/AvShunts/list/{0}',
    avshunt_addnew: '/api/AvShunts/new/{0}',
    avshunt_edit: '/api/AvShunts/{0}',
    avshunt_delete: '/api/AvShunts/{0}',
    avissue_addnew: '/api/AvShunts/issues/new/{0}',
    avissue_edit: '/api/AvShunts/issues/{0}',
    avissue_delete: '/api/AvShunts/issues/{0}',

    assessment_getall: '/api/Assessments',
    assessment_delete: '/api/Assessments/{0}',
    assessment_edit: '/api/Assessments/{0}',
    assessment_addnew: '/api/Assessments',
    assessment_reorder: '/api/Assessments/reorder/{0}/{1}',
    assessment_group_getall: '/api/Assessments/group',
    assessment_group_delete: '/api/Assessments/group/{0}',
    assessment_group_edit: '/api/Assessments/group/{0}',
    assessment_group_addnew: '/api/Assessments/group',
    assessment_group_reorder: '/api/Assessments/group/reorder/{0}/{1}',
    assessment_item_getlist: '/api/Assessments/hemosheet/{0}/items',
    assessment_item_update: '/api/Assessments/hemosheet/{0}/items',
    assessment_item_delete: '/api/Assessments/items/{0}',
    assessment_import: '/api/Assessments/import',
    assessment_export: '/api/Assessments/export',
    masterdata_units: '/api/masterdata/unit',
    masterdata_deathCause: '/api/masterdata/deathcause',
    masterdata_status: '/api/masterdata/status',
    masterdata_medicine: '/api/masterdata/medicine',
    masterdata_medicine_category: '/api/masterdata/medicineCategory',
    masterdata_anticoagulant: '/api/masterdata/ac',
    masterdata_dialysate: '/api/masterdata/dialysate',
    masterdata_needle: '/api/masterdata/needle',
    masterdata_dialyzer: '/api/masterdata/dialyzer',
    masterdata_lab_item: '/api/masterdata/labItem',
    masterdata_underlying: '/api/masterdata/underlying',
    masterdata_ward: '/api/masterdata/ward',
    masterdata_patient_history: '/api/masterdata/patient-history',
    masterdata_patient_history_swap: '/api/masterdata/patient-history/swap/{0}/{1}',
    masterdata_medical_supply: '/api/masterdata/medSupply',
    masterdata_equipment: '/api/masterdata/equipment',
    report_base: '/api/report',
    report_template: '/api/report/resources/templates/telerikReportViewerTemplate-FA-15.1.21.616.html',
    utils_native_zip: '/api/Utils/zip-native-file',
    config: '/api/Config',
    upload: '/api/upload',

    lang: '/api/language/change/{0}',

    request_get: '/api/request/{0}',
    request_approve: '/api/request/{0}/approve',
    request_transfer: '/api/request/transfer/{0}/{1}/{2}', // sectionId, slot, patientId
    request_transfer_temp: '/api/request/transfer/{0}/{1}/{2}/temp', // sectionId, slot, patientId
    request_cosign_hemo: '/api/request/cosign/hemosheet/{0}',
    request_cosign_exe: '/api/request/cosign/execution/{0}',
    request_prescription_nurse: '/api/request/prescription-nurse/{0}',

    stat_assessment: '/api/stat/assessments',
    stat_dialysis: '/api/stat/dialysis',
    stat_lab: '/api/stat/lab',
    stat_custom_getlist: '/api/stat/custom-stat-list',
    stat_custom: '/api/stat/{0}',
    stat_custom_patient: '/api/stat/{0}/{1}',

    // =============== Unit & Finance Management ==============

    unit_setting: '/api/unitSetting/{0}',

    stock_get: '/api/stock/{0}',

    stock_medicine_getall: '/api/stock/medicine',
    stock_med_supply_getall: '/api/stock/medSupply',
    stock_equipment_getall: '/api/stock/equipment',
    stock_dialyzer_getall: '/api/stock/dialyzer',

    stock_medicine_get_detail: '/api/stock/medicine/{0}',
    stock_med_supply_get_detail: '/api/stock/medSupply/{0}',
    stock_equipment_get_detail: '/api/stock/equipment/{0}',
    stock_dialyzer_get_detail: '/api/stock/dialyzer/{0}',

    stock_medicine_add: '/api/stock/medicine',
    stock_med_supply_add: '/api/stock/medSupply',
    stock_equipment_add: '/api/stock/equipment',
    stock_dialyzer_add: '/api/stock/dialyzer',

    stock_medicine_edit: '/api/stock/medicine/{0}',
    stock_med_supply_edit: '/api/stock/medSupply/{0}',
    stock_equipment_edit: '/api/stock/equipment/{0}',
    stock_dialyzer_edit: '/api/stock/dialyzer/{0}',

    stock_medicine_bulk: '/api/stock/medicine/bulk',
    stock_med_supply_bulk: '/api/stock/medSupply/bulk',
    stock_equipment_bulk: '/api/stock/equipment/bulk',
    stock_dialyzer_bulk: '/api/stock/dialyzer/bulk',

    stock_delete: '/api/stock/{0}',
    stock_search: '/api/masterdata/stockable',
    stock_add_lot: '/api/stock/add-lot'

};