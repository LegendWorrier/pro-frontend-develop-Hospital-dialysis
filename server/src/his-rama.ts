import { HIS } from './his-interface.js';

// ===================== Config ======================
const url = 'http://host.docker.internal:6200';
const username = '';
const password = '';
const appCode = '';
// ===================================================

interface RamaResponse<T> {
  data: T;
  success: boolean;
  errorTexts: string[];
}

interface Auth {
  accessToken: string;
}

interface RamaPatient {
  patientCode: string;
  titleName: string;
  titleNameEn: string;
  firstName: string;
  firstNameEn: string;
  lastName: string;
  lastNameEn: string;
  middleName: string;
  middleNameEn: string;
  gender: string;
  age: string;
  dateOfBirth: string;

}

import { HTTPError, got } from 'got';
import { PatientInfo } from './patient-info.js';
import { Request, Response } from 'express';

namespace RamaToken {
  let TOKEN: string = '';

  export async function getToken() {
    const auth: RamaResponse<Auth> = await got.post(url + '/api/client/login', {
      json: {
        data: {
          username,
          password,
          appCode
        }
      },
      https: {
        rejectUnauthorized: false
      }
    }).json<RamaResponse<Auth>>().catch((err: HTTPError) => {
      console.log(err.message + ': ' + err.response.body);
      // TODO: log to seq
      return { data: undefined as unknown as Auth, success: false, errorTexts: [] } as RamaResponse<Auth>;
    });

    if (!auth.success) {
      if (auth.errorTexts && auth.errorTexts.length > 0) {
        console.log(auth.errorTexts);
        // TODO: log to seq
      }
    }

    TOKEN = auth.data?.accessToken

    return TOKEN;
  }
  
  export async function getTokenOrRefresh() {
    if (TOKEN) {
      return TOKEN;
    }
    return await getToken();
  }

}

const getPatient = async (req: Request, res: Response) => {
    const hn = req.query['hn'];
    let ramaToken = await RamaToken.getTokenOrRefresh();

    let token = 'Bearer ' + ramaToken;
    const getPatientRes: RamaResponse<RamaPatient> = await got.post(rama.url + '/api/MR/Patients/GetPatientProfileByMrn', {
      headers: {
        Authorization: token
      },
      json: {
        mrn: hn
      },
      https: {
        rejectUnauthorized: false
      },
    }).json<RamaResponse<RamaPatient>>().catch(async (err: HTTPError) => {
      // attemp to retry login once
      if (err.response.statusCode == 401) {
        console.log('log in to get token again...');
        ramaToken = await RamaToken.getToken();
        token = 'Bearer ' + ramaToken;
        return got.post(rama.url + '/api/MR/Patients/GetPatientProfileByMrn', {
          headers: {
            Authorization: token
          },
          json: {
            mrn: hn
          },
          https: {
            rejectUnauthorized: false
          },
        })
        .json<RamaResponse<RamaPatient>>()
        .catch((err: HTTPError) => {
          console.log(err.message + ': ' + err.response.body);
          // TODO: log to seq
          return ({ data: null as unknown as RamaPatient, success: false, errorTexts: []} as RamaResponse<RamaPatient>);
        });
      }
      
      console.log(err.message + ': ' + err.response.body);
      // TODO: log to seq
      return { data: null as unknown as RamaPatient, success: false, errorTexts: []} as RamaResponse<RamaPatient>;
    });

    if (!getPatientRes.success) {
      if (getPatientRes.errorTexts && getPatientRes.errorTexts.length > 0) {
          console.log(getPatientRes.errorTexts);
        // TODO: log to seq
      }

      res.status(500).send('No patient found.');
      return;
    }

    const patient: RamaPatient = getPatientRes.data;
    const result = {
      id: patient.patientCode,
      hospitalNumber: hn,
      birthDate: new Date(patient.dateOfBirth),
      name: getName(patient),
      gender: getGender(patient)
    } as PatientInfo;

    res.json(result);
    
  };

function getName(patient: RamaPatient): string {
  return (patient.titleName? patient.titleName + ' ':'') + (patient.firstName + ' ' + patient.lastName);
}

function getGender(patient: RamaPatient): string {
  if (patient.gender.startsWith('m') || patient.gender.startsWith('M')) {
    return 'M';
  }
  else if (patient.gender.startsWith('f') || patient.gender.startsWith('F')) {
    return 'F';
  }
  return 'U';
}

const notAllowed = (req: Request, res: Response) => res.status(409).json({
  code: 'NOT_ALLOWED',
  message: 'Rama has no policy for sending data to HIS'
});

const rama: HIS = {
  url,
  getPatient,
  sendHemo: notAllowed
};
export default rama;
