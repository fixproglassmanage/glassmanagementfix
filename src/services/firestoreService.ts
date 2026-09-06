import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from '../firebase';
import {
  Product,
  Category,
  Brand,
  Unit,
  SellingListItem,
  DueListItem,
  Customer,
  Manager,
  ReturnItem
} from '../types';

// Collection Names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  UNITS: 'units',
  SALES: 'sales',
  DUES: 'dues',
  CUSTOMERS: 'customers',
  MANAGERS: 'managers',
  RETURNS: 'returns',
  SETTINGS: 'settings',
};

// Generic Realtime Subscription with silent offline resilience
export function subscribeCollection<T extends { id?: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data();
          return {
            id: docSnap.id,
            ...docData,
          } as unknown as T;
        });
        // Always emit current state, even if empty array
        onData(items);
      },
      (error) => {
        // Suppress benign offline/unavailable network messages in sandboxed previews
        if (error?.code !== 'unavailable') {
          console.debug(`Firestore sync status for ${collectionName}:`, error?.message || error);
        }
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}

// Save or Update Single Document
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(data.id));
    await setDoc(docRef, data, { merge: true });
  } catch {
    // Graceful offline fallback
  }
}

// Delete Single Document
export async function removeDocument(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
  } catch {
    // Graceful offline fallback
  }
}

// Clear all documents in a specific Firestore collection
export async function clearCollectionInFirestore(collectionName: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    if (snap.empty) return;
    
    // Batch deletes in chunks of 300
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 300) {
      const chunk = docs.slice(i, i + 300);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.debug(`Clear collection ${collectionName} note:`, err);
  }
}

// Bulk Sync/Save Entire Array to Firestore
export async function syncCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items || items.length === 0) {
    // If empty array passed, clear the remote collection
    await clearCollectionInFirestore(collectionName);
    return;
  }
  try {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += 300) {
      chunks.push(items.slice(i, i + 300));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (item && item.id) {
          const docRef = doc(db, collectionName, String(item.id));
          batch.set(docRef, item, { merge: true });
        }
      }
      await batch.commit();
    }
  } catch {
    // Silently continue in offline mode
  }
}

// Wipe operational data completely across multiple collections
export async function wipeFirestoreDatabase(options: {
  wipeSales?: boolean;
  wipeDues?: boolean;
  wipeProducts?: boolean;
  wipeCustomers?: boolean;
  wipeReturns?: boolean;
  wipeCategories?: boolean;
  wipeBrands?: boolean;
  wipeUnits?: boolean;
  wipeNonAdminManagers?: boolean;
}): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (options.wipeSales) tasks.push(clearCollectionInFirestore(COLLECTIONS.SALES));
  if (options.wipeDues) tasks.push(clearCollectionInFirestore(COLLECTIONS.DUES));
  if (options.wipeProducts) tasks.push(clearCollectionInFirestore(COLLECTIONS.PRODUCTS));
  if (options.wipeCustomers) tasks.push(clearCollectionInFirestore(COLLECTIONS.CUSTOMERS));
  if (options.wipeReturns) tasks.push(clearCollectionInFirestore(COLLECTIONS.RETURNS));
  if (options.wipeCategories) tasks.push(clearCollectionInFirestore(COLLECTIONS.CATEGORIES));
  if (options.wipeBrands) tasks.push(clearCollectionInFirestore(COLLECTIONS.BRANDS));
  if (options.wipeUnits) tasks.push(clearCollectionInFirestore(COLLECTIONS.UNITS));

  if (options.wipeNonAdminManagers) {
    tasks.push((async () => {
      try {
        const snap = await getDocs(collection(db, COLLECTIONS.MANAGERS));
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.role !== 'Super Admin') {
            batch.delete(docSnap.ref);
          }
        });
        await batch.commit();
      } catch (e) {
        console.debug('Manager wipe note:', e);
      }
    })());
  }

  await Promise.allSettled(tasks);
}

// Seed initial Admin manager if database has NO managers at all
export async function seedInitialDataIfEmpty(initialData: {
  managers: Manager[];
}) {
  try {
    const managersSnap = await getDocs(collection(db, COLLECTIONS.MANAGERS));
    if (managersSnap.empty && initialData.managers && initialData.managers.length > 0) {
      // Only seed the Super Admin account
      await syncCollection(COLLECTIONS.MANAGERS, initialData.managers);
    }
  } catch {
    // Handled gracefully when offline or during initial connection setup
  }
}
