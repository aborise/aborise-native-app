import * as services from './services';
export type AllServices = typeof services;
export type Service = AllServices[keyof AllServices];

export * as services from './services';
