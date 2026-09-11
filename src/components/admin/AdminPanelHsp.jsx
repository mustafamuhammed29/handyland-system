import React, { useState, useEffect } from 'react';
import {
  Settings, Scissors, Sparkles, Plus, Trash2,
  ArrowRight, ArrowLeft, Image as ImageIcon, Video, Save, Globe,
  Layout, Type, Timer, Key, CloudSun, Gauge, LogOut,
  Activity, Bot, Maximize, RefreshCw, AlertTriangle, CheckCircle2,
  Sliders, Star,
  Clock, Eye, EyeOff
} from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';
import { supabase } from '../../services/supabase';
import { convertToBase64, isVideoMedia, getMediaSrc, compressImage } from '../../utils/mediaHelpers';
import {
  DEFAULT_PIN, DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  HSP_DEFAULT_TICKER, HSP_DEFAULT_SUBTITLE, DEFAULT_LOGO, HSP_DEFAULT_LOGO
} from '../../constants/defaults';

export const AdminPanelHsp = ({
  screen1Items = [],
  customLogo, customFavicon, tickerText, tickerSpeed = DEFAULT_TICKER_SPEED,
  fontSize = DEFAULT_FONT_SIZE, headerSubtitle,
  intervalScreen1 = 6,
  adminPin, cityName,
  titleScreen1 = '',
  showClock = true,
  maintenanceMessage = '', storeStatusMode = 'active', statusTimerTarget = '',
  onBack, onRefresh, lang, setLang, t
}) => {
  const [activeTab, setActiveTab] = useState('screen1');
  const [loading, setLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [autoCrop169, setAutoCrop169] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const [editableTicker, setEditableTicker] = useState(tickerText || HSP_DEFAULT_TICKER);
  const [editableTickerSpeed, setEditableTickerSpeed] = useState(tickerSpeed || DEFAULT_TICKER_SPEED);
  const [editableFontSize, setEditableFontSize] = useState(fontSize || DEFAULT_FONT_SIZE);
  const [editableSubtitle, setEditableSubtitle] = useState(headerSubtitle || HSP_DEFAULT_SUBTITLE);
  const [editableTimer1, setEditableTimer1] = useState(intervalScreen1 || 6);
  const [editableTitle1, setEditableTitle1] = useState(titleScreen1 || 'HSP Hair & Beauty');
  const [editablePin, setEditablePin] = useState(adminPin || DEFAULT_PIN);
  const [editableCity, setEditableCity] = useState(cityName || DEFAULT_CITY);
  const [editableShowClock, setEditableShowClock] = useState(showClock !== false);
  const [editableStoreStatusMode, setEditableStoreStatusMode] = useState(storeStatusMode || 'active');
  const [editableMaintenanceMsg, setEditableMaintenanceMsg] = useState(maintenanceMessage || '');
  const [timerDuration, setTimerDuration] = useState('none');

  useEffect(() => { setEditableTicker(tickerText || HSP_DEFAULT_TICKER); }, [tickerText]);
  useEffect(() => { setEditableTickerSpeed(tickerSpeed || DEFAULT_TICKER_SPEED); }, [tickerSpeed]);
  useEffect(() => { setEditableFontSize(fontSize || DEFAULT_FONT_SIZE); }, [fontSize]);
  useEffect(() => { setEditableSubtitle(headerSubtitle || HSP_DEFAULT_SUBTITLE); }, [headerSubtitle]);
  useEffect(() => { setEditableTimer1(intervalScreen1 || 6); }, [intervalScreen1]);
  useEffect(() => { setEditableTitle1(titleScreen1 || 'HSP Hair & Beauty'); }, [titleScreen1]);
  useEffect(() => { setEditablePin(adminPin || DEFAULT_PIN); }, [adminPin]);
  useEffect(() => { setEditableCity(cityName || DEFAULT_CITY); }, [cityName]);
  useEffect(() => { setEditableShowClock(showClock !== false); }, [showClock]);
  useEffect(() => { setEditableMaintenanceMsg(maintenanceMessage || ''); }, [maintenanceMessage]);
  useEffect(() => { setEditableStoreStatusMode(storeStatusMode || 'active'); }, [storeStatusMode]);

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (let f of files) {
      if (f.size > 20971520) { // 20MB
        alert(t.imageTooLarge || 'حجم الملف كبير جداً');
        return;
      }
    }

    setImageFiles(files);
    const hasVideo = files.some(f => f.type.startsWith('video/'));
    setIsPreviewVideo(hasVideo);

    const previews = [];
    let processed = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews[index] = reader.result;
        processed++;
        if (processed === files.length) {
          setImagePreviews([...previews]);
          if (!hasVideo && previews[0]) {
            const img = new Image();
            img.src = previews[0];
            img.onload = () => {
              const ratio = img.width / img.height;
              const is169 = ratio >= 1.7 && ratio <= 1.85;
              setImageDimensions({ width: img.width, height: img.height, is169 });
            };
          } else {
            setImageDimensions(null);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePreview = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    if (newFiles.length === 0) {
      setIsPreviewVideo(false);
      setImageDimensions(null);
      const fileInput = document.getElementById('hspPosterUpload');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert(t.selectImageFirst || 'يرجى اختيار ملف أولاً');
      return;
    }
    setLoading(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const compressedFile = await compressImage(file, 1920, 1080, 0.82, autoCrop169);
        const base64Image = await convertToBase64(compressedFile);
        return { imageData: base64Image };
      });

      const newRows = await Promise.all(uploadPromises);
      const { error } = await supabase.from('hsp_screen1').insert(newRows);

      if (error) throw error;

      setImageFiles([]);
      setImagePreviews([]);
      setIsPreviewVideo(false);
      setImageDimensions(null);
      setAutoCrop169(false);
      const fileInput = document.getElementById('hspPosterUpload');
      if (fileInput) fileInput.value = '';
      if (onRefresh) onRefresh();
      alert(t.uploadSuccess || 'تم الرفع بنجاح!');
    } catch (err) {
      console.error(err);
      alert(t.uploadError || 'حدث خطأ أثناء الرفع');
    }
    setLoading(false);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا البوستر؟' : 'Möchten Sie dieses Medium wirklich löschen?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_screen1').delete().eq('id', id);
      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ أثناء الحذف' : 'Fehler beim Löschen');
    }
    setLoading(false);
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) {
        alert(t.logoTooLarge || 'حجم الشعار كبير');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    try {
      const compressed = await compressImage(logoFile, 500, 500, 0.85);
      const base64 = await convertToBase64(compressed);
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', logoData: base64 });
      if (error) throw error;
      setLogoFile(null);
      setLogoPreview(null);
      alert(t.saveSuccess || 'تم الحفظ بنجاح');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError || 'خطأ في الحفظ');
    }
    setLoading(false);
  };

  const handleResetLogo = async () => {
    if (!window.confirm(isAr ? 'هل تود استعادة الشعار الافتراضي لـ HSP؟' : 'HSP Standard-Logo wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('hsp_settings').update({ logoData: null }).eq('id', 'config');
      alert(t.resetSuccess || 'تمت الاستعادة بنجاح');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFaviconSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) {
        alert(isAr ? 'حجم الأيقونة كبير جداً' : 'Favicon zu groß');
        return;
      }
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFaviconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFavicon = async (e) => {
    e.preventDefault();
    if (!faviconFile) return;
    setLoading(true);
    try {
      const compressed = await compressImage(faviconFile, 200, 200, 0.9);
      const base64 = await convertToBase64(compressed);
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', faviconData: base64 });
      if (error) throw error;
      setFaviconFile(null);
      setFaviconPreview(null);
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError || 'خطأ في الحفظ');
    }
    setLoading(false);
  };

  const handleSaveTicker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', tickerText: editableTicker });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleResetTicker = async () => {
    if (!window.confirm(isAr ? 'هل تريد استعادة النص الافتراضي؟' : 'Standard-Lauftext wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('hsp_settings').upsert({ id: 'config', tickerText: HSP_DEFAULT_TICKER });
      setEditableTicker(HSP_DEFAULT_TICKER);
      alert(t.resetSuccess || 'تمت الاستعادة');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTickerSpeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({
        id: 'config',
        tickerSpeed: parseInt(editableTickerSpeed) || DEFAULT_TICKER_SPEED
      });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveSubtitle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', headerSubtitle: editableSubtitle });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTimer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({
        id: 'config',
        intervalScreen1: parseInt(editableTimer1) || 6
      });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTitle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({
        id: 'config',
        titleScreen1: editableTitle1
      });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!editablePin || editablePin.length < 4) {
      alert(isAr ? 'يجب أن يتكون الرمز من 4 أرقام على الأقل' : 'PIN muss mindestens 4 Ziffern lang sein');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', adminPin: editablePin });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', cityName: editableCity });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleToggleShowClock = async () => {
    const nextVal = !editableShowClock;
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', showClock: nextVal });
      if (error) throw error;
      setEditableShowClock(nextVal);
      alert(t.saveSuccess || (isAr ? 'تم حفظ التغيير بنجاح' : 'Erfolgreich gespeichert!'));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ في الحفظ' : 'Fehler beim Speichern');
    }
    setLoading(false);
  };

  const handleSaveFontSize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('hsp_settings').upsert({ id: 'config', fontSize: editableFontSize });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveStoreStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let targetIsoString = '';
      if (timerDuration !== 'none' && editableStoreStatusMode !== 'active') {
        const mins = parseInt(timerDuration, 10);
        if (!isNaN(mins) && mins > 0) {
          const d = new Date();
          d.setMinutes(d.getMinutes() + mins);
          targetIsoString = d.toISOString();
        }
      }

      const { error } = await supabase.from('hsp_settings').upsert({
        id: 'config',
        storeStatusMode: editableStoreStatusMode,
        statusTimerTarget: targetIsoString,
        maintenanceMode: editableStoreStatusMode === 'maintenance',
        maintenanceMessage: editableMaintenanceMsg
      });

      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ في الحفظ' : 'Fehler beim Speichern');
    }
    setLoading(false);
  };

  const handleForceReload = async () => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من إجبار شاشة HSP على التحديث الفوري الآن؟' : 'HSP-Bildschirm jetzt sofort neu laden?')) return;
    setLoading(true);
    try {
      const now = Date.now();
      await supabase.from('hsp_settings').upsert({ id: 'config', forceReload: now });

      const channel = supabase.channel('public:handyland_tv_signage_v6');
      const reloadPayload = {
        type: 'broadcast',
        event: 'FORCE_RELOAD_ALL_SCREENS',
        payload: { targetSystem: 'HSP', timestamp: now }
      };
      if (typeof channel.httpSend === 'function') {
        await channel.httpSend(reloadPayload);
      } else {
        await channel.send(reloadPayload);
      }

      alert(isAr ? 'تم إرسال أمر التحديث الفوري للشاشة!' : 'Aktualisierungsbefehl gesendet!');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTriggerFullscreen = async () => {
    try {
      const channel = supabase.channel('public:handyland_tv_signage_v6');
      const fsPayload = {
        type: 'broadcast',
        event: 'REMOTE_TRIGGER_FULLSCREEN',
        payload: { targetView: 'hsp-screen1', system: 'HSP' }
      };
      if (typeof channel.httpSend === 'function') {
        await channel.httpSend(fsPayload);
      } else {
        await channel.send(fsPayload);
      }
      alert(isAr ? 'تم إرسال أمر ملء الشاشة للتلفزيون!' : 'Vollbild-Signal an TV gesendet!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070605] text-white flex flex-col font-sans relative overflow-x-hidden" dir={dir}>
      <TVScreenControls />

      {/* Warm Salon Aesthetic Glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#C49A6C]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-[#C49A6C]/30 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-[#C49A6C]/10 hover:bg-[#C49A6C] text-[#D2B48C] hover:text-black px-4 py-2 rounded-full border border-[#C49A6C]/40 transition-all cursor-pointer font-bold"
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            <span>{isAr ? 'العودة للبوابة' : 'Zurück zum Portal'}</span>
          </button>

          <div className="flex items-center gap-3">
            <img 
              src={customLogo || HSP_DEFAULT_LOGO} 
              alt="HSP Logo" 
              className="h-10 w-10 object-contain rounded-full border border-[#C49A6C]/50 shadow-[0_0_10px_rgba(196,154,108,0.4)] bg-[#C49A6C]"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_LOGO; }}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-[#D2B48C] to-[#C49A6C]">
                HSP HAIR & BEAUTY
              </h1>
              <p className="text-xs text-[#D2B48C]/80 font-semibold tracking-wide">
                {isAr ? 'لوحة تحكم صالون الشعر والتجميل (Haar Studio Plöck)' : 'Verwaltungskonsole Friseursalon Heidelberg'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6">
        <div className="grid grid-cols-2 gap-3 bg-black/60 p-2 rounded-2xl border border-[#C49A6C]/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('screen1')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'screen1'
                ? 'bg-gradient-to-r from-[#C49A6C] to-[#D2B48C] text-black shadow-[0_0_20px_rgba(196,154,108,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>{editableTitle1 || (isAr ? 'إدارة الشاشة والبوسترات' : 'Bildschirm 1 (Plakate & Videos)')}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
              {screen1Items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#C49A6C] to-[#D2B48C] text-black shadow-[0_0_20px_rgba(196,154,108,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isAr ? 'الإعدادات العامة والشريط الإخباري' : 'Einstellungen & Lauftext'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1">
        {activeTab === 'screen1' && (
          <div className="space-y-8">
            {/* Screen Action Bar */}
            <div className="bg-gradient-to-r from-black/80 via-neutral-950 to-black/80 p-6 rounded-3xl border border-[#C49A6C]/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-[#C49A6C]/10 p-4 rounded-2xl border border-[#C49A6C]/30">
                  <Scissors className="w-8 h-8 text-[#D2B48C]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{editableTitle1}</h2>
                  <p className="text-gray-400 text-sm">
                    {isAr 
                      ? 'إدارة البوسترات ومقاطع الفيديو المعروضة على شاشة الصالون الذكية'
                      : 'Medienverwaltung für Bildschirm (hsp-screen1)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTriggerFullscreen}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <Maximize className="w-4 h-4 text-[#D2B48C]" />
                  <span>{isAr ? 'ملء الشاشة للتلفاز' : 'TV Vollbild'}</span>
                </button>
                <a
                  href="#hsp-screen1"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(196,154,108,0.4)] cursor-pointer"
                >
                  <span>{isAr ? 'معاينة الشاشة مباشرة' : 'Bildschirm öffnen'}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-black/60 border-2 border-dashed border-[#C49A6C]/40 hover:border-[#D2B48C] rounded-3xl p-8 transition-colors text-center relative backdrop-blur-md">
              <input
                type="file"
                id="hspPosterUpload"
                multiple
                accept="image/*,video/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-[#C49A6C]/10 p-5 rounded-full mb-4 border border-[#C49A6C]/20">
                  <ImageIcon className="w-10 h-10 text-[#D2B48C]" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  {isAr ? 'اضغط هنا لرفع صور أو مقاطع فيديو لصالون HSP' : 'Klicken Sie hier zum Hochladen von Bildern oder Videos'}
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  {isAr 
                    ? 'يدعم صور التصاميم والقصات ومقاطع الفيديو MP4 حتى 20MB بجودة كاملة 16:9'
                    : 'Unterstützt Bilder & MP4 Videos bis 20MB im 16:9 Vollbild'}
                </p>
              </div>
            </div>

            {/* Previews before upload */}
            {imagePreviews.length > 0 && (
              <div className="bg-neutral-950/80 p-6 rounded-3xl border border-[#C49A6C]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#D2B48C] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#D2B48C]" />
                    <span>{isAr ? `الملفات المحددة للرفع (${imagePreviews.length})` : `Ausgewählte Medien (${imagePreviews.length})`}</span>
                  </h4>

                  <label className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border border-white/10 hover:border-[#D2B48C]/50">
                    <input
                      type="checkbox"
                      checked={autoCrop169}
                      onChange={(e) => setAutoCrop169(e.target.checked)}
                      className="accent-[#C49A6C] cursor-pointer"
                    />
                    <span>{isAr ? 'قص تلقائي 16:9 لملء الشاشة' : 'Automatischer Zuschnitt auf 16:9'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {imagePreviews.map((prev, idx) => (
                    <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                      {isVideoMedia(prev) ? (
                        <video src={prev} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={prev} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={(e) => handleRemovePreview(idx, e)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUploadImage}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#C49A6C] to-[#D2B48C] hover:from-[#D2B48C] hover:to-[#C49A6C] text-black font-black px-8 py-3 rounded-2xl shadow-[0_0_20px_rgba(196,154,108,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? (isAr ? 'جاري الرفع...' : 'Wird hochgeladen...') : (isAr ? 'بدء الرفع الآن' : 'Jetzt hochladen')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Current Media List */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#D2B48C] flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>
                  {isAr 
                    ? `البوسترات والفيديوهات المعروضة حالياً (${screen1Items.length})` 
                    : `Aktuell angezeigte Medien (${screen1Items.length})`}
                </span>
              </h3>

              {screen1Items.length === 0 ? (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center text-gray-500 font-medium">
                  {isAr ? 'لا توجد بوسترات أو مقاطع فيديو معروضة على شاشة الصالون حالياً.' : 'Derzeit sind keine Medien für diesen Bildschirm vorhanden.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {screen1Items.map((item, index) => {
                    const isVid = isVideoMedia(item.imageData);
                    return (
                      <div key={item.id || index} className="group bg-black/80 rounded-2xl border border-white/10 hover:border-[#C49A6C]/50 overflow-hidden flex flex-col transition-all shadow-lg">
                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                          {isVid ? (
                            <video src={getMediaSrc(item.imageData)} className="w-full h-full object-contain" controls muted />
                          ) : (
                            <img src={getMediaSrc(item.imageData)} alt={`Poster ${index + 1}`} className="w-full h-full object-contain" />
                          )}
                          <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded-md text-xs font-bold text-[#D2B48C]">
                            #{index + 1}
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-950 flex items-center justify-between border-t border-white/5">
                          <span className="text-xs text-gray-400 font-semibold">
                            {isVid ? (isAr ? 'مقطع فيديو' : 'Video') : (isAr ? 'صورة بوستر' : 'Bild')}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title={isAr ? 'حذف من الشاشة' : 'Löschen'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Logo & Favicon */}
              <div className="bg-black/60 p-6 rounded-3xl border border-[#C49A6C]/20 space-y-5 backdrop-blur-md">
                <h3 className="text-lg font-black text-[#D2B48C] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>{isAr ? 'شعار الصالون والأيقونة' : 'Logo & Favicon'}</span>
                </h3>

                {/* Logo */}
                <div>
                  <label className="text-sm text-gray-300 font-semibold block mb-2">
                    {isAr ? 'شعار الصالون المعروض على الشاشة:' : 'Aktuelles Geschäftslogo:'}
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={logoPreview || customLogo || HSP_DEFAULT_LOGO}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-full bg-[#C49A6C] border border-[#C49A6C]/50 p-1 shadow-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_LOGO; }}
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C49A6C]/20 file:text-[#D2B48C] hover:file:bg-[#C49A6C]/30 cursor-pointer"
                      />
                      <div className="flex gap-2">
                        {logoFile && (
                          <button
                            onClick={handleSaveLogo}
                            className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {isAr ? 'حفظ الشعار الجديد' : 'Neues Logo speichern'}
                          </button>
                        )}
                        <button
                          onClick={handleResetLogo}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {isAr ? 'استعادة الشعار الافتراضي' : 'Standard wiederherstellen'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favicon */}
                <div className="pt-3 border-t border-white/10">
                  <label className="text-sm text-gray-300 font-semibold block mb-2">
                    {isAr ? 'أيقونة المتصفح (Favicon):' : 'Browser-Symbol (Favicon):'}
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={faviconPreview || customFavicon || '/favicon.svg'}
                      alt="Favicon"
                      className="h-10 w-10 object-contain rounded-xl bg-black border border-[#C49A6C]/30 p-1"
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconSelect}
                        className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C49A6C]/20 file:text-[#D2B48C] hover:file:bg-[#C49A6C]/30 cursor-pointer"
                      />
                      {faviconFile && (
                        <button
                          onClick={handleSaveFavicon}
                          className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start"
                        >
                          {isAr ? 'حفظ الأيقونة' : 'Favicon speichern'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Screen Title & Slide Timer */}
              <div className="bg-black/60 p-6 rounded-3xl border border-[#C49A6C]/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-[#D2B48C] flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  <span>{isAr ? 'عنوان الشاشة ومؤقت العرض' : 'Titel & Anzeigedauer'}</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'عنوان الشاشة الظاهر في الأعلى:' : 'Titel von Bildschirm 1:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editableTitle1}
                        onChange={(e) => setEditableTitle1(e.target.value)}
                        placeholder="HSP Hair & Beauty"
                        className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none"
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isAr ? 'حفظ' : 'Speichern'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'مدة عرض كل بوستر (بالثواني):' : 'Anzeigedauer pro Plakat (in Sekunden):'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={3}
                        max={120}
                        value={editableTimer1}
                        onChange={(e) => setEditableTimer1(e.target.value)}
                        className="w-32 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none"
                      />
                      <button
                        onClick={handleSaveTimer}
                        className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isAr ? 'حفظ المؤقت' : 'Speichern'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'النص الفرعي للهيدر العلوي:' : 'Kopfzeilen-Untertitel:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editableSubtitle}
                        onChange={(e) => setEditableSubtitle(e.target.value)}
                        className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none"
                      />
                      <button
                        onClick={handleSaveSubtitle}
                        className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isAr ? 'حفظ' : 'Speichern'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Ticker Text & Speed */}
              <div className="bg-black/60 p-6 rounded-3xl border border-[#C49A6C]/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-[#D2B48C] flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>{isAr ? 'شريط الأخبار التفاعلي (News Ticker)' : 'Lauftext-Steuerung'}</span>
                </h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'نص شريط الأخبار المتحرك (يتحرك باستمرار أسفل الشاشة):' : 'Lauftext auf dem Bildschirm:'}
                  </label>
                  <textarea
                    rows={3}
                    value={editableTicker}
                    onChange={(e) => setEditableTicker(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D2B48C] outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveTicker}
                      className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ نص الشريط' : 'Lauftext speichern'}
                    </button>
                    <button
                      onClick={handleResetTicker}
                      className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? 'استعادة النص الافتراضي' : 'Standard'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'سرعة دورة الشريط (بالثواني، مثلاً 25 ثانية):' : 'Geschwindigkeit (in Sekunden):'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={10}
                      max={90}
                      value={editableTickerSpeed}
                      onChange={(e) => setEditableTickerSpeed(e.target.value)}
                      className="w-32 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none"
                    />
                    <button
                      onClick={handleSaveTickerSpeed}
                      className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ السرعة' : 'Speichern'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. PIN & Weather City */}
              <div className="bg-black/60 p-6 rounded-3xl border border-[#C49A6C]/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-[#D2B48C] flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  <span>{isAr ? 'الرمز السري والطقس وحالة المحل' : 'PIN, Wetter & System'}</span>
                </h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'الرمز السري لدخول لوحة HSP (PIN):' : 'PIN-Code für HSP:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={8}
                      value={editablePin}
                      onChange={(e) => setEditablePin(e.target.value)}
                      className="w-36 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none tracking-widest text-center"
                    />
                    <button
                      onClick={handleSavePin}
                      className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ الرمز' : 'PIN speichern'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'مدينة الطقس المباشر في الهيدر العلوي:' : 'Stadt für Live-Wetter:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editableCity}
                      onChange={(e) => setEditableCity(e.target.value)}
                      className="w-48 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none"
                    />
                    <button
                      onClick={handleSaveCity}
                      className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ المدينة' : 'Stadt speichern'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {t.topBarControlTitle || (isAr ? 'الشريط العلوي (الساعة والطقس):' : 'Oberste Leiste (Uhr & Wetter):')}
                  </label>
                  <p className="text-gray-400 text-xs mb-2">
                    {t.topBarControlDesc || (isAr ? 'التحكم في إظهار أو إخفاء الشريط العلوي بالكامل على شاشة الصالون.' : 'Steuert die Anzeige der gesamten oberen Kopfzeile.')}
                  </p>
                  <div className="flex items-center justify-between bg-neutral-900/90 border border-white/10 p-3 rounded-xl">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${editableShowClock ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                      {editableShowClock ? (t.topBarVisible || (isAr ? 'الشريط ظاهر (مفعّل)' : 'Sichtbar')) : (t.topBarHidden || (isAr ? 'الشريط مخفي (ملء الشاشة)' : 'Ausgeblendet'))}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleShowClock}
                      disabled={loading}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        editableShowClock
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40'
                          : 'bg-[#C49A6C]/20 text-[#D2B48C] hover:bg-[#C49A6C]/30 border border-[#C49A6C]/40'
                      }`}
                    >
                      {editableShowClock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {editableShowClock ? (isAr ? 'إخفاء الشريط' : 'Ausblenden') : (isAr ? 'إظهار الشريط' : 'Einblenden')}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'حالة الصالون على الشاشة:' : 'Status:'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={editableStoreStatusMode}
                      onChange={(e) => setEditableStoreStatusMode(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#D2B48C] outline-none cursor-pointer"
                    >
                      <option value="active">{isAr ? '🟢 نشط ويعرض البوسترات' : '🟢 Aktiv (Normaler Betrieb)'}</option>
                      <option value="closed">{isAr ? '🔴 مغلق حالياً' : '🔴 Geschlossen'}</option>
                      <option value="maintenance">{isAr ? '⚠️ وضع الصيانة' : '⚠️ Wartungsmodus'}</option>
                    </select>
                    <button
                      onClick={handleSaveStoreStatus}
                      className="bg-[#C49A6C] hover:bg-[#D2B48C] text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ الحالة' : 'Speichern'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleForceReload}
                    className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isAr ? 'إجبار شاشة HSP على التحديث الفوري (Force Reload)' : 'HSP-Bildschirm sofort neu laden'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};
