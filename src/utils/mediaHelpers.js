export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const isVideoMedia = (dataUrlOrPath) => {
  if (!dataUrlOrPath) return false;
  if (typeof dataUrlOrPath !== 'string') return false;
  if (dataUrlOrPath.startsWith('data:video/')) return true;
  if (dataUrlOrPath.startsWith('blob:video/')) return true;
  const lowercase = dataUrlOrPath.toLowerCase();
  return lowercase.includes('video') || lowercase.endsWith('.mp4') || lowercase.endsWith('.webm') || lowercase.endsWith('.ogg') || lowercase.endsWith('.mov');
};

// تحويل نص DataURL الخاص بالفيديو إلى Blob URL حقيقي يفهمه مشغل HTML5 في جميع المتصفحات والشاشات
const blobCacheMap = new Map();

export const getMediaSrc = (dataUrlOrPath) => {
  if (!dataUrlOrPath) return '';
  if (typeof dataUrlOrPath !== 'string') return dataUrlOrPath;

  if (dataUrlOrPath.startsWith('data:video/')) {
    if (blobCacheMap.has(dataUrlOrPath)) {
      return blobCacheMap.get(dataUrlOrPath);
    }
    try {
      const parts = dataUrlOrPath.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      blobCacheMap.set(dataUrlOrPath, objectUrl);
      return objectUrl;
    } catch (e) {
      console.error("Error converting video Base64 to Blob URL:", e);
      return dataUrlOrPath;
    }
  }
  return dataUrlOrPath;
};
