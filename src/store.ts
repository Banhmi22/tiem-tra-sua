// ─── Customer-side Firebase data layer ───────────────────────────────────────
// READ-ONLY from customer perspective — admin writes via 奶茶店-admin project
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

export type Tea = {
  id: string;
  name: string;
  desc: string;
  prices: { S: number; M: number; L: number };
  image: string;
  animal: 'cat' | 'rabbit';
  iceOnly: boolean;
  sugarChoice?: boolean;
};

// ── Fallback menu (shown while loading or if Firebase is not yet configured) ──
export const DEFAULT_TEAS: Tea[] = [
  { id: 't1', name: "抹茶拿铁",     desc: "Matcha Latte",          prices: { S: 6.9, M: 9.9,  L: 11.9 }, image: "/assets/matcha-lt.png",          animal: 'cat',    iceOnly: false, sugarChoice: true  },
  { id: 't2', name: "草莓抹茶奶乳", desc: "Strawberry Matcha Milk", prices: { S: 8,   M: 10,   L: 12   }, image: "/assets/strawberry.matcha.png",  animal: 'rabbit', iceOnly: true,  sugarChoice: true  },
  { id: 't3', name: "越南奶咖",     desc: "Cà phê sữa (Vietnam)",   prices: { S: 5.9, M: 7.9,  L: 9.9  }, image: "/assets/vietnam-cf.png",         animal: 'rabbit', iceOnly: true,  sugarChoice: false },
  { id: 't4', name: "咖啡拿铁",     desc: "Coffee Latte",           prices: { S: 6,   M: 8,    L: 10   }, image: "/assets/cf-latte.png",           animal: 'rabbit', iceOnly: false, sugarChoice: false },
  { id: 't5', name: "美式咖啡",     desc: "Americano",              prices: { S: 5,   M: 6.5,  L: 8    }, image: "/assets/americano.thaomy.png",  animal: 'cat',    iceOnly: true,  sugarChoice: false },
  { id: 't6', name: "草莓冰奶",     desc: "Strawberry Milk",        prices: { S: 6,   M: 8,    L: 10   }, image: "/assets/strawberry.milk.png",   animal: 'cat',    iceOnly: true,  sugarChoice: true  },
  { id: 't7', name: "草莓酸奶",     desc: "Strawberry Yogurt",      prices: { S: 6,   M: 8,    L: 10   }, image: "/assets/suachua.lacdau.png",    animal: 'rabbit', iceOnly: true,  sugarChoice: true  },
  { id: 't8', name: "泰国奶茶",     desc: "Thai Milk Tea",          prices: { S: 5,   M: 6.5,  L: 8    }, image: "/assets/thai-tea.png",           animal: 'cat',    iceOnly: true,  sugarChoice: true  },
];

// ── Hard-coded Firebase config (admin-only internal app, no secret risk) ──────
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyAy03sHO3Bc0176d8yH8JzUqf4l7xgv-O0',
  authDomain:        'mewwtea-db.firebaseapp.com',
  databaseURL:       'https://mewwtea-db-default-rtdb.firebaseio.com',
  projectId:         'mewwtea-db',
  storageBucket:     'mewwtea-db.firebasestorage.app',
  messagingSenderId: '845433605012',
  appId:             '1:845433605012:web:09316e18bf3ff6b5a91d81',
};

// ── Initialize Firebase (singleton) ──────────────────────────────────────────
function getDB() {
  try {
    if (!getApps().length) initializeApp(FIREBASE_CONFIG);
    return getDatabase();
  } catch (e) {
    console.error('🔴 [Store] Firebase init failed:', e);
    return null;
  }
}

// ── Live hook — subscribes to Firebase, falls back to DEFAULT_TEAS ────────────
export function useStoreData() {
  const [teas,      setTeas]      = useState<Tea[]>(DEFAULT_TEAS);
  const [storeOpen, setStoreOpen] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading,   setLoading]   = useState<boolean>(true);

  useEffect(() => {
    const db = getDB();
    if (!db) { setLoading(false); return; }

    const unsub = onValue(
      ref(db, '/'),
      (snap) => {
        const data = snap.val();
        if (data) {
          setStoreOpen(data.storeOpen ?? true);
          if (data.teas) setTeas(Object.values(data.teas) as Tea[]);
        }
        setConnected(true);
        setLoading(false);
      },
      (err) => {
        console.error('🔴 [Store] Firebase read error:', err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { teas, storeOpen, connected, loading };
}
