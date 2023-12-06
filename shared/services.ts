import { DeepWriteable } from './plumbing';
import { Service } from './validators';

const _netflix = {
  id: 'netflix',
  title: 'Netflix',
  appleId: '363590051',
  googleId: 'com.netflix.mediaclient',
  schema: 'nflx://app',
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
      states: [],
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
    },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled'],
    },
    {
      name: 'reactivate',
      type: 'manual',
      webView: true,
      states: ['inactive', 'preactive'],
    },
    {
      name: 'register',
      type: 'manual',
      webView: true,
      states: [],
    },
  ],
} as const;

type Netflix = typeof _netflix;

export const netflix = _netflix as DeepWriteable<Netflix> satisfies Service;

const _amazon = {
  id: 'amazon',
  title: 'Amazon Prime',
  appleId: '545519333',
  googleId: 'com.amazon.avod.thirdpartyclient',
  schema: 'aiv://app',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
      webView: true,
    },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
      webView: true,
    },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled', 'inactive'],
      webView: true,
    },
  ],
} as const;

type Amazon = typeof _amazon;

export const amazon = _amazon as DeepWriteable<Amazon> satisfies Service;

const _disney = {
  id: 'disney',
  title: 'Disney+',
  appleId: '1446075923',
  googleId: 'com.disney.disneyplus',
  schema: 'disneyplus://app',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
    },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled'],
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
  ],
} as const;

type Disney = typeof _disney;

export const disney = _disney as DeepWriteable<Disney> satisfies Service;

// const _spotify = {
//   id: 'spotify',
//   title: 'Spotify',
//   appleId: '324684580',
//   googleId: 'com.spotify.music',
//   description: 'Listen to music',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//     },
//     // {
//     //   name: 'reactivate',
//     //   type: 'manual',
//     // },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled'],
//     },
//     // {
//     //   name: 'register',
//     //   type: 'manual',
//     // },
//   ],
// } as const;

// type Spotify = typeof _spotify;

// export const spotify = _spotify as DeepWriteable<Spotify> satisfies Service;

const _paramount = {
  id: 'paramount',
  title: 'Paramount',
  appleId: '1340650234',
  googleId: 'com.cbs.ca',
  schema: 'pplusintl://app',
  description: 'Listen to music',
  auth: ['email', 'password'], // , 'name'
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
      webView: true,
    },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
    },
    {
      name: 'reactivate',
      type: 'manual',
      states: ['inactive', 'preactive'],
      webView: true,
    },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled'],
    },
    {
      name: 'register',
      type: 'manual',
      states: [],
      webView: true,
    },
  ],
} as const;

type Paramount = typeof _paramount;

export const paramount = _paramount as DeepWriteable<Paramount> satisfies Service;

// apple tv+
// const _apple = {
//   id: 'apple',
//   title: 'Apple TV+',
//   appleId: '1174078549',
//   googleId: 'com.apple.atve.androidtv.appletv',
//   schema: null,
//   description: 'Watch movies and series',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     // {
//     //   name: 'cancel',
//     //   type: 'manual',
//     //   states: ['active'],
//     // },
//     // {
//     //   name: 'resume',
//     //   type: 'manual',
//     //   states: ['canceled', 'inactive'],
//     // },
//   ],
// } as const;

// type Apple = typeof _apple;

// export const apple = _apple as DeepWriteable<Apple> satisfies Service;

const _dazn = {
  id: 'dazn',
  title: 'DAZN',
  appleId: '1129523589',
  googleId: 'com.dazn',
  schema: 'dazn://',
  description: 'Watch sports',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
    },
    // {
    //   name: 'cancel',
    //   type: 'manual',
    //   states: ['active'],
    //   webView: true,
    // },
    // {
    //   name: 'resume',
    //   type: 'manual',
    //   states: ['canceled', 'inactive'],
    //   webView: true,
    // },
  ],
} as const;

type Dazn = typeof _dazn;

export const dazn = _dazn as DeepWriteable<Dazn> satisfies Service;

const _rtl = {
  id: 'rtl',
  title: 'RTL+',
  appleId: '1057991212',
  googleId: 'de.rtli.tvnow',
  schema: 'rtlplus://',
  description: 'Watch TV',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
      webView: true,
    },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
    },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled'],
    },
  ],
} as const;

type Rtl = typeof _rtl;

export const rtl = _rtl as DeepWriteable<Rtl> satisfies Service;

// const _hbo = {
//   id: 'hbo',
//   title: 'HBO',
//   appleId: '971265422',
//   googleId: 'com.hbo.hbonow',
//   description: 'Watch movies and series',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//       webView: true,
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//       webView: true,
//     },
//   ],
// } as const;

// type Hbo = typeof _hbo;

// export const hbo = _hbo as DeepWriteable<Hbo> satisfies Service;

// const _sky = {
//   id: 'sky',
//   title: 'Sky',
//   appleId: '691785964',
//   googleId: 'de.sky.bw',
//   description: 'Watch movies and series',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//       webView: true,
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//       webView: true,
//     },
//   ],
// } as const;

// type Sky = typeof _sky;

// export const sky = _sky as DeepWriteable<Sky> satisfies Service;

// const _tvnow = {
//   id: 'tvnow',
//   title: 'TVNOW',
//   appleId: '1057991212',
//   googleId: 'de.rtli.tvnow',
//   description: 'Watch TV',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//       webView: true,
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//       webView: true,
//     },
//   ],
// } as const;

// type Tvnow = typeof _tvnow;

// export const tvnow = _tvnow as DeepWriteable<Tvnow> satisfies Service;

const _joyn = {
  id: 'joyn',
  title: 'Joyn',
  appleId: '826510222',
  googleId: 'de.prosiebensat1digital.seventv',
  schema: 'joyn://app',
  description: 'Watch TV',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
      states: [],
      webView: true,
    },
    {
      name: 'cancel',
      type: 'manual',
      states: ['active'],
    },
    {
      name: 'resume',
      type: 'manual',
      states: ['canceled'],
    },
  ],
} as const;

type Joyn = typeof _joyn;

export const joyn = _joyn as DeepWriteable<Joyn> satisfies Service;

// const _tvplus = {
//   id: 'tvplus',
//   title: 'TV+',
//   appleId: '1057991212',
//   description: 'Watch TV',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//       webView: true,
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//       webView: true,
//     },
//   ],
// } as const;

// type Tvplus = typeof _tvplus;

// export const tvplus = _tvplus as DeepWriteable<Tvplus> satisfies Service;

// const _freenet = {
//   id: 'freenet',
//   title: 'Freenet',
//   appleId: '1057991212',
//   description: 'Watch TV',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: [],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//       webView: true,
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//       webView: true,
//     },
//   ],
// } as const;

// type Freenet = typeof _freenet;

// export const freenet = _freenet as DeepWriteable<Freenet> satisfies Service;

// const _maxdome = {
//   id: 'maxdome',
//   title: 'Maxdome',
//   appleId: '1057991212',
//   description: 'Watch TV',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: ['canceled'],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//     },
//   ],
// } as const;

// type Maxdome = typeof _maxdome;

// export const maxdome = _maxdome as DeepWriteable<Maxdome> satisfies Service;

// const _mubi = {
//   id: 'mubi',
//   title: 'Mubi',
//   appleId: '1057991212',
//   description: 'Watch TV',
//   auth: ['email', 'password'],
//   optionalDataKeys: [],
//   optional: [
//     {
//       key: 'creditcard',
//       value: {
//         number: '1234 1234 1234 1234',
//         expiration: '12/24',
//         cvc: '123',
//       },
//     },
//   ],
//   actions: [
//     {
//       name: 'connect',
//       type: 'manual',
//       states: ['canceled'],
//       webView: true,
//     },
//     {
//       name: 'cancel',
//       type: 'manual',
//       states: ['active'],
//     },
//     {
//       name: 'resume',
//       type: 'manual',
//       states: ['canceled', 'inactive'],
//     },
//   ],
// } as const;

// type Mubi = typeof _mubi;

// export const mubi = _mubi as DeepWriteable
