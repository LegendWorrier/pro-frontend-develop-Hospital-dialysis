import { HIS } from './his-interface.js';

const notImpl = (req: any, res: any) => res.status(409).json({
    code: 'NO_HIS',
    message: 'This server has no HIS integration/implementation. If this is a mistake, please contact administrator.'
});

const hisDefault: HIS = {
    url: '',
    getPatient: notImpl,
    sendHemo: notImpl
};
export default hisDefault;
