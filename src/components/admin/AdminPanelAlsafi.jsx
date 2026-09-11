import React, { useState, useEffect } from 'react';
import {
  Settings, Smartphone, Wrench, Tag, Plus, Trash2,
  ArrowRight, ArrowLeft, Image as ImageIcon, Video, Save, Globe,
  Layout, Type, Timer, Key, CloudSun, Gauge, Type as TypeIcon, LogOut,
  Utensils, Coffee, Percent, Activity, Bot, Maximize, RefreshCw,
  Clock, Eye, EyeOff
} from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';
import { supabase } from '../../services/supabase';
import { convertToBase64, isVideoMedia, getMediaSrc, compressImage } from '../../utils/mediaHelpers';
import {
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN,
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  ALSAFI_DEFAULT_TICKER, ALSAFI_DEFAULT_SUBTITLE
} from '../../constants/defaults';

const DEFAULT_ALSAFI_PHRASES_AR = [
  "أهلاً بكم في مطعم الصافي! 🍔🍟",
  "نقدم لكم أشهى الوجبات والمشروبات الطازجة 🥤✨",
  "نتمنى لكم وجبة شهية وتجربة ممتازة 😋🌟",
  "أحدث العروض والخصومات بانتظاركم دائماً 🚀",
];

const DEFAULT_ALSAFI_PHRASES_DE = [
  "Herzlich Willkommen bei Alsafi! 🍔🍟",
  "Leckere Menüs & frische Getränke! 🥤✨",
  "Guten Appetit und einen schönen Aufenthalt! 😋🌟",
  "Top-Angebote & Rabatte für Sie! 🚀",
];

export const AdminPanelAlsafi = ({
  devices, repairs, offers, customLogo, customFavicon, tickerText, tickerSpeed = DEFAULT_TICKER_SPEED,
  fontSize = DEFAULT_FONT_SIZE, headerSubtitle, intervalScreen1, intervalScreen2, intervalScreen3, adminPin, cityName,
  titleScreen1 = '', titleScreen2 = '', titleScreen3 = '',
  showClock = true,
  maintenanceMessage = '', storeStatusMode = 'active', statusTimerTarget = '', onBack, onRefresh, lang, setLang, t,
  showMascotRobot = true, setShowMascotRobot, customMascotGreeting = '', setCustomMascotGreeting,
  customMascotFace = '', setCustomMascotFace, customMascotPhrases = [], setCustomMascotPhrases
}) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const [editableTicker, setEditableTicker] = useState(tickerText || ALSAFI_DEFAULT_TICKER);
  const [editableTickerSpeed, setEditableTickerSpeed] = useState(tickerSpeed || DEFAULT_TICKER_SPEED);
  const [editableFontSize, setEditableFontSize] = useState(fontSize || DEFAULT_FONT_SIZE);
  const [editableSubtitle, setEditableSubtitle] = useState(headerSubtitle || ALSAFI_DEFAULT_SUBTITLE);
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
  const [timerDuration, setTimerDuration] = useState('none');
  const [editableShowMascot, setEditableShowMascot] = useState(showMascotRobot !== false);
  const [editableMascotGreeting, setEditableMascotGreeting] = useState(customMascotGreeting || '');
  const [editableMascotFace, setEditableMascotFace] = useState(customMascotFace || '');
  
  const defaultMascotList = lang === 'ar' ? DEFAULT_ALSAFI_PHRASES_AR : DEFAULT_ALSAFI_PHRASES_DE;

  const [editableMascotPhrases, setEditableMascotPhrases] = useState(() => {
    if (customMascotPhrases && Array.isArray(customMascotPhrases) && customMascotPhrases.length > 0) {
      return customMascotPhrases;
    }
    return defaultMascotList;
  });
  const [editingPhraseIndex, setEditingPhraseIndex] = useState(null);
  const [editingPhraseText, setEditingPhraseText] = useState('');
  const [newMascotPhrase, setNewMascotPhrase] = useState('');
  const [editableMaintenanceMsg, setEditableMaintenanceMsg] = useState(maintenanceMessage || '');

  useEffect(() => { setEditableTicker(tickerText || ALSAFI_DEFAULT_TICKER); }, [tickerText]);
  useEffect(() => { setEditableTickerSpeed(tickerSpeed || DEFAULT_TICKER_SPEED); }, [tickerSpeed]);
  useEffect(() => { setEditableFontSize(fontSize || DEFAULT_FONT_SIZE); }, [fontSize]);
  useEffect(() => { setEditableSubtitle(headerSubtitle || ALSAFI_DEFAULT_SUBTITLE); }, [headerSubtitle]);
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
  useEffect(() => {
    if (customMascotPhrases && Array.isArray(customMascotPhrases) && customMascotPhrases.length > 0) {
      setEditableMascotPhrases(customMascotPhrases);
    } else {
      const savedLocal = localStorage.getItem('handyland_mascot_phrases');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEditableMascotPhrases(parsed);
            return;
          }
        } catch (e) {}
      }
      setEditableMascotPhrases(defaultMascotList);
    }
  }, [customMascotPhrases, lang]);

  const handleSaveMascotSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (setShowMascotRobot) setShowMascotRobot(editableShowMascot);
      if (setCustomMascotGreeting) setCustomMascotGreeting(editableMascotGreeting);
      if (setCustomMascotFace) setCustomMascotFace(editableMascotFace);
      if (setCustomMascotPhrases) setCustomMascotPhrases(editableMascotPhrases);

      localStorage.setItem('handyland_mascot_visible', editableShowMascot);
      localStorage.setItem('handyland_mascot_greeting', editableMascotGreeting);
      localStorage.setItem('handyland_mascot_face', editableMascotFace || '');
      localStorage.setItem('handyland_mascot_phrases', JSON.stringify(editableMascotPhrases || []));

      try {
        const channel = supabase.channel('public:handyland_tv_signage_v6');
        await channel.send({
          type: 'broadcast',
          event: 'MASCOT_UPDATED',
          payload: {
            showMascotRobot: editableShowMascot,
            customMascotGreeting: editableMascotGreeting,
            customMascotFace: editableMascotFace,
            customMascotPhrases: editableMascotPhrases
          }
        });
      } catch (e) {}

      try {
        await supabase.from('alsafi_settings').upsert({
          id: 'config',
          forceReload: now,
          showMascotRobot: editableShowMascot,
          customMascotGreeting: editableMascotGreeting
        });
      } catch (dbErr) {}

      alert(t.saveSuccess);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Save mascot notice:", err);
      alert(t.saveSuccess);
    }
    setLoading(false);
  };

  const handleFaviconSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) { // 2MB limit for favicon
        alert(lang === 'ar' ? 'حجم أيقونة الموقع كبير جداً. الحد الأقصى 2MB' : 'Favicon ist zu groß. Max 2MB.');
        return;
      }
      setFaviconFile(file);
    }
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
      const fileInput = document.getElementById('posterUpload');
      if (fileInput) fileInput.value = '';
    } else {
      const hasVideo = newFiles.some(f => f.type.startsWith('video/'));
      setIsPreviewVideo(hasVideo);
    }
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

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

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) { // 2MB
        alert(t.logoTooLarge);
        return;
      }
      setLogoFile(file);
    }
  };

  const handleUploadImage = async (e, tableName) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert(t.selectImageFirst);
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
      const fileInput = document.getElementById('posterUpload');
      if (fileInput) fileInput.value = '';
      onRefresh();
      alert(t.uploadSuccess);
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    try {
      const compressedLogo = await compressImage(logoFile, 500, 500, 0.85);
      const base64Logo = await convertToBase64(compressedLogo);
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', logoData: base64Logo });
      if (error) throw error;
      setLogoFile(null);
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetToDefaultLogo = async () => {
    if (!window.confirm(t.confirmResetLogo)) return;
    setLoading(true);
    try {
      await supabase.from('alsafi_settings').update({ logoData: null }).eq('id', 'config');
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  const handleSaveFavicon = async (e) => {
    e.preventDefault();
    if (!faviconFile) return;
    setLoading(true);
    try {
      const compressedFavicon = await compressImage(faviconFile, 200, 200, 0.9);
      const base64Favicon = await convertToBase64(compressedFavicon);
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', faviconData: base64Favicon });
      if (error) throw error;
      setFaviconFile(null);
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetFavicon = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من استعادة الأيقونة الافتراضية؟' : 'Standardsymbol wiederherstellen?')) return;
    setLoading(true);
    try {
      await supabase.from('alsafi_settings').update({ faviconData: null }).eq('id', 'config');
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  const handleSaveTicker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', tickerText: editableTicker });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetTicker = async () => {
    if (!window.confirm(t.confirmResetTicker)) return;
    setLoading(true);
    try {
      await supabase.from('alsafi_settings').upsert({ id: 'config', tickerText: ALSAFI_DEFAULT_TICKER });
      setEditableTicker(ALSAFI_DEFAULT_TICKER);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTickerSpeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({
        id: 'config',
        tickerSpeed: parseInt(editableTickerSpeed) || DEFAULT_TICKER_SPEED
      });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleSaveFontSize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', fontSize: editableFontSize });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleSaveSubtitle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', headerSubtitle: editableSubtitle });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetSubtitle = async () => {
    if (!window.confirm(t.confirmResetSubtitle)) return;
    setLoading(true);
    try {
      await supabase.from('alsafi_settings').upsert({ id: 'config', headerSubtitle: ALSAFI_DEFAULT_SUBTITLE });
      setEditableSubtitle(ALSAFI_DEFAULT_SUBTITLE);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTimers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({
        id: 'config',
        intervalScreen1: parseInt(editableTimer1) || 6,
        intervalScreen2: parseInt(editableTimer2) || 6,
        intervalScreen3: parseInt(editableTimer3) || 6
      });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleSaveScreenTitles = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({
        id: 'config',
        titleScreen1: editableTitle1,
        titleScreen2: editableTitle2,
        titleScreen3: editableTitle3
      });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetScreenTitles = async () => {
    if (!window.confirm(t.confirmResetScreenTitles)) return;
    setLoading(true);
    try {
      await supabase.from('alsafi_settings').upsert({
        id: 'config',
        titleScreen1: '',
        titleScreen2: '',
        titleScreen3: ''
      });
      setEditableTitle1('');
      setEditableTitle2('');
      setEditableTitle3('');
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!editablePin || editablePin.length < 4) {
      alert("PIN required (4+ digits)");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', adminPin: editablePin });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', cityName: editableCity });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleToggleShowClock = async () => {
    const nextVal = !editableShowClock;
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', showClock: nextVal });
      if (error) throw error;
      setEditableShowClock(nextVal);
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleDelete = async (tableName, id) => {
    const confirmMsg = lang === 'ar' ? 'هل أنت متأكد من حذف هذا البوستر؟' : 'Möchten Sie dieses Medium wirklich löschen?';
    if (!window.confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        console.error("Delete error:", error);
        alert(lang === 'ar' ? 'فشل الحذف من السيرفر. تحقق من الاتصال.' : 'Fehler beim Löschen vom Server.');
      } else {
        alert(t.resetSuccess);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleDeleteAll = async (tableName) => {
    const confirmMsg = lang === 'ar' ? 'هل أنت متأكد من حذف جميع البوسترات المعروضة في هذه الشاشة؟' : 'Möchten Sie wirklich ALLE Medien auf diesem Bildschirm löschen?';
    if (!window.confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.error("Delete all error:", error);
        alert(lang === 'ar' ? 'حدث خطأ أثناء الحذف.' : 'Fehler beim Löschen.');
      } else {
        alert(lang === 'ar' ? 'تم حذف جميع البوسترات بنجاح!' : 'Alle Medien erfolgreich gelöscht!');
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveStoreStatus = async () => {
    setLoading(true);
    try {
      let finalTarget = statusTimerTarget;
      if (timerDuration === 'clear') {
        finalTarget = '';
      } else if (timerDuration === 'until20') {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
        if (target.getTime() < now.getTime()) {
          target.setDate(target.getDate() + 1);
        }
        finalTarget = target.toISOString();
      } else if (timerDuration !== 'none') {
        finalTarget = new Date(Date.now() + parseInt(timerDuration) * 60000).toISOString();
      }

      const { error } = await supabase.from('alsafi_settings').upsert({
        id: 'config',
        storeStatusMode: editableStoreStatusMode,
        statusTimerTarget: finalTarget,
        maintenanceMessage: editableMaintenanceMsg
      });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };



  const handleRemoteFullscreen = async () => {
    setLoading(true);
    try {
      const channel = supabase.channel('public:handyland_tv_signage_v6');
      await channel.send({
        type: 'broadcast',
        event: 'REMOTE_TRIGGER_FULLSCREEN',
        payload: { timestamp: Date.now() }
      });
      alert(lang === 'ar' ? 'تم إرسال أمر تكبير جميع شاشات التلفزيون عن بُعد بنجاح!' : 'Vollbild-Signal an alle TV-Geräte gesendet!');
    } catch (e) {
      console.error(e);
      alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'Fehler beim Senden.');
    }
    setLoading(false);
  };

  const handleForceReload = async () => {
    const confirmMessage = lang === 'ar' ? 'هل أنت متأكد من إعادة تحميل جميع الشاشات؟' : 'Möchten Sie wirklich alle Bildschirme aktualisieren?';
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('alsafi_settings').upsert({ id: 'config', forceReload: Date.now() });
      if (error) throw error;
      alert(t.saveSuccess);
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const tabs = [
    { id: 'menu', name: editableTitle1 || titleScreen1 || (lang === 'ar' ? 'المنيو الرئيسي' : 'Hauptmenü'), icon: Utensils, table: 'alsafi_menu', items: devices || [] },
    { id: 'drinks', name: editableTitle2 || titleScreen2 || (lang === 'ar' ? 'المشروبات' : 'Getränke'), icon: Coffee, table: 'alsafi_drinks', items: repairs || [] },
    { id: 'offers', name: editableTitle3 || titleScreen3 || (lang === 'ar' ? 'العروض' : 'Sonderangebote'), icon: Percent, table: 'alsafi_offers', items: offers || [] },
    { id: 'settings', name: t.settingsTab, icon: Settings, table: null, items: [] }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans" dir={dir}>
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-black text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <Utensils className="w-10 h-10 text-orange-500" />
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wider">{lang === 'ar' ? 'إدارة مطعم الصافي' : 'Alsafi Verwaltung'}</h2>
              <p className="text-orange-400 font-bold">{lang === 'ar' ? 'تحكم في شاشات المطعم بسهولة' : 'Restaurant-Bildschirme steuern'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRemoteFullscreen}
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-extrabold px-4 py-3 rounded-2xl transition shadow-lg cursor-pointer border border-yellow-300"
              title={lang === 'ar' ? 'إرسال أمر تكبير لجميع شاشات التلفزيون عن بُعد' : 'Alle TV-Bildschirme aus der Ferne auf Vollbild schalten'}
            >
              <Maximize className="w-5 h-5 animate-pulse" />
              <span>{lang === 'ar' ? 'تكبير التلفاز عن بُعد' : 'TVs auf Vollbild'}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                window.location.hash = '#admin-analytics';
                window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'admin-analytics' } }));
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 rounded-2xl transition text-base font-bold text-white shadow-lg cursor-pointer border border-emerald-400/40"
              title={lang === 'ar' ? 'استعراض لوحة التحليلات والباندويث' : 'Datenfluss & Telemetrie'}
            >
              <Activity className="w-5 h-5 animate-pulse" />
              <span>{lang === 'ar' ? 'لوحة التحليلات' : 'Analytics'}</span>
            </button>
            <LanguageToggle lang={lang} setLang={setLang} />
            <button onClick={onBack} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3.5 rounded-2xl transition text-lg font-bold text-white shadow-lg cursor-pointer">
              <LogOut className="w-5 h-5" />
              {t.logoutBtn}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-b border-gray-200">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                if (tab.id !== 'settings') {
                  setImageFiles([]); 
                  setImagePreviews([]); 
                  setIsPreviewVideo(false); 
                }
              }} 
              className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition cursor-pointer ${activeTab === tab.id ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <tab.icon className="w-6 h-6" /> {tab.name}
            </button>
          ))}
        </div>

        <div className="p-8 md:p-10">
          {activeTab !== 'settings' ? (
            <div className="space-y-12">
              <div className="grid lg:grid-cols-5 gap-12">

                <div className="lg:col-span-2 bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{t.uploadTitle} {currentTab.name}</h3>
                  <form onSubmit={(e) => handleUploadImage(e, currentTab.table)} className="space-y-6">
                    <div className="border-3 border-dashed border-yellow-500 bg-yellow-50/50 p-8 rounded-3xl text-center relative hover:bg-yellow-50 transition cursor-pointer">
                      <input
                        type="file"
                        id="posterUpload"
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleMediaSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                        multiple
                      />
                      {imagePreviews.length === 0 ? (
                        <div className="flex flex-col items-center pointer-events-none">
                          <div className="flex gap-2 mb-4 text-yellow-600">
                            <ImageIcon className="w-12 h-12" />
                            <Video className="w-12 h-12" />
                          </div>
                          <p className="font-extrabold text-xl text-gray-800">{t.selectImagePrompt}</p>
                          <p className="text-sm text-gray-500 mt-2">{t.noCropNote}</p>
                        </div>
                      ) : (
                        <div className="relative z-10 pointer-events-none max-h-80 overflow-y-auto">
                          <div className="grid gap-3 justify-center p-2" style={{ gridTemplateColumns: `repeat(${Math.min(imagePreviews.length, 3)}, minmax(0, 1fr))` }}>
                            {imagePreviews.map((preview, i) => (
                              <div key={i} className="relative group pointer-events-auto">
                                {imageFiles[i]?.type.startsWith('video/') ? (
                                  <video src={preview} autoPlay loop muted className="h-40 mx-auto rounded-xl shadow-md object-cover w-full border-2 border-transparent group-hover:border-red-500 transition-colors" />
                                ) : (
                                  <img src={preview} alt="Preview" className="h-40 mx-auto rounded-xl shadow-md object-cover w-full border-2 border-transparent group-hover:border-red-500 transition-colors" />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleRemovePreview(i, e)}
                                  className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-[0_0_15px_rgba(220,38,38,0.5)] cursor-pointer z-50"
                                  title={lang === 'ar' ? 'حذف هذا الاختيار' : 'Auswahl löschen'}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pointer-events-none text-gray-500 text-sm font-bold bg-white/80 inline-block px-4 py-2 rounded-full">
                            {lang === 'ar' ? 'اضغط على أي مساحة فارغة لاختيار صور أخرى' : 'Klicken Sie in den leeren Bereich, um andere Bilder auszuwählen'}
                          </div>
                        </div>
                      )}
                    </div>

                    {imageDimensions && (
                      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2.5 text-left" dir={dir}>
                        <div className="flex justify-between items-center text-xs font-black text-gray-800">
                          <span>{t.mediaDimensionsLabel} <span className="font-mono text-yellow-600">{imageDimensions.width} × {imageDimensions.height} px</span></span>
                          {imageDimensions.is169 ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                              ✅ {t.perfect169Badge}
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                              ℹ️ {t.ambientBlurBadge}
                            </span>
                          )}
                        </div>

                        {!imageDimensions.is169 && (
                          <label className="flex items-center gap-3 bg-yellow-50 hover:bg-yellow-100/80 p-3 rounded-xl border border-yellow-400/60 cursor-pointer transition">
                            <input
                              type="checkbox"
                              checked={autoCrop169}
                              onChange={(e) => setAutoCrop169(e.target.checked)}
                              className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400 cursor-pointer"
                            />
                            <span className="text-xs font-black text-gray-900 leading-tight">{t.crop169OptionLabel}</span>
                          </label>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || imageFiles.length === 0}
                      className={`w-full py-5 rounded-2xl text-2xl font-black flex justify-center items-center gap-3 shadow-xl transition-transform active:scale-95 border border-yellow-500/50 cursor-pointer ${loading || imageFiles.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}
                    >
                      {loading ? t.uploading : <><Plus className="w-7 h-7" /> {t.uploadBtn} {imageFiles.length > 1 ? `(${imageFiles.length})` : ''}</>}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{t.displayedPosters} {currentTab.name} ({currentTab.items.length})</h3>
                    {currentTab.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAll(currentTab.table)}
                        className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow flex items-center gap-2 cursor-pointer border border-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        {lang === 'ar' ? 'حذف جميع البوسترات' : 'Alle Medien löschen'}
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
                    {currentTab.items.length === 0 && <p className="text-gray-500 text-xl col-span-3 text-center py-16 bg-gray-50 rounded-2xl border">{t.noPosters}</p>}

                    {currentTab.items.map((item, index) => {
                      const isVideo = isVideoMedia(item.imageData);
                      const mediaSrc = getMediaSrc(item.imageData);

                      return (
                        <div key={item.id} className="bg-white border-2 border-gray-200 p-3 rounded-2xl flex flex-col justify-between shadow-sm hover:border-yellow-400 transition relative group h-56">
                          <div className="absolute top-3 right-3 bg-black/80 text-yellow-400 px-3 py-1 rounded-lg text-sm font-bold z-10 flex items-center gap-1">
                            {isVideo ? <Video className="w-4 h-4 text-cyan-400" /> : <ImageIcon className="w-4 h-4" />}
                            {t.posterLabel} {index + 1}
                          </div>
                          <button
                            onClick={() => handleDelete(currentTab.table, item.id)}
                            className="absolute top-3 left-3 text-white bg-red-600 hover:bg-red-700 active:bg-red-800 p-3 rounded-xl transition z-10 shadow-md cursor-pointer"
                            title={t.deletePosterTooltip}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                            {item.imageData ? (
                              isVideo ? (
                                <video src={mediaSrc} autoPlay loop muted className="w-full h-full object-contain" />
                              ) : (
                                <img src={mediaSrc} alt={`Slide ${index}`} className="w-full h-full object-contain" />
                              )
                            ) : (
                              <span className="text-gray-400">Medienfehler</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* تبويب الإعدادات المتقدمة */
            <div className="space-y-10">

              {/* قسم التحكم بالروبوت التفاعلي ومحرك منع انطفاء الشاشة */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-950 p-8 rounded-3xl border-2 border-yellow-400 shadow-xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-400">
                      <Bot className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-yellow-400">
                        {lang === 'ar' ? 'الروبوت التفاعلي ومنع انطفاء الشاشة 🤖' : 'Interaktiver Roboter & Bildschirm-Keep-Alive 🤖'}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {lang === 'ar' ? 'تفعيل الروبوت العائم وحماية حيوية الشاشة 100% من وضع السكون' : 'Mascot-Robot anzeigen und Display-Timeout dauerhaft verhindern'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-400 px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    {lang === 'ar' ? 'حماية الشاشة مفعّلة' : 'Wake Lock Aktiv'}
                  </span>
                </div>

                <form onSubmit={handleSaveMascotSettings} className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-800/80 p-5 rounded-2xl border border-gray-700">
                    <div>
                      <span className="text-lg font-bold text-white block">
                        {lang === 'ar' ? 'إظهار الروبوت المتحرك والتلويح للجمهور' : 'Roboter-Mascot auf allen Bildschirmen anzeigen'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {lang === 'ar' ? 'يتجول عبر الشاشات الثلاث ويلوح للعملاء مع عبارات ترحيبية' : 'Winkt Kunden zu und wechselt automatisch die Position'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editableShowMascot}
                        onChange={(e) => setEditableShowMascot(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      {lang === 'ar' ? 'نص الترحيب المخصص للروبوت (اختياري)' : 'Benutzerdefinierter Roboter-Begrüßungstext (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={editableMascotGreeting}
                      onChange={(e) => setEditableMascotGreeting(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: أهلاً بكم في عروض الصافي المميزة! 🚀' : 'Z.B.: Herzlich Willkommen bei Alsafi-Angebote! 🚀'}
                      className="w-full p-4 border-2 border-yellow-500/50 rounded-2xl text-base font-bold text-white bg-gray-950 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  {/* تخصيص صورة وجه الروبوت ورسالة العودة للأصلي */}
                  <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-base font-bold text-white block">
                          {lang === 'ar' ? 'تخصيص صورة وجه الروبوت 🖼️' : 'Roboter-Gesicht anpassen 🖼️'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {lang === 'ar' ? 'رفع صورة/شعار مخصص لوجه الروبوت أو العودة للوجه السايبر الأصلي' : 'Laden Sie ein eigenes Gesichtsbild hoch oder stellen Sie das Original wieder her'}
                        </span>
                      </div>

                      {editableMascotFace && (
                        <button
                          type="button"
                          onClick={() => setEditableMascotFace('')}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-red-500 shadow"
                          title={lang === 'ar' ? 'استعادة وجه الروبوت الأصلي المتحرك' : 'Original-Robotergesicht wiederherstellen'}
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>{lang === 'ar' ? 'استعادة الوجه الأصلي' : 'Original-Gesicht wiederherstellen'}</span>
                        </button>
                      )}
                    </div>

                    {/* شارة دليل الأبعاد الموصى بها */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-yellow-300 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-500 text-black px-2 py-0.5 rounded font-mono text-[11px]">400 × 240 px</span>
                        <span>{lang === 'ar' ? 'المقاس الموصى به (نسبة 16:9)' : 'Empfohlene Größe (16:9 Format)'}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-normal">
                        {lang === 'ar' ? 'يتم القص والتوسيط التلقائي 100%' : 'Automatische 16:9 Zentrierung'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-2xl bg-black border-2 border-yellow-400 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                        {editableMascotFace ? (
                          <img src={editableMascotFace} alt="Robot Face" className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="w-8 h-8 text-yellow-400 animate-pulse" />
                        )}
                      </div>

                      <label className="flex-1 bg-gray-950 hover:bg-black border-2 border-dashed border-yellow-500/60 hover:border-yellow-400 p-3.5 rounded-2xl text-center cursor-pointer transition">
                        <span className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {lang === 'ar' ? 'رفع صورة جديدة لوجه الروبوت' : 'Neues Bild für Roboter-Gesicht wählen'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              try {
                                // قص وتوسيط تلقائي 16:9 بمقاس 400x240 تناسب وجه الروبوت بالكامل
                                const compressed = await compressImage(file, 400, 240, 0.85, true);
                                const base64 = await convertToBase64(compressed);
                                setEditableMascotFace(base64);
                              } catch (err) {
                                const base64 = await convertToBase64(file);
                                setEditableMascotFace(base64);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* إدارة عبارات وجمل الروبوت التفاعلية */}
                  <div className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-base font-bold text-white block">
                          {lang === 'ar' ? 'إدارة جمل وعبارات الروبوت التفاعلية 💬' : 'Roboter-Sprachblasen verwalten 💬'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {lang === 'ar' ? 'يمكنك رؤية وتعديل وحذف الجمل الترحيبية أو إضافة عباراتك الخاصة' : 'Sie können Begrüßungssätze bearbeiten, löschen oder neue hinzufügen'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditableMascotPhrases(defaultMascotList)}
                        className="text-xs bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إعادة الجمل الافتراضية' : 'Standard-Sätze wiederherstellen'}</span>
                      </button>
                    </div>

                    {/* قائمة الجمل الحالية مع إكانية التعديل والحذف المباشر */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {editableMascotPhrases.map((phrase, pIdx) => {
                        const isEditing = editingPhraseIndex === pIdx;

                        return (
                          <div key={pIdx} className="flex items-center justify-between gap-2 bg-gray-950 p-2.5 rounded-xl border border-gray-700 text-xs text-white">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingPhraseText}
                                onChange={(e) => setEditingPhraseText(e.target.value)}
                                className="flex-1 p-2 bg-black border border-yellow-400 rounded-lg text-white font-bold text-xs focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const updated = [...editableMascotPhrases];
                                    updated[pIdx] = editingPhraseText.trim();
                                    setEditableMascotPhrases(updated);
                                    setEditingPhraseIndex(null);
                                  }
                                }}
                              />
                            ) : (
                              <span className="font-bold flex-1 text-gray-200">{phrase}</span>
                            )}

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editableMascotPhrases];
                                    updated[pIdx] = editingPhraseText.trim();
                                    setEditableMascotPhrases(updated);
                                    setEditingPhraseIndex(null);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-xs cursor-pointer"
                                >
                                  {lang === 'ar' ? 'حفظ' : 'Speichern'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPhraseIndex(pIdx);
                                    setEditingPhraseText(phrase);
                                  }}
                                  className="p-1.5 bg-gray-800 hover:bg-yellow-500 text-gray-300 hover:text-black rounded-lg transition border border-gray-700 cursor-pointer"
                                  title={lang === 'ar' ? 'تعديل الجملة' : 'Phrase bearbeiten'}
                                >
                                  <Type className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editableMascotPhrases.filter((_, idx) => idx !== pIdx);
                                  setEditableMascotPhrases(updated);
                                }}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition border border-red-500/30 cursor-pointer"
                                title={lang === 'ar' ? 'حذف الجملة' : 'Phrase löschen'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* إدخال جملة جديدة */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMascotPhrase}
                        onChange={(e) => setNewMascotPhrase(e.target.value)}
                        placeholder={lang === 'ar' ? 'اكتب جملة جديدة هنا (مثال: أهلاً بكم في عروضنا المميزة! 🚀)' : 'Neue Phrase eingeben (z.B. Willkommen zu unseren Angeboten! 🚀)'}
                        className="flex-1 p-3 border border-yellow-500/40 rounded-xl text-xs font-bold text-white bg-gray-950 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newMascotPhrase.trim()) {
                              setEditableMascotPhrases([...editableMascotPhrases, newMascotPhrase.trim()]);
                              setNewMascotPhrase('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newMascotPhrase.trim()) {
                            setEditableMascotPhrases([...editableMascotPhrases, newMascotPhrase.trim()]);
                            setNewMascotPhrase('');
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-4 py-3 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'إضافة' : 'Hinzufügen'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg rounded-2xl transition shadow-[0_0_20px_rgba(234,179,8,0.4)] flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-6 h-6" /> {lang === 'ar' ? 'حفظ إعدادات الروبوت والشاشة' : 'Roboter-Einstellungen speichern'}
                  </button>
                </form>
              </div>

              {/* قسم مؤقتات الشاشات المنفصلة */}
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-yellow-500/40 shadow-sm">
                <h3 className="text-2xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-3">
                  <Timer className="w-8 h-8 text-yellow-600" />
                  {t.screenTimersTitle}
                </h3>
                <p className="text-gray-600 text-sm mb-6 font-semibold">{t.screenTimersInstruction}</p>

                <form onSubmit={handleSaveTimers} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-yellow-600" /> {lang === 'ar' ? 'شاشة 1 (المنيو الرئيسي):' : 'Bildschirm 1 (Hauptmenü):'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer1}
                          onChange={(e) => setEditableTimer1(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-yellow-600" /> {lang === 'ar' ? 'شاشة 2 (المشروبات):' : 'Bildschirm 2 (Getränke):'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer2}
                          onChange={(e) => setEditableTimer2(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-yellow-600" /> {lang === 'ar' ? 'شاشة 3 (العروض):' : 'Bildschirm 3 (Angebote):'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer3}
                          onChange={(e) => setEditableTimer3(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                  </div>

                  <button type="submit" className="w-full py-4 bg-black text-yellow-400 font-black text-xl rounded-2xl hover:bg-gray-900 shadow-lg flex justify-center items-center gap-2 cursor-pointer">
                    <Save className="w-6 h-6" /> {t.saveTimersBtn}
                  </button>
                </form>
              </div>

              {/* قسم التحكم بأسماء الشاشات المنفصلة */}
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-yellow-500/40 shadow-sm">
                <h3 className="text-2xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-3">
                  <TypeIcon className="w-8 h-8 text-yellow-600" />
                  {t.screenTitlesTitle}
                </h3>
                <p className="text-gray-600 text-sm mb-6 font-semibold">{t.screenTitlesInstruction}</p>

                <form onSubmit={handleSaveScreenTitles} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-yellow-600" /> {t.titleScreen1Label}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'المنيو الرئيسي (افتراضي)' : 'Hauptmenü (Standard)'}
                        value={editableTitle1}
                        onChange={(e) => setEditableTitle1(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-bold text-gray-900 bg-white"
                      />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-yellow-600" /> {t.titleScreen2Label}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'المشروبات (افتراضي)' : 'Getränke (Standard)'}
                        value={editableTitle2}
                        onChange={(e) => setEditableTitle2(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-bold text-gray-900 bg-white"
                      />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-yellow-600" /> {t.titleScreen3Label}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'Sonderangebote (افتراضي)' : 'Sonderangebote (Standard)'}
                        value={editableTitle3}
                        onChange={(e) => setEditableTitle3(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-bold text-gray-900 bg-white"
                      />
                    </div>

                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-black text-yellow-400 font-black text-xl rounded-2xl hover:bg-gray-900 shadow-lg flex justify-center items-center gap-2 cursor-pointer">
                      <Save className="w-6 h-6" /> {t.saveScreenTitlesBtn}
                    </button>
                    {(editableTitle1 || editableTitle2 || editableTitle3) && (
                      <button type="button" onClick={handleResetScreenTitles} className="px-6 py-4 bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-300 transition cursor-pointer">
                        {t.resetScreenTitlesBtn}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* قسم التحكم بحجم الخط وسرعة الشريط الإخباري وحماية PIN والطقس والشريط العلوي */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* 1. حجم الخط */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <TypeIcon className="w-5 h-5 text-yellow-600" />
                      {t.fontSizeTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.fontSizeLabel}</p>
                    <form onSubmit={handleSaveFontSize} className="space-y-3">
                      <select
                        value={editableFontSize}
                        onChange={(e) => setEditableFontSize(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                      >
                        <option value="100%">{t.fontNormal}</option>
                        <option value="120%">{t.fontLarge}</option>
                        <option value="140%">{t.fontXLarge}</option>
                      </select>
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 cursor-pointer text-sm">
                        {t.saveFontSizeBtn}
                      </button>
                    </form>
                  </div>
                </div>

                {/* 2. سرعة الشريط الإخباري */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-yellow-600" />
                      {t.tickerSpeedTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.tickerSpeedLabel}</p>
                    <form onSubmit={handleSaveTickerSpeed} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={editableTickerSpeed}
                          onChange={(e) => setEditableTickerSpeed(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-bold text-center text-gray-900 bg-white"
                        />
                        <span className="font-bold text-gray-500 text-xs">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 cursor-pointer text-sm">
                        {t.saveTickerSpeedBtn}
                      </button>
                    </form>
                  </div>
                </div>

                {/* 3. حماية PIN */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Key className="w-5 h-5 text-yellow-600" />
                      {t.pinProtectionTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.pinInputLabel}</p>
                    <form onSubmit={handleSavePin} className="space-y-3">
                      <input
                        type="text"
                        maxLength={6}
                        value={editablePin}
                        onChange={(e) => setEditablePin(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-mono font-bold text-center text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 cursor-pointer text-sm">
                        {t.savePinBtn}
                      </button>
                    </form>
                  </div>
                </div>

                {/* 4. ودجت مدينة الطقس المباشر */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <CloudSun className="w-5 h-5 text-yellow-600" />
                      {t.weatherCityTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.weatherCityLabel}</p>
                    <form onSubmit={handleSaveCity} className="space-y-3">
                      <input
                        type="text"
                        value={editableCity}
                        onChange={(e) => setEditableCity(e.target.value)}
                        placeholder="Heidelberg, Frankfurt..."
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 cursor-pointer text-sm">
                        {t.saveCityBtn}
                      </button>
                    </form>
                  </div>
                </div>

                {/* 5. التحكم بالشريط العلوي (الساعة والطقس) */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      {t.topBarControlTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.topBarControlDesc}</p>
                    
                    <div className={`p-3 rounded-xl border flex items-center justify-between mb-3 ${
                      editableShowClock 
                        ? 'bg-green-50 border-green-300 text-green-800' 
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${editableShowClock ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
                        {editableShowClock ? t.topBarVisible : t.topBarHidden}
                      </span>
                      {editableShowClock ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleToggleShowClock}
                    disabled={loading}
                    className={`w-full py-3 font-bold rounded-xl cursor-pointer text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      editableShowClock 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    }`}
                  >
                    {editableShowClock ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        {lang === 'ar' ? 'إخفاء الشريط العلوي' : 'Leiste ausblenden'}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        {lang === 'ar' ? 'إظهار الشريط العلوي' : 'Leiste anzeigen'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* التحكم بنص الهيدر الفرعي */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Layout className="w-6 h-6 text-yellow-600" />
                      {t.headerSubtitleTitle}
                    </h3>

                    <div className="bg-black text-yellow-400 p-3 rounded-xl mb-4 font-bold text-center border border-yellow-500/40 text-sm">
                      <span>{editableSubtitle}</span>
                    </div>

                    <form onSubmit={handleSaveSubtitle} className="space-y-3">
                      <input
                        type="text"
                        value={editableSubtitle}
                        onChange={(e) => setEditableSubtitle(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 flex justify-center items-center gap-2 cursor-pointer">
                        <Save className="w-5 h-5" /> {t.saveSubtitleBtn}
                      </button>
                    </form>
                  </div>

                  <button onClick={handleResetSubtitle} className="mt-4 text-xs font-bold text-gray-500 hover:text-gray-800 underline text-center cursor-pointer">
                    {t.resetSubtitleBtn}
                  </button>
                </div>

                {/* التحكم بالشريط الإخباري المتحرك */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Type className="w-6 h-6 text-yellow-600" />
                      {lang === 'ar' ? 'التحكم بالشريط الإخباري (أخبار المطعم)' : 'Lauftext-Steuerung (ALSAFI News)'}
                    </h3>

                    <div className="bg-yellow-400 text-black py-2 px-3 rounded-xl mb-4 font-black text-xs overflow-hidden border border-yellow-500 flex items-center gap-2">
                      <div className="overflow-hidden whitespace-nowrap flex-1">
                        <span className="inline-block animate-marquee">{editableTicker}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveTicker} className="space-y-3">
                      <textarea
                        rows={3}
                        value={editableTicker}
                        onChange={(e) => setEditableTicker(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 flex justify-center items-center gap-2 cursor-pointer">
                        <Save className="w-5 h-5" /> {t.saveTickerBtn}
                      </button>
                    </form>
                  </div>

                  <button onClick={handleResetTicker} className="mt-4 text-xs font-bold text-gray-500 hover:text-gray-800 underline text-center cursor-pointer">
                    {t.resetTickerBtn}
                  </button>
                </div>

                {/* التحكم بشعار المحل وأيقونة الموقع */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Utensils className="w-6 h-6 text-yellow-600" />
                      {lang === 'ar' ? 'تغيير شعار المطعم (ALSAFI Logo)' : 'Geschäftslogo ändern (ALSAFI Logo)'}
                    </h3>

                    <div className="mb-4 text-center">
                      <div className="bg-white p-1 rounded-full inline-flex items-center justify-center border-2 border-yellow-400 shadow-md w-24 h-24 overflow-hidden">
                        {customLogo ? (
                          <img src={customLogo} alt="Current Logo" className="w-full h-full object-contain rounded-full p-1" />
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full">
                            <Utensils className="w-10 h-10 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSaveLogo} className="space-y-3">
                      <div className="border-2 border-dashed border-yellow-500 bg-yellow-50/50 p-3 rounded-xl text-center relative hover:bg-yellow-50 transition cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleLogoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <p className="font-bold text-xs text-gray-800">{t.selectLogoPrompt}</p>
                      </div>
                      <button type="submit" disabled={loading || !logoFile} className={`w-full py-3 rounded-xl text-base font-bold border cursor-pointer ${loading || !logoFile ? 'bg-gray-300 text-gray-500' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}>
                        {t.saveLogoBtn}
                      </button>
                    </form>
                    {customLogo && (
                      <button onClick={handleResetToDefaultLogo} className="mt-4 w-full text-xs font-bold text-red-600 hover:text-red-800 underline text-center cursor-pointer">
                        {t.resetLogoBtn}
                      </button>
                    )}
                  </div>

                  <div className="border-t pt-6 mt-2">
                    <h3 className="text-lg font-black mb-3 text-gray-800 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      {lang === 'ar' ? 'أيقونة المتصفح (Favicon)' : 'Browser-Symbol (Favicon)'}
                    </h3>

                    <div className="mb-4 text-center">
                      <div className="bg-white p-1 rounded-lg inline-flex items-center justify-center border border-gray-300 shadow-sm w-12 h-12 overflow-hidden">
                        {customFavicon ? (
                          <img src={customFavicon} alt="Favicon" className="w-full h-full object-contain" />
                        ) : (
                          <Globe className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSaveFavicon} className="space-y-3">
                      <div className="border-2 border-dashed border-blue-500 bg-blue-50/50 p-2 rounded-xl text-center relative hover:bg-blue-50 transition cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleFaviconSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <p className="font-bold text-xs text-gray-800">{lang === 'ar' ? 'اختر أيقونة' : 'Symbol auswählen'}</p>
                      </div>
                      <button type="submit" disabled={loading || !faviconFile} className={`w-full py-2 rounded-xl text-sm font-bold border cursor-pointer ${loading || !faviconFile ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        {lang === 'ar' ? 'حفظ الأيقونة' : 'Symbol speichern'}
                      </button>
                    </form>
                    {customFavicon && (
                      <button onClick={handleResetFavicon} className="mt-3 w-full text-xs font-bold text-red-600 hover:text-red-800 underline text-center cursor-pointer">
                        {lang === 'ar' ? 'استعادة الأيقونة الافتراضية' : 'Standard wiederherstellen'}
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* قسم التحكم بالنظام والصيانة */}
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-red-500/40 shadow-sm mt-8">
                <h3 className="text-2xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-red-600" />
                  {t.systemControlTitle || 'Systemsteuerung (Wartung & Reload)'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">{lang === 'ar' ? 'وضع الشاشات (Store Status)' : 'Bildschirmstatus (Store Status)'}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveStoreStatus(); }} className="space-y-4">
                      <select
                        value={editableStoreStatusMode}
                        onChange={(e) => setEditableStoreStatusMode(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl font-bold text-gray-800 focus:border-yellow-500 outline-none"
                      >
                        <option value="active">{lang === 'ar' ? 'فعال (الوضع الطبيعي)' : 'Aktiv (Normalmodus)'}</option>
                        <option value="closed">{lang === 'ar' ? 'مغلق (Closed)' : 'Geschlossen (Closed)'}</option>
                        <option value="lunch">{lang === 'ar' ? 'استراحة غداء (Lunch Break)' : 'Mittagspause (Lunch Break)'}</option>
                        <option value="inventory">{lang === 'ar' ? 'جرد المستودع (Inventory)' : 'Inventur (Inventory)'}</option>
                        <option value="maintenance">{lang === 'ar' ? 'صيانة (Maintenance)' : 'Wartung (Maintenance)'}</option>
                      </select>

                      {editableStoreStatusMode !== 'active' && (
                        <div className="space-y-4 animate-fade-in">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              {lang === 'ar' ? 'رسالة العرض المخصصة:' : 'Benutzerdefinierte Nachricht:'}
                            </label>
                            <input
                              type="text"
                              value={editableMaintenanceMsg}
                              onChange={(e) => setEditableMaintenanceMsg(e.target.value)}
                              placeholder="Wir sind bald wieder für Sie da..."
                              className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:border-yellow-500"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              {lang === 'ar' ? 'وقت العودة (العداد التنازلي):' : 'Rückkehrzeit (Countdown):'}
                            </label>
                            <select
                              value={timerDuration}
                              onChange={(e) => setTimerDuration(e.target.value)}
                              className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:border-yellow-500"
                            >
                              <option value="none">{lang === 'ar' ? 'بدون مؤقت' : 'Kein Timer'}</option>
                              <option value="15">{lang === 'ar' ? 'بعد 15 دقيقة' : 'In 15 Minuten'}</option>
                              <option value="30">{lang === 'ar' ? 'بعد 30 دقيقة' : 'In 30 Minuten'}</option>
                              <option value="60">{lang === 'ar' ? 'بعد ساعة' : 'In 1 Stunde'}</option>
                              <option value="120">{lang === 'ar' ? 'بعد ساعتين' : 'In 2 Stunden'}</option>
                              <option value="until20">{lang === 'ar' ? 'إلى الساعة 20:00 مساءً' : 'Bis 20:00 Uhr'}</option>
                              <option value="clear">{lang === 'ar' ? 'إلغاء المؤقت الحالي' : 'Aktuellen Timer löschen'}</option>
                            </select>
                            {statusTimerTarget && timerDuration === 'none' && (
                              <p className="text-xs text-yellow-600 mt-1">{lang === 'ar' ? 'هناك مؤقت يعمل حالياً.' : 'Es läuft bereits ein Timer.'}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-lg font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 ${editableStoreStatusMode !== 'active' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-800 text-yellow-400 hover:bg-black'
                          }`}
                      >
                        <Save className="w-5 h-5" />
                        {lang === 'ar' ? 'حفظ الوضع' : 'Status Speichern'}
                      </button>
                    </form>

                    {storeStatusMode !== 'active' && (
                      <p className="text-xs text-red-500 mt-3 font-bold text-center">
                        {lang === 'ar' ? 'تحذير: الشاشات معطلة حالياً وتعرض شاشة التوقف.' : 'Achtung: Die Bildschirme zeigen derzeit den Wartungsmodus an.'}
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <button
                      onClick={handleForceReload}
                      disabled={loading}
                      className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 cursor-pointer transition flex justify-center items-center gap-2"
                    >
                      {t.forceReloadBtn || 'Alle Bildschirme aktualisieren (Force Reload)'}
                    </button>
                    <p className="text-xs text-gray-500 mt-3 font-semibold">
                      {lang === 'ar' ? 'يجبر جميع الشاشات على تحديث الصفحة وجلب التعديلات فوراً.' : 'Zwingt alle Bildschirme, die Seite zu aktualisieren und Änderungen sofort zu übernehmen.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
