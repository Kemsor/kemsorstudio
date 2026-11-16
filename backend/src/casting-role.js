import {createHash} from 'node:crypto';
export const castingRoleKey=name=>createHash('sha256').update(name.normalize('NFKC').trim().toLowerCase()).digest('hex');
