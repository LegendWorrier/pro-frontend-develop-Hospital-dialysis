import his from './his-import.js';
import * as express from 'express';

export default function init(app: express.Express) {
  app.get('/api/his/get-patient-by-hn', his.getPatient);

  app.post('/api/his/send-hemo', his.sendHemo);
}
