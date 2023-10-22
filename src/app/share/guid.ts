import { validate as uuidValidate, v5 as uuidv5 } from 'uuid';

export type GUID = string & { isGuid: true };

export function guid(guid: string) {
    if (!uuidValidate(guid)) {
        throw new Error('"' + guid + '" is not a valid guid.');
    }
    return guid as GUID;
}

export function newGuid() {
    const MY_NAMESPACE = Uint8Array.from([
        0xDE, 0x42, 0xF6, 0xFF,
        0x21, 0x0C,
        0xDA, 0x9C,
        0xA3, 0x0E,
        0x1A, 0x4A, 0xC2, 0x74, 0x36, 0x56,
      ]); //random hard-coded value, not important
    return uuidv5('hemo', MY_NAMESPACE) as GUID;
}

export function emptyGuid() {

    return '00000000-0000-0000-0000-000000000000' as GUID;
}