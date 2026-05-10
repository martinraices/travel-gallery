import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

function throwIfAborted(signal) {
  if (signal?.aborted) throw new DOMException('Operation cancelled', 'AbortError');
}

export function compressImage(file, maxDim = 2000, quality = 0.82, signal = null) {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    const abort = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new DOMException('Operation cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', abort, { once: true });
    img.onload = () => {
      signal?.removeEventListener('abort', abort);
      if (signal?.aborted) {
        abort();
        return;
      }
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (signal?.aborted) {
          reject(new DOMException('Operation cancelled', 'AbortError'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = () => {
      signal?.removeEventListener('abort', abort);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image for compression.'));
    };
    img.src = objectUrl;
  });
}

function uploadBytesCancellable(storageRef, blob, signal = null) {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const task = uploadBytesResumable(storageRef, blob);
    const abort = () => {
      task.cancel();
      reject(new DOMException('Operation cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', abort, { once: true });
    task.on('state_changed', null, (err) => {
      signal?.removeEventListener('abort', abort);
      if (signal?.aborted || err.code === 'storage/canceled') {
        reject(new DOMException('Operation cancelled', 'AbortError'));
      } else {
        reject(err);
      }
    }, (snapshot) => {
      signal?.removeEventListener('abort', abort);
      resolve(snapshot);
    });
  });
}

export async function uploadPhotoVariants(file, basePath, safeName, options = {}) {
  const { signal = null } = options;
  const fullBlob = await compressImage(file, 2000, 0.82, signal);
  const thumbBlob = await compressImage(file, 520, 0.72, signal);
  throwIfAborted(signal);
  const storagePath = `${basePath}/${safeName}`;
  const thumbStoragePath = `${basePath}/thumbs/${safeName}`;
  const storageRef = ref(storage, storagePath);
  const thumbStorageRef = ref(storage, thumbStoragePath);
  await Promise.all([
    uploadBytesCancellable(storageRef, fullBlob, signal),
    uploadBytesCancellable(thumbStorageRef, thumbBlob, signal),
  ]);
  throwIfAborted(signal);
  const [url, thumbUrl] = await Promise.all([
    getDownloadURL(storageRef),
    getDownloadURL(thumbStorageRef),
  ]);
  return { url, storagePath, thumbUrl, thumbStoragePath };
}
