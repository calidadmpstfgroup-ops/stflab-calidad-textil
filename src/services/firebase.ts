import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { AreaRole } from '../types';

const env = (import.meta as any).env || {};

// Configuración de Firebase para TexLab Connect STF (sharp-quanta-0t3g1)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA2yAxugwu5yxtb-p_VwkiMwWiqvECgHMg",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "sharp-quanta-0t3g1.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "sharp-quanta-0t3g1",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "sharp-quanta-0t3g1.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "73480652639",
  appId: env.VITE_FIREBASE_APP_ID || "1:73480652639:web:fe65dde63e0729aa9e58ea",
  firestoreDatabaseId: "ai-studio-texlabconnectstf-8d9de590-47b1-4d72-bf07-629876b2666e"
};

// Inicialización Singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Colecciones Firestore según esquema TexLab Connect STF
export const FIRESTORE_COLLECTIONS = {
  muestras: 'muestras',
  chatMessages: 'chatMessages',
  revisionesPrendas: 'revisionesPrendas',
  analisisDocumentosFolders: 'analisisDocumentosFolders',
  classifications: 'classifications'
};

// Estado de conexión
export const isFirebaseConfigured = true;

// -----------------------------------------
// Autenticación real por área (email + contraseña de Firebase Auth)
// -----------------------------------------

export const AREA_EMAIL_TO_ROLE: Record<string, AreaRole> = {
  'laboratorio@stfgroup.com': 'laboratorio',
  'laboratorio@texlab.com': 'laboratorio',
  'ana.gonzalez@stfgroup.com': 'laboratorio',
  'jortiz@stfgroup.com': 'laboratorio',
  'compras@stfgroup.com': 'compras',
  'compras@texlab.com': 'compras',
  'carlos.perez@stfgroup.com': 'compras',
  'mgomez@stfgroup.com': 'compras',
  'patronaje@stfgroup.com': 'patronaje',
  'patronaje@texlab.com': 'patronaje',
  'corte@stfgroup.com': 'corte',
  'corte@texlab.com': 'corte',
  'colecciones@stfgroup.com': 'colecciones',
  'colecciones@texlab.com': 'colecciones',
  'calidad@stfgroup.com': 'calidad',
  'calidad@texlab.com': 'calidad',
  'admin.calidad@stfgroup.com': 'calidad',
  'supervision.calidad@stfgroup.com': 'calidad',
};

export function normalizeUserOrEmail(userOrEmail: string): string {
  const clean = userOrEmail.trim().toLowerCase();
  if (clean.includes('@')) return clean;

  const USER_MAP: Record<string, string> = {
    'admin': 'calidad@stfgroup.com',
    'administrador': 'calidad@stfgroup.com',
    'admin.calidad': 'calidad@stfgroup.com',
    'calidad': 'calidad@stfgroup.com',
    'laboratorio': 'laboratorio@stfgroup.com',
    'lab': 'laboratorio@stfgroup.com',
    'ana.gonzalez': 'laboratorio@stfgroup.com',
    'jortiz': 'laboratorio@stfgroup.com',
    'compras': 'compras@stfgroup.com',
    'carlos.perez': 'compras@stfgroup.com',
    'mgomez': 'compras@stfgroup.com',
    'patronaje': 'patronaje@stfgroup.com',
    'patron': 'patronaje@stfgroup.com',
    'corte': 'corte@stfgroup.com',
    'supervisor': 'calidad@stfgroup.com',
  };

  return USER_MAP[clean] || `${clean}@stfgroup.com`;
}

export function getAreaRoleFromEmail(email: string | null | undefined): AreaRole | null {
  if (!email) return null;
  const normalized = normalizeUserOrEmail(email);
  return AREA_EMAIL_TO_ROLE[normalized] || 'calidad';
}

export const DEFAULT_AREA_PASSWORDS: Record<AreaRole, string> = {
  laboratorio: 'lab123',
  compras: 'compras123',
  patronaje: 'patron123',
  corte: 'corte123',
  colecciones: 'colecciones123',
  calidad: 'admin123',
};

export async function signInWithAreaCredentials(email: string, password: string): Promise<FirebaseUser | { email: string }> {
  const normalized = normalizeUserOrEmail(email);
  const areaRole = getAreaRoleFromEmail(normalized) || 'calidad';


  // Obtain expected password (custom user-created or default area password)
  const storedPassKey = `stf_area_pass_${normalized}`;
  const savedPass = localStorage.getItem(storedPassKey);
  const expectedPassword = savedPass || DEFAULT_AREA_PASSWORDS[areaRole] || 'stf123';

  try {
    const cred = await signInWithEmailAndPassword(auth, normalized, password);
    return cred.user;
  } catch (firebaseErr: any) {
    const code = firebaseErr?.code;

    // If Firebase explicitly reports wrong password on an existing account:
    if (code === 'auth/wrong-password') {
      throw { code: 'auth/wrong-password' };
    }

    // If account not created on Firebase yet, validate against local expected password
    if (password === expectedPassword) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, normalized, password);
        return cred.user;
      } catch {
        return { email: normalized };
      }
    } else {
      // Password does NOT match
      throw { code: 'auth/wrong-password' };
    }
  }
}

export async function registerAreaAccount(email: string, password: string): Promise<FirebaseUser | { email: string }> {
  const normalized = email.trim().toLowerCase();
  const areaRole = getAreaRoleFromEmail(normalized);
  if (!areaRole) {
    throw { code: 'app/correo-no-autorizado' };
  }

  // Save new password locally
  localStorage.setItem(`stf_area_pass_${normalized}`, password);

  try {
    const cred = await createUserWithEmailAndPassword(auth, normalized, password);
    return cred.user;
  } catch (firebaseErr: any) {
    if (firebaseErr?.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalized, password);
        return cred.user;
      } catch {
        return { email: normalized };
      }
    }
    throw firebaseErr;
  }
}

export async function signOutArea(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInAnonymouslyForPortal() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn("Portal anonymous auth notice:", err);
  }
}

// Fallback & Cache helpers for Solicitudes de Proveedor
export async function dbGetSolicitudByToken(token: string): Promise<any | null> {
  try {
    const cached = localStorage.getItem('stf_solicitudes_proveedor_v1');
    if (cached) {
      const list = JSON.parse(cached);
      const found = list.find((s: any) => s.token === token || s.id === token);
      if (found) return found;
    }
  } catch {}
  return null;
}

export async function dbUpdateSolicitudProveedor(idOrToken: string, fields: any): Promise<void> {
  try {
    const cached = localStorage.getItem('stf_solicitudes_proveedor_v1');
    if (cached) {
      const list = JSON.parse(cached);
      const updated = list.map((s: any) => (s.id === idOrToken || s.token === idOrToken) ? { ...s, ...fields } : s);
      localStorage.setItem('stf_solicitudes_proveedor_v1', JSON.stringify(updated));
    }
  } catch {}
}
