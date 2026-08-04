import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// ========= إصلاح مشكلة دوران الشاشة على أندرويد =========
// حساب الارتفاع الفعلي للشاشة وتعيينه كـ CSS variable
const updateAppHeight = () => {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${vh}px`);
};

// تشغيل عند التحميل الأول
updateAppHeight();

// الاستماع لتغيير الاتجاه (orientationchange) + resize
// orientationchange يعمل على أندرويد عند الدوران
window.addEventListener('orientationchange', () => {
  // تأخير قصير لأن Android يحتاج وقتاً لتحديث الأبعاد بعد الدوران
  setTimeout(updateAppHeight, 100);
  setTimeout(updateAppHeight, 300);
});

// resize يعمل كـ fallback عندما يظهر/يختفي شريط العنوان في Chrome
window.addEventListener('resize', updateAppHeight);

// ========= نهاية إصلاح الدوران =========

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
