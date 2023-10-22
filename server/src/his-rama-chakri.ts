import { HIS } from './his-interface.js';

// ===================== Config ======================
const url = 'https://host.docker.internal:49155';

// ===================================================

interface RamaResponse<T> {
  data: T;
  success: boolean;
  errorTexts: string[];
}

interface RamaChakriPatient {
  hn: string;
  initial_name: string;
  first_name: string;
  last_name: string;
  initial_name_eng: string;
  first_name_eng: string;
  last_name_eng: string;
  middle_name: string;
  middle_name_eng: string;
  gender: string;
  dob: string;
  id_card_no: string;

}

import { got } from 'got';
import { PatientInfo } from './patient-info.js';
import { HemosheetInfo } from './hemosheet-info.js';
import { format } from 'date-fns';
import { Request, Response } from 'express';

const getPatient = async (req: Request, res: Response) => {
    const hn = req.query['hn'];
    
    const getPatientRes: RamaResponse<RamaChakriPatient> = await got.get(rama.url + '/apis/IME/get_demographic/hn/' + hn, {
      https: {
        rejectUnauthorized: false
      },
    }).json<RamaChakriPatient>()
    .then(data => ({ data, success: true, errorTexts: [] }) as RamaResponse<RamaChakriPatient>)
    .catch(err => {
      console.log(err);
      // TODO: log to seq
      return { data: null as unknown as RamaChakriPatient, success: false, errorTexts: []} as RamaResponse<RamaChakriPatient>;
    });

    if (!getPatientRes.success) {
      if (getPatientRes.errorTexts && getPatientRes.errorTexts.length > 0) {
          console.log(getPatientRes.errorTexts);
        // TODO: log to seq
      }

      res.sendStatus(500);
      return;
    }

    const patient: RamaChakriPatient = getPatientRes.data;
    const result = {
      id: patient.hn,
      hospitalNumber: hn,
      identityNo: patient.id_card_no,
      birthDate: new Date(patient.dob),
      name: getName(patient),
      gender: getGender(patient)
    } as PatientInfo;

    res.json(result);

  };

function getName(patient: RamaChakriPatient): string {
  return (patient.initial_name? patient.initial_name + ' ': '') + (patient.first_name + ' ' + patient.last_name);
}

function getGender(patient: RamaChakriPatient): string {
  if (patient.gender.startsWith('m') || patient.gender.startsWith('M')) {
    return 'M';
  }
  else if (patient.gender.startsWith('f') || patient.gender.startsWith('F')) {
    return 'F';
  }
  return 'U';
}


const sendHemo = async (req: Request, res: Response) => {
  const hemosheet = req.body as HemosheetInfo;
  const hn = 'C834';
  const data = {
    hn,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm:ss'),
    serial_number: 'dummy_SN',
    height: null,
    weight: hemosheet.dehydration.preTotalWeight,
    bmi: null,
    systolic: hemosheet.preVitalsign[0]?.bps,
    diastolic: hemosheet.preVitalsign[0]?.bpd,
    mean: null,
    temp: hemosheet.preVitalsign[0]?.temp,
    pulse: hemosheet.preVitalsign[0]?.hr,
    rr: null,
    spo2: null

  };
    
  const sendHemoResponse: RamaResponse<RamaChakriPatient> = await got.post(rama.url + '/apis/PTM/set_smart_vital_sign/', {
    https: {
      rejectUnauthorized: false,
    },
    json: data
  }).json<RamaChakriPatient>()
  .then(data => ({ data, success: true, errorTexts: [] }) as RamaResponse<RamaChakriPatient>)
  .catch(err => {
    console.log(err);
    // TODO: log to seq
    return { data: null as unknown as RamaChakriPatient, success: false, errorTexts: []} as RamaResponse<RamaChakriPatient>;
  });

  if (!sendHemoResponse.success) {
    if (sendHemoResponse.errorTexts && sendHemoResponse.errorTexts.length > 0) {
        console.log(sendHemoResponse.errorTexts);
      // TODO: log to seq
    }

    res.sendStatus(500);
    return;
  }

  return res.json(true);
}

const rama: HIS = {
  url,
  getPatient,
  sendHemo
};
export default rama;
