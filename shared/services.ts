import { DeepWriteable } from './plumbing';
import { Service } from './validators';

// SPOTIFY = 324684580
// DISNEY+ = 1446075923
// PARAMOUNT+ = 1340650234
// AMAZON PRIME VIDEO = 545519333
// DAZN = 1129523589
// RTL+ = 1057991212

const _netflix = {
  id: 'netflix',
  title: 'Netflix',
  appleId: '363590051',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: ['creditcard'],
  optional: [
    {
      key: 'creditcard',
      value: {
        number: '1234 1234 1234 1234',
        expiration: '12/24',
        cvc: '123',
      },
    },
  ],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
    {
      name: 'cancel',
      type: 'manual',
    },
    {
      name: 'resume',
      type: 'manual',
    },
    {
      name: 'reactivate',
      type: 'manual',
      url: 'https://www.netflix.com/signup/planform',
    },
  ],
} as const;

type Netflix = typeof _netflix;

export const netflix = _netflix as DeepWriteable<Netflix> satisfies Service;

const _amazon = {
  id: 'amazon',
  title: 'Amazon Prime',
  appleId: '545519333',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    {
      name: 'resume',
      type: 'manual',
    },
  ],
} as const;

type Amazon = typeof _amazon;

export const amazon = _amazon as DeepWriteable<Amazon> satisfies Service;

const _disney = {
  id: 'disney',
  title: 'Disney+',
  appleId: '1446075923',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
  ],
} as const;

type Disney = typeof _disney;

export const disney = _disney as DeepWriteable<Disney> satisfies Service;

const _spotify = {
  id: 'spotify',
  title: 'Spotify',
  appleId: '324684580',
  description: 'Listen to music',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
  ],
} as const;

type Spotify = typeof _spotify;

export const spotify = _spotify as DeepWriteable<Spotify> satisfies Service;

const _paramount = {
  id: 'paramount',
  title: 'Paramount',
  appleId: '1340650234',
  description: 'Listen to music',
  auth: ['email', 'password'], // , 'name'
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
  ],
} as const;

type Paramount = typeof _paramount;

export const paramount = _paramount as DeepWriteable<Paramount> satisfies Service;
