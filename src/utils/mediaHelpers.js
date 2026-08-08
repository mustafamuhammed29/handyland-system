export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.76, autoCropTo169 = false) => {
  return new Promise((resolve) => {
    if (!file || (file.type && file.type.startsWith('video/'))) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let srcX = 0;
        let srcY = 0;
        let srcWidth = img.width;
        let srcHeight = img.height;

        if (autoCropTo169) {
          const targetRatio = 16 / 9;
          const currentRatio = img.width / img.height;

          if (currentRatio > targetRatio) {
            srcWidth = Math.round(img.height * targetRatio);
            srcX = Math.round((img.width - srcWidth) / 2);
          } else if (currentRatio < targetRatio) {
            srcHeight = Math.round(img.width / targetRatio);
            srcY = Math.round((img.height - srcHeight) / 2);
          }
        }

        let destWidth = srcWidth;
        let destHeight = srcHeight;

        if (destWidth > maxWidth || destHeight > maxHeight) {
          if (destWidth / destHeight > maxWidth / maxHeight) {
            destHeight = Math.round((destHeight * maxWidth) / destWidth);
            destWidth = maxWidth;
          } else {
            destWidth = Math.round((destWidth * maxHeight) / destHeight);
            destHeight = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = destWidth;
        canvas.height = destHeight;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, destWidth, destHeight);
        }

        // اختيار نوع الصورة المضغوطة (WebP أو JPEG)
        const format = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to jpeg if webp not supported
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    resolve(file);
                    return;
                  }
                  resolve(new File([jpegBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }));
                },
                'image/jpeg',
                0.78
              );
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          format,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

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
