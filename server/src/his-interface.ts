import * as express from 'express';

export interface HIS {
    url: string;
    getPatient: express.RequestHandler;
    sendHemo: express.RequestHandler;
}
