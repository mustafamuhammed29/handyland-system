/**
 * دالة مساعدة محترفة لتفعيل وضع ملء الشاشة (Fullscreen) بمرونة عالية
 * متوافقة مع جميع أنواع الشاشات والمتصفحات (Chrome, Safari, Smart TV, WebOS, Tizen, Firefox, Edge).
 */
export const requestUniversalFullscreen = () => {
  try {
    const doc = document;
    const docEl = document.documentElement;

    // التأكد مما إذا كانت الشاشة مكبرة بالفعل
    if (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    ) {
      return true;
    }

    const requestMethod =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.webkitRequestAnimationFrame ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    if (requestMethod) {
      const promise = requestMethod.call(docEl);
      if (promise && typeof promise.then === 'function') {
        promise.catch((err) => {
          console.warn('Universal Fullscreen notice:', err);
        });
      }
      return true;
    }
  } catch (e) {
    console.warn('Universal Fullscreen error:', e);
  }
  return false;
};

/**
 * دالة للخروج من وضع ملء الشاشة
 */
export const exitUniversalFullscreen = () => {
  try {
    const doc = document;
    if (
      !doc.fullscreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.msFullscreenElement
    ) {
      return true;
    }

    const exitMethod =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (exitMethod) {
      const promise = exitMethod.call(doc);
      if (promise && typeof promise.then === 'function') {
        promise.catch(() => {});
      }
      return true;
    }
  } catch (e) {
    console.warn('Exit Fullscreen notice:', e);
  }
  return false;
};
