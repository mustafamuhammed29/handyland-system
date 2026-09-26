export const uploadToCloudinary = async (file) => {
  // المفاتيح الخاصة بحسابك
  const CLOUD_NAME = 'xd8hhdh0';
  const UPLOAD_PRESET = 'handyland_unsigned'; // يجب إنشاء هذا في حسابك وجعله Unsigned

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل الرفع إلى Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // إرجاع الرابط المباشر الآمن
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
