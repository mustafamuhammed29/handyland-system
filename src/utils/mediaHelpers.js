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
  if (dataUrlOrPath.startsWith('data:video/')) return true;
  const lowercase = dataUrlOrPath.toLowerCase();
  return lowercase.endsWith('.mp4') || lowercase.endsWith('.webm') || lowercase.endsWith('.ogg') || lowercase.endsWith('.mov');
};
