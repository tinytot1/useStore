import { Status } from './interface';

export const ACTION_STATUS_NAME = '@STATUS';
export const DEFAULT_STATUS: Status = { pending: false, error: null };

export const actionStatusModel: any = {
  name: ACTION_STATUS_NAME,
  state: {}
};