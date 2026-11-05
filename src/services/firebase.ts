import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AuditLogItem,
  Endorsement,
  NotificationItem,
  UserProfile,
  UserRole,
} from '../types/endorsement';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app needs firestoreDatabaseId for custom provisioned DB
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Provider with Google Workspace Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (Workspace Integration Skill requirement)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Test Firestore connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up...');
    }
  }
}
testConnection();

// Structured Firestore error handler
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
  role: UserRole;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    const email = result.user.email || '';
    // Auto assign Owner for primary user or mami.elen14@gmail.com
    let role: UserRole = 'talent';
    if (email.toLowerCase() === 'mami.elen14@gmail.com') {
      role = 'owner';
    } else if (email.includes('admin') || email.includes('agency')) {
      role = 'admin';
    }

    // Upsert user profile to Firestore
    try {
      const userRef = doc(db, 'users', result.user.uid);
      const existing = await getDoc(userRef);
      if (!existing.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Pengguna',
          photoURL: result.user.photoURL || '',
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        const data = existing.data();
        if (data?.role) {
          role = data.role as UserRole;
        }
      }
    } catch (e) {
      console.warn('Could not sync user profile to Firestore:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken || '', role };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Firestore CRUD operations with handleFirestoreError

export async function fetchEndorsementsFromFirestore(): Promise<Endorsement[]> {
  const path = 'endorsements';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Endorsement);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveEndorsementToFirestore(endorsement: Endorsement): Promise<void> {
  const path = `endorsements/${endorsement.id}`;
  try {
    await setDoc(doc(db, 'endorsements', endorsement.id), endorsement);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateEndorsementInFirestore(
  id: string,
  updates: Partial<Endorsement>
): Promise<void> {
  const path = `endorsements/${id}`;
  try {
    await updateDoc(doc(db, 'endorsements', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteEndorsementFromFirestore(id: string): Promise<void> {
  const path = `endorsements/${id}`;
  try {
    await deleteDoc(doc(db, 'endorsements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveNotificationToFirestore(notification: NotificationItem): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), notification);
  } catch (err) {
    console.warn('Notification save warning:', err);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (err) {
    console.warn('Failed to mark notification read:', err);
  }
}

export async function saveAuditLogToFirestore(log: AuditLogItem): Promise<void> {
  try {
    await setDoc(doc(db, 'audit_logs', log.id), log);
  } catch (err) {
    console.warn('Audit log save warning:', err);
  }
}

export function subscribeToEndorsements(
  onUpdate: (endorsements: Endorsement[]) => void,
  onError?: (err: any) => void
) {
  const path = 'endorsements';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as Endorsement);
      onUpdate(items);
    },
    (err) => {
      console.warn('Subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToNotifications(
  onUpdate: (notifications: NotificationItem[]) => void
) {
  const path = 'notifications';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs
        .map((doc) => doc.data() as NotificationItem)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      console.warn('Notification subscription error:', err);
    }
  );
}
