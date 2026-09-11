import React, { useState, useEffect } from 'react';
import {
  Settings, Flame, Coffee, Sparkles, Plus, Trash2,
  ArrowRight, ArrowLeft, Image as ImageIcon, Video, Save, Globe,
  Layout, Type, Timer, Key, CloudSun, Gauge, LogOut,
  Activity, Bot, Maximize, RefreshCw, AlertTriangle, CheckCircle2,
  Percent, Tag, Sliders,
  Clock, Eye, EyeOff
} from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';
import { supabase } from '../../services/supabase';
import { convertToBase64, isVideoMedia, getMediaSrc, compressImage } from '../../utils/mediaHelpers';
import {
  DEFAULT_PIN, DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  KANKA_DEFAULT_TICKER, KANKA_DEFAULT_SUBTITLE
} from '../../constants/defaults';

const DEFAULT_KANKA_PHRASES_AR = [
  "أهلاً بكم في كانكا أورينت ديلوكس! 💨✨",
  "استمتعوا بأرقى أجواء الشيشة والمشروبات الفاخرة ☕🍹",
  "نتمنى لكم أوقاتاً ممتعة وسهرات مميزة 🌟",
  "عروض حصرية وفعاليات خاصة بانتظاركم دائماً 💎",
];

const DEFAULT_KANKA_PHRASES_DE = [
  "Herzlich Willkommen bei Kanka Orient Deluxe! 💨✨",
  "Genießen Sie erstklassige Shisha & edle Drinks ☕🍹",
  "Wir wünschen Ihnen einen entspannten Aufenthalt 🌟",
  "Exklusive Specials & Events erwarten Sie 💎",
];

export const AdminPanelKanka = ({
  screen1Items = [], screen2Items = [], screen3Items = [],
  customLogo, customFavicon, tickerText, tickerSpeed = DEFAULT_TICKER_SPEED,
  fontSize = DEFAULT_FONT_SIZE, headerSubtitle,
  intervalScreen1 = 6, intervalScreen2 = 6, intervalScreen3 = 6,
  adminPin, cityName,
  titleScreen1 = '', titleScreen2 = '', titleScreen3 = '',
  showClock = true,
  maintenanceMessage = '', storeStatusMode = 'active', statusTimerTarget = '',
  onBack, onRefresh, lang, setLang, t,
  showMascotRobot = true, setShowMascotRobot, customMascotGreeting = '', setCustomMascotGreeting,
  customMascotFace = '', setCustomMascotFace, customMascotPhrases = [], setCustomMascotPhrases
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

  const [editableTicker, setEditableTicker] = useState(tickerText || KANKA_DEFAULT_TICKER);
  const [editableTickerSpeed, setEditableTickerSpeed] = useState(tickerSpeed || DEFAULT_TICKER_SPEED);
  const [editableFontSize, setEditableFontSize] = useState(fontSize || DEFAULT_FONT_SIZE);
  const [editableSubtitle, setEditableSubtitle] = useState(headerSubtitle || KANKA_DEFAULT_SUBTITLE);
  const [editableTimer1, setEditableTimer1] = useState(intervalScreen1 || 6);
  const [editableTimer2, setEditableTimer2] = useState(intervalScreen2 || 6);
  const [editableTimer3, setEditableTimer3] = useState(intervalScreen3 || 6);
  const [editableTitle1, setEditableTitle1] = useState(titleScreen1 || '');
  const [editableTitle2, setEditableTitle2] = useState(titleScreen2 || '');
  const [editableTitle3, setEditableTitle3] = useState(titleScreen3 || '');
  const [editablePin, setEditablePin] = useState(adminPin || DEFAULT_PIN);
  const [editableCity, setEditableCity] = useState(cityName || DEFAULT_CITY);
  const [editableShowClock, setEditableShowClock] = useState(showClock !== false);
  const [editableStoreStatusMode, setEditableStoreStatusMode] = useState(storeStatusMode || 'active');
  const [editableMaintenanceMsg, setEditableMaintenanceMsg] = useState(maintenanceMessage || '');
  const [timerDuration, setTimerDuration] = useState('none');

  const [editableShowMascot, setEditableShowMascot] = useState(showMascotRobot !== false);
  const [editableMascotGreeting, setEditableMascotGreeting] = useState(customMascotGreeting || '');
  const [editableMascotFace, setEditableMascotFace] = useState(customMascotFace || '');
  
  const defaultMascotList = lang === 'ar' ? DEFAULT_KANKA_PHRASES_AR : DEFAULT_KANKA_PHRASES_DE;
  const [editableMascotPhrases, setEditableMascotPhrases] = useState(() => {
    if (customMascotPhrases && Array.isArray(customMascotPhrases) && customMascotPhrases.length > 0) {
      return customMascotPhrases;
    }
    return defaultMascotList;
  });
  const [editingPhraseIndex, setEditingPhraseIndex] = useState(null);
  const [editingPhraseText, setEditingPhraseText] = useState('');
  const [newMascotPhrase, setNewMascotPhrase] = useState('');

  useEffect(() => { setEditableTicker(tickerText || KANKA_DEFAULT_TICKER); }, [tickerText]);
  useEffect(() => { setEditableTickerSpeed(tickerSpeed || DEFAULT_TICKER_SPEED); }, [tickerSpeed]);
  useEffect(() => { setEditableFontSize(fontSize || DEFAULT_FONT_SIZE); }, [fontSize]);
  useEffect(() => { setEditableSubtitle(headerSubtitle || KANKA_DEFAULT_SUBTITLE); }, [headerSubtitle]);
  useEffect(() => { setEditableTimer1(intervalScreen1 || 6); }, [intervalScreen1]);
  useEffect(() => { setEditableTimer2(intervalScreen2 || 6); }, [intervalScreen2]);
  useEffect(() => { setEditableTimer3(intervalScreen3 || 6); }, [intervalScreen3]);
  useEffect(() => { setEditableTitle1(titleScreen1 || ''); }, [titleScreen1]);
  useEffect(() => { setEditableTitle2(titleScreen2 || ''); }, [titleScreen2]);
  useEffect(() => { setEditableTitle3(titleScreen3 || ''); }, [titleScreen3]);
  useEffect(() => { setEditablePin(adminPin || DEFAULT_PIN); }, [adminPin]);
  useEffect(() => { setEditableCity(cityName || DEFAULT_CITY); }, [cityName]);
  useEffect(() => { setEditableShowClock(showClock !== false); }, [showClock]);
  useEffect(() => { setEditableMaintenanceMsg(maintenanceMessage || ''); }, [maintenanceMessage]);
  useEffect(() => { setEditableStoreStatusMode(storeStatusMode || 'active'); }, [storeStatusMode]);
  useEffect(() => { setEditableShowMascot(showMascotRobot !== false); }, [showMascotRobot]);
  useEffect(() => { setEditableMascotGreeting(customMascotGreeting || ''); }, [customMascotGreeting]);
  useEffect(() => { setEditableMascotFace(customMascotFace || ''); }, [customMascotFace]);

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
      const fileInput = document.getElementById('kankaPosterUpload');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleUploadImage = async (e, tableName) => {
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
      const { error } = await supabase.from(tableName).insert(newRows);

      if (error) throw error;

      setImageFiles([]);
      setImagePreviews([]);
      setIsPreviewVideo(false);
      setImageDimensions(null);
      setAutoCrop169(false);
      const fileInput = document.getElementById('kankaPosterUpload');
      if (fileInput) fileInput.value = '';
      if (onRefresh) onRefresh();
      alert(t.uploadSuccess || 'تم الرفع بنجاح!');
    } catch (err) {
      console.error(err);
      alert(t.uploadError || 'حدث خطأ أثناء الرفع');
    }
    setLoading(false);
  };

  const handleDeleteItem = async (id, tableName) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الملف؟' : 'Möchten Sie dieses Medium wirklich löschen?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', logoData: base64 });
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
    if (!window.confirm(isAr ? 'هل تود استعادة الشعار الافتراضي لـ Kanka؟' : 'Kanka Standard-Logo wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('kanka_settings').update({ logoData: null }).eq('id', 'config');
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', faviconData: base64 });
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', tickerText: editableTicker });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleResetTicker = async () => {
    if (!window.confirm(isAr ? 'هل تريد استعادة النص الافتراضي؟' : 'Standard-Lauftext wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('kanka_settings').upsert({ id: 'config', tickerText: KANKA_DEFAULT_TICKER });
      setEditableTicker(KANKA_DEFAULT_TICKER);
      alert(t.resetSuccess || 'تمت الاستعادة');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTickerSpeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('kanka_settings').upsert({
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', headerSubtitle: editableSubtitle });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTimers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('kanka_settings').upsert({
        id: 'config',
        intervalScreen1: parseInt(editableTimer1) || 6,
        intervalScreen2: parseInt(editableTimer2) || 6,
        intervalScreen3: parseInt(editableTimer3) || 6
      });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTitles = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('kanka_settings').upsert({
        id: 'config',
        titleScreen1: editableTitle1,
        titleScreen2: editableTitle2,
        titleScreen3: editableTitle3
      });
      if (error) throw error;
      alert(t.saveSuccess || 'تم الحفظ');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleResetTitles = async () => {
    if (!window.confirm(isAr ? 'هل تود استعادة العناوين الافتراضية؟' : 'Standard-Titel wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('kanka_settings').upsert({
        id: 'config',
        titleScreen1: '',
        titleScreen2: '',
        titleScreen3: ''
      });
      setEditableTitle1('');
      setEditableTitle2('');
      setEditableTitle3('');
      alert(t.resetSuccess || 'تمت الاستعادة');
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', adminPin: editablePin });
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', cityName: editableCity });
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
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', showClock: nextVal });
      if (error) throw error;
      setEditableShowClock(nextVal);
      alert(t.saveSuccess || (isAr ? 'تم حفظ التغيير بنجاح' : 'Erfolgreich gespeichert!'));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError || 'حدث خطأ');
    }
    setLoading(false);
  };

  const handleSaveFontSize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('kanka_settings').upsert({ id: 'config', fontSize: editableFontSize });
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

      const { error } = await supabase.from('kanka_settings').upsert({
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
    if (!window.confirm(isAr ? 'هل أنت متأكد من إجبار كافة شاشات Kanka على التحديث الفوري الآن؟' : 'Alle Kanka-Bildschirme jetzt sofort neu laden?')) return;
    setLoading(true);
    try {
      const now = Date.now();
      await supabase.from('kanka_settings').upsert({ id: 'config', forceReload: now });

      const channel = supabase.channel('public:handyland_tv_signage_v6');
      await channel.send({
        type: 'broadcast',
        event: 'FORCE_RELOAD_ALL_SCREENS',
        payload: { targetSystem: 'KANKA', timestamp: now }
      });

      alert(isAr ? 'تم إرسال أمر التحديث الفوري لجميع الشاشات!' : 'Aktualisierungsbefehl gesendet!');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTriggerFullscreen = async (targetScreen) => {
    try {
      const channel = supabase.channel('public:handyland_tv_signage_v6');
      await channel.send({
        type: 'broadcast',
        event: 'REMOTE_TRIGGER_FULLSCREEN',
        payload: { targetView: targetScreen, system: 'KANKA' }
      });
      alert(isAr ? `تم إرسال أمر ملء الشاشة لـ (${targetScreen})!` : `Vollbild-Signal an (${targetScreen}) gesendet!`);
    } catch (e) {
      console.error(e);
    }
  };

  const currentScreenTitle1 = editableTitle1 || (isAr ? 'شاشة 1: الشيشة والمعسل' : 'Bildschirm 1: Shisha & Tabak');
  const currentScreenTitle2 = editableTitle2 || (isAr ? 'شاشة 2: المشروبات والكوكتيلات' : 'Bildschirm 2: Getränke & Cocktails');
  const currentScreenTitle3 = editableTitle3 || (isAr ? 'شاشة 3: العروض والفعاليات' : 'Bildschirm 3: Angebote & Events');

  const getActiveTabProps = () => {
    switch (activeTab) {
      case 'screen1':
        return {
          title: currentScreenTitle1,
          icon: Flame,
          items: screen1Items,
          tableName: 'kanka_screen1',
          screenKey: 'kanka-screen1'
        };
      case 'screen2':
        return {
          title: currentScreenTitle2,
          icon: Coffee,
          items: screen2Items,
          tableName: 'kanka_screen2',
          screenKey: 'kanka-screen2'
        };
      case 'screen3':
        return {
          title: currentScreenTitle3,
          icon: Sparkles,
          items: screen3Items,
          tableName: 'kanka_screen3',
          screenKey: 'kanka-screen3'
        };
      default:
        return null;
    }
  };

  const activeProps = getActiveTabProps();

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col font-sans relative overflow-x-hidden" dir={dir}>
      <TVScreenControls />

      {/* Luxury Golden Glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-amber-500/20 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black px-4 py-2 rounded-full border border-amber-500/30 transition-all cursor-pointer font-bold"
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            <span>{isAr ? 'العودة للبوابة' : 'Zurück zum Portal'}</span>
          </button>

          <div className="flex items-center gap-3">
            <img 
              src={customLogo || '/kanka-logo.jpg'} 
              alt="Kanka Logo" 
              className="h-10 w-10 object-contain rounded-full border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-black"
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-600">
                KANKA ORIENT DELUXE
              </h1>
              <p className="text-xs text-amber-500/80 font-semibold tracking-wide">
                {isAr ? 'لوحة تحكم كافتيريا وشيشة لاونج هايدلبرغ' : 'Verwaltungskonsole Shisha Lounge & Café Heidelberg'}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/60 p-2 rounded-2xl border border-amber-500/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('screen1')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'screen1'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="truncate">{currentScreenTitle1}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
              {screen1Items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('screen2')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'screen2'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span className="truncate">{currentScreenTitle2}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
              {screen2Items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('screen3')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'screen3'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="truncate">{currentScreenTitle3}</span>
            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
              {screen3Items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isAr ? 'الإعدادات العامة' : 'Einstellungen'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1">
        {activeTab !== 'settings' && activeProps && (
          <div className="space-y-8">
            {/* Screen Action Bar */}
            <div className="bg-gradient-to-r from-black/80 via-neutral-950 to-black/80 p-6 rounded-3xl border border-amber-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
                  <activeProps.icon className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{activeProps.title}</h2>
                  <p className="text-gray-400 text-sm">
                    {isAr 
                      ? `إدارة البوسترات ومقاطع الفيديو المعروضة على الشاشة (${activeProps.screenKey})`
                      : `Medienverwaltung für Bildschirm (${activeProps.screenKey})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTriggerFullscreen(activeProps.screenKey)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition-all cursor-pointer"
                  title={isAr ? 'إرسال أمر ملء الشاشة للتلفزيون' : 'Vollbild-Befehl an TV senden'}
                >
                  <Maximize className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'ملء الشاشة للتلفاز' : 'TV Vollbild'}</span>
                </button>
                <a
                  href={`#${activeProps.screenKey}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <span>{isAr ? 'معاينة الشاشة مباشرة' : 'Bildschirm öffnen'}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-black/60 border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-3xl p-8 transition-colors text-center relative backdrop-blur-md">
              <input
                type="file"
                id="kankaPosterUpload"
                multiple
                accept="image/*,video/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-amber-500/10 p-5 rounded-full mb-4 border border-amber-500/20">
                  <ImageIcon className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  {isAr ? 'اضغط هنا لرفع صور أو مقاطع فيديو' : 'Klicken Sie hier zum Hochladen von Bildern oder Videos'}
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  {isAr 
                    ? 'يدعم صيغ JPG, PNG, WebP ومقاطع الفيديو MP4 حتى 20MB بجودة كاملة 16:9'
                    : 'Unterstützt JPG, PNG, WebP und MP4 bis 20MB in 16:9 Vollbild'}
                </p>
              </div>
            </div>

            {/* Previews before upload */}
            {imagePreviews.length > 0 && (
              <div className="bg-neutral-950/80 p-6 rounded-3xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span>{isAr ? `الملفات المحددة للرفع (${imagePreviews.length})` : `Ausgewählte Medien (${imagePreviews.length})`}</span>
                  </h4>

                  <label className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border border-white/10 hover:border-amber-400/50">
                    <input
                      type="checkbox"
                      checked={autoCrop169}
                      onChange={(e) => setAutoCrop169(e.target.checked)}
                      className="accent-amber-500 cursor-pointer"
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
                        title={isAr ? 'إلغاء' : 'Entfernen'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={(e) => handleUploadImage(e, activeProps.tableName)}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black px-8 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? (isAr ? 'جاري الرفع...' : 'Wird hochgeladen...') : (isAr ? 'بدء الرفع الآن' : 'Jetzt hochladen')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Current Media List */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>
                  {isAr 
                    ? `البوسترات والفيديوهات المعروضة حالياً (${activeProps.items.length})` 
                    : `Aktuell angezeigte Medien (${activeProps.items.length})`}
                </span>
              </h3>

              {activeProps.items.length === 0 ? (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center text-gray-500 font-medium">
                  {isAr ? 'لا توجد بوسترات أو مقاطع فيديو معروضة على هذه الشاشة حالياً.' : 'Derzeit sind keine Medien für diesen Bildschirm vorhanden.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeProps.items.map((item, index) => {
                    const isVid = isVideoMedia(item.imageData);
                    return (
                      <div key={item.id || index} className="group bg-black/80 rounded-2xl border border-white/10 hover:border-amber-500/50 overflow-hidden flex flex-col transition-all shadow-lg">
                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                          {isVid ? (
                            <video src={getMediaSrc(item.imageData)} className="w-full h-full object-contain" controls muted />
                          ) : (
                            <img src={getMediaSrc(item.imageData)} alt={`Poster ${index + 1}`} className="w-full h-full object-contain" />
                          )}
                          <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded-md text-xs font-bold text-amber-400">
                            #{index + 1}
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-950 flex items-center justify-between border-t border-white/5">
                          <span className="text-xs text-gray-400 font-semibold">
                            {isVid ? (isAr ? 'مقطع فيديو' : 'Video') : (isAr ? 'صورة بوستر' : 'Bild')}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id, activeProps.tableName)}
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
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-5 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>{isAr ? 'شعار الكافتيريا والأيقونة' : 'Logo & Favicon'}</span>
                </h3>

                {/* Logo */}
                <div>
                  <label className="text-sm text-gray-300 font-semibold block mb-2">
                    {isAr ? 'شعار المحل المعروض على الشاشات:' : 'Aktuelles Geschäftslogo:'}
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={logoPreview || customLogo || '/kanka-logo.jpg'}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-2xl bg-black border border-amber-500/40 p-1"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer"
                      />
                      <div className="flex gap-2">
                        {logoFile && (
                          <button
                            onClick={handleSaveLogo}
                            className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
                      className="h-10 w-10 object-contain rounded-xl bg-black border border-amber-500/30 p-1"
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconSelect}
                        className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer"
                      />
                      {faviconFile && (
                        <button
                          onClick={handleSaveFavicon}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start"
                        >
                          {isAr ? 'حفظ الأيقونة' : 'Favicon speichern'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Screen Titles */}
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  <span>{isAr ? 'عناوين وأسماء الشاشات الثلاث' : 'Titel der 3 Bildschirme'}</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'عنوان الشاشة 1 (الافتراضي: Shisha & Tabak):' : 'Titel von Bildschirm 1:'}
                    </label>
                    <input
                      type="text"
                      value={editableTitle1}
                      onChange={(e) => setEditableTitle1(e.target.value)}
                      placeholder="Shisha & Tabak Menü"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'عنوان الشاشة 2 (الافتراضي: Getränke & Cocktails):' : 'Titel von Bildschirm 2:'}
                    </label>
                    <input
                      type="text"
                      value={editableTitle2}
                      onChange={(e) => setEditableTitle2(e.target.value)}
                      placeholder="Getränke & Cocktails"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'عنوان الشاشة 3 (الافتراضي: Angebote & Events):' : 'Titel von Bildschirm 3:'}
                    </label>
                    <input
                      type="text"
                      value={editableTitle3}
                      onChange={(e) => setEditableTitle3(e.target.value)}
                      placeholder="Sonderangebote & Events"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveTitles}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ العناوين' : 'Titel speichern'}
                    </button>
                    <button
                      onClick={handleResetTitles}
                      className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? 'استعادة الافتراضية' : 'Standard wiederherstellen'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Ticker Text & Speed */}
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>{isAr ? 'الشريط الإخباري المتحرك (Ticker)' : 'Lauftext-Steuerung'}</span>
                </h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'نص الشريط المتحرك (يظهر أسفل الشاشة 3):' : 'Lauftext auf Bildschirm 3:'}
                  </label>
                  <textarea
                    rows={3}
                    value={editableTicker}
                    onChange={(e) => setEditableTicker(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-400 outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveTicker}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                      className="w-32 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                    <button
                      onClick={handleSaveTickerSpeed}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ السرعة' : 'Speichern'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Individual Screen Timers */}
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span>{isAr ? 'مؤقتات عرض البوسترات (بالثواني)' : 'Anzeigedauer pro Bildschirm (Sekunden)'}</span>
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1 truncate">
                      {isAr ? 'شاشة 1:' : 'Bildschirm 1:'}
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={120}
                      value={editableTimer1}
                      onChange={(e) => setEditableTimer1(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1 truncate">
                      {isAr ? 'شاشة 2:' : 'Bildschirm 2:'}
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={120}
                      value={editableTimer2}
                      onChange={(e) => setEditableTimer2(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1 truncate">
                      {isAr ? 'شاشة 3:' : 'Bildschirm 3:'}
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={120}
                      value={editableTimer3}
                      onChange={(e) => setEditableTimer3(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveTimers}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'حفظ مؤقتات الشاشات' : 'Timer speichern'}
                </button>
              </div>

              {/* 5. Subtitle, PIN & City */}
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  <span>{isAr ? 'نص الهيدر والرمز السري والمدينة' : 'Header, PIN & Wetter-Stadt'}</span>
                </h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'النص الفرعي للهيدر العلوي:' : 'Kopfzeilen-Untertitel:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editableSubtitle}
                      onChange={(e) => setEditableSubtitle(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                    <button
                      onClick={handleSaveSubtitle}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ' : 'Speichern'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'الرمز السري لدخول لوحة كانكا (PIN):' : 'PIN-Code für Kanka:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={8}
                      value={editablePin}
                      onChange={(e) => setEditablePin(e.target.value)}
                      className="w-36 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none tracking-widest text-center"
                    />
                    <button
                      onClick={handleSavePin}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'حفظ الرمز' : 'PIN speichern'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'مدينة الطقس المباشر:' : 'Stadt für Live-Wetter:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editableCity}
                      onChange={(e) => setEditableCity(e.target.value)}
                      className="w-48 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                    <button
                      onClick={handleSaveCity}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                    {t.topBarControlDesc || (isAr ? 'التحكم في إظهار أو إخفاء الشريط العلوي بالكامل على شاشات كانكا.' : 'Steuert die Anzeige der gesamten oberen Kopfzeile.')}
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
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                      }`}
                    >
                      {editableShowClock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {editableShowClock ? (isAr ? 'إخفاء الشريط' : 'Ausblenden') : (isAr ? 'إظهار الشريط' : 'Einblenden')}
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. Store Status & Force Reload */}
              <div className="bg-black/60 p-6 rounded-3xl border border-amber-500/20 space-y-4 backdrop-blur-md">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{isAr ? 'حالة المحل والتحديث الإجباري' : 'Status & Systemsteuerung'}</span>
                </h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    {isAr ? 'حالة المحل الحالية على الشاشات:' : 'Aktueller Betriebsmodus:'}
                  </label>
                  <select
                    value={editableStoreStatusMode}
                    onChange={(e) => setEditableStoreStatusMode(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="active">{isAr ? '🟢 نشط ويعرض البوسترات بشكل طبيعي' : '🟢 Aktiv (Normaler Betrieb)'}</option>
                    <option value="prayer">{isAr ? '🟡 استراحة مؤقتة' : '🟡 Pause / Unterbrechung'}</option>
                    <option value="closed">{isAr ? '🔴 المحل مغلق حالياً' : '🔴 Geschlossen'}</option>
                    <option value="maintenance">{isAr ? '⚠️ وضع الصيانة' : '⚠️ Wartungsmodus'}</option>
                  </select>
                </div>

                {editableStoreStatusMode !== 'active' && (
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'مؤقت تنازلي (اختياري بالدقائق):' : 'Timer (Minuten):'}
                    </label>
                    <select
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none cursor-pointer mb-2"
                    >
                      <option value="none">{isAr ? 'بدون مؤقت تنازلي' : 'Kein Timer'}</option>
                      <option value="15">15 {isAr ? 'دقيقة' : 'Minuten'}</option>
                      <option value="30">30 {isAr ? 'دقيقة' : 'Minuten'}</option>
                      <option value="45">45 {isAr ? 'دقيقة' : 'Minuten'}</option>
                      <option value="60">60 {isAr ? 'دقيقة' : 'Minuten'}</option>
                    </select>

                    <label className="text-xs text-gray-400 font-semibold block mb-1">
                      {isAr ? 'رسالة إضافية للشاشات:' : 'Zusätzliche Nachricht:'}
                    </label>
                    <input
                      type="text"
                      value={editableMaintenanceMsg}
                      onChange={(e) => setEditableMaintenanceMsg(e.target.value)}
                      placeholder={isAr ? 'نعتذر عن استقبال الزبائن حالياً...' : 'Wir haben vorübergehend geschlossen...'}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveStoreStatus}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'تطبيق وحفظ حالة المحل' : 'Status speichern'}
                </button>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={handleForceReload}
                    className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isAr ? 'إجبار شاشات كانكا على التحديث الفوري (Force Reload)' : 'Kanka-Bildschirme sofort neu laden'}</span>
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
