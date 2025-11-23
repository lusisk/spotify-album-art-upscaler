const DB_NAME = "CoverUpDB";
const STORE_NAME = "sharedImages";
const DB_VERSION = 1;

interface ShareData {
  id: string;
  blob: Blob;
  albumName: string;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function storeSharedImage(
  shareId: string,
  blob: Blob,
  albumName: string
): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const shareData: ShareData = {
    id: shareId,
    blob,
    albumName,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(shareData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSharedImage(
  shareId: string
): Promise<ShareData | null> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(shareId);
    request.onsuccess = () => {
      const data = request.result as ShareData | undefined;

      // Check if data exists and is not expired (1 hour)
      if (data) {
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - data.timestamp > oneHour) {
          deleteSharedImage(shareId);
          resolve(null);
        } else {
          resolve(data);
        }
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSharedImage(shareId: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(shareId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function cleanupExpiredShares(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.openCursor();
    const oneHour = 60 * 60 * 1000;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const data = cursor.value as ShareData;
        if (Date.now() - data.timestamp > oneHour) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}
