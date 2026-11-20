/**
 * Firebase for the site. The pricing page reads its prices from the Realtime Database, and the pricing admin
 * (/admin) signs in with Firebase Authentication to publish them.
 *
 * A web app's Firebase config is public by design: it names the project, it is not a password. What protects
 * the data is the database's security rules (`database.rules.json`): anyone may read the prices, only the admin
 * account may change them, and every value is checked on the server.
 *
 * The SDK is loaded on demand, only by the pages that use it.
 */
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Database } from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyDNar9BabZthbhaoLulVFiACyV05fogSLw',
  authDomain: 'gieom-cloud.firebaseapp.com',
  databaseURL: 'https://gieom-cloud-default-rtdb.firebaseio.com',
  projectId: 'gieom-cloud',
  storageBucket: 'gieom-cloud.firebasestorage.app',
  messagingSenderId: '446231019479',
  appId: '1:446231019479:web:aa0c1e74c9d4ad40b79592',
  measurementId: 'G-Y4P0STJG4J',
};

/** Builds made for local testing talk to the Firebase emulators instead of the live project. */
const EMULATORS = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === '1';

let appPromise: Promise<FirebaseApp> | null = null;
let databasePromise: Promise<Database> | null = null;
let authPromise: Promise<Auth> | null = null;

function firebaseApp(): Promise<FirebaseApp> {
  appPromise ??= import('firebase/app')
    .then(({ getApps, initializeApp }) => getApps()[0] ?? initializeApp(firebaseConfig))
    .catch((error: unknown) => {
      appPromise = null;
      throw error;
    });
  return appPromise;
}

/** The Realtime Database (one connection for the whole page). */
export function database(): Promise<Database> {
  databasePromise ??= Promise.all([firebaseApp(), import('firebase/database')])
    .then(([app, { getDatabase, connectDatabaseEmulator }]) => {
      const db = getDatabase(app);
      if (EMULATORS) connectDatabaseEmulator(db, '127.0.0.1', 9000);
      return db;
    })
    .catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  return databasePromise;
}

/** Firebase Authentication. The admin session is kept for this browser tab only, and ends when it is closed. */
export function authentication(): Promise<Auth> {
  authPromise ??= Promise.all([firebaseApp(), import('firebase/auth')])
    .then(([app, { initializeAuth, browserSessionPersistence, connectAuthEmulator }]) => {
      const auth = initializeAuth(app, { persistence: browserSessionPersistence });
      if (EMULATORS) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      return auth;
    })
    .catch((error: unknown) => {
      authPromise = null;
      throw error;
    });
  return authPromise;
}
