import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function compressImage(file, maxDim = 2000, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
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
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.src = objectUrl;
  });
}

export async function uploadPhotoVariants(file, basePath, safeName) {
  const fullBlob = await compressImage(file);
  const thumbBlob = await compressImage(file, 520, 0.72);
  const storagePath = `${basePath}/${safeName}`;
  const thumbStoragePath = `${basePath}/thumbs/${safeName}`;
  const storageRef = ref(storage, storagePath);
  const thumbStorageRef = ref(storage, thumbStoragePath);
  await Promise.all([
    uploadBytes(storageRef, fullBlob),
    uploadBytes(thumbStorageRef, thumbBlob),
  ]);
  const [url, thumbUrl] = await Promise.all([
    getDownloadURL(storageRef),
    getDownloadURL(thumbStorageRef),
  ]);
  return { url, storagePath, thumbUrl, thumbStoragePath };
}
