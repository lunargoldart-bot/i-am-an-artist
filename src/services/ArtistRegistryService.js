import { createEntityService } from './createEntityService.js';

const service = createEntityService('artist_registry');

export const list = service.list;
export const filter = service.filter;
export const get = service.get;
export const create = service.create;
export const update = service.update;
export const del = service.del;
export const subscribe = service.subscribe;
export default service;
