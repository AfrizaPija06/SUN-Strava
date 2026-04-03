import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDMzN6T6_7LAH_iXer8kITNTtzevVaQtWo",
  authDomain: "strava-sun-sport.firebaseapp.com",
  projectId: "strava-sun-sport",
  storageBucket: "strava-sun-sport.firebasestorage.app",
  messagingSenderId: "52156402153",
  appId: "1:52156402153:web:e847e5286a197ae675e378"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // No auth used yet
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
