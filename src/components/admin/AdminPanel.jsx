import React, { useState, useEffect } from 'react';
import { 
  Settings, Smartphone, Wrench, Tag, Plus, Trash2, 
  ArrowRight, ArrowLeft, Image as ImageIcon, Video, Save, Globe, 
  Layout, Type, Timer, Key, CloudSun, Gauge, DollarSign, Type as TypeIcon
} from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';
import { supabase } from '../../services/supabase';
import { convertToBase64, isVideoMedia, getMediaSrc } from '../../utils/mediaHelpers';
import { 
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN, 
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE 
} from '../../constants/defaults';

export const AdminPanel = ({ 
  devices, repairs, offers, repairPrices = [], customLogo, tickerText, tickerSpeed = DEFAULT_TICKER_SPEED,
  fontSize = DEFAULT_FONT_SIZE, headerSubtitle, intervalScreen1, intervalScreen2, intervalScreen3, adminPin, cityName,
  onBack, onRefresh, lang, setLang, t 
}) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);

  const [logoFile, setLogoFile] = useState(null);

  // حالة نموذج أسعار الصيانة
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const [editableTicker, setEditableTicker] = useState(tickerText || DEFAULT_TICKER);
  const [editableTickerSpeed, setEditableTickerSpeed] = useState(tickerSpeed || DEFAULT_TICKER_SPEED);
  const [editableFontSize, setEditableFontSize] = useState(fontSize || DEFAULT_FONT_SIZE);
  const [editableSubtitle, setEditableSubtitle] = useState(headerSubtitle || DEFAULT_SUBTITLE);
  const [editableTimer1, setEditableTimer1] = useState(intervalScreen1 || 6);
  const [editableTimer2, setEditableTimer2] = useState(intervalScreen2 || 6);
  const [editableTimer3, setEditableTimer3] = useState(intervalScreen3 || 6);
  const [editablePin, setEditablePin] = useState(adminPin || DEFAULT_PIN);
  const [editableCity, setEditableCity] = useState(cityName || DEFAULT_CITY);

  useEffect(() => { setEditableTicker(tickerText || DEFAULT_TICKER); }, [tickerText]);
  useEffect(() => { setEditableTickerSpeed(tickerSpeed || DEFAULT_TICKER_SPEED); }, [tickerSpeed]);
  useEffect(() => { setEditableFontSize(fontSize || DEFAULT_FONT_SIZE); }, [fontSize]);
  useEffect(() => { setEditableSubtitle(headerSubtitle || DEFAULT_SUBTITLE); }, [headerSubtitle]);
  useEffect(() => { setEditableTimer1(intervalScreen1 || 6); }, [intervalScreen1]);
  useEffect(() => { setEditableTimer2(intervalScreen2 || 6); }, [intervalScreen2]);
  useEffect(() => { setEditableTimer3(intervalScreen3 || 6); }, [intervalScreen3]);
  useEffect(() => { setEditablePin(adminPin || DEFAULT_PIN); }, [adminPin]);
  useEffect(() => { setEditableCity(cityName || DEFAULT_CITY); }, [cityName]);

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10485760) { // 10MB
        alert(t.imageTooLarge);
        return;
      }
      setImageFile(file);
      setIsPreviewVideo(file.type.startsWith('video/'));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
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
    if (!imageFile) {
      alert(t.selectImageFirst);
      return;
    }
    setLoading(true);
    try {
      const base64Image = await convertToBase64(imageFile);
      const { error } = await supabase.from(tableName).insert([{ imageData: base64Image }]);
      if (error) throw error;
      
      setImageFile(null);
      setImagePreview(null);
      setIsPreviewVideo(false);
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

  const handleAddRepairPrice = async (e) => {
    e.preventDefault();
    if (!newDeviceModel || !newServiceName || !newPrice) {
      alert("Bitte alle Felder ausfüllen / يرجى ملء كافة الحقول");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_repair_prices').insert([{
        device_model: newDeviceModel,
        service_name: newServiceName,
        price: newPrice
      }]);
      if (error) throw error;

      setNewDeviceModel('');
      setNewServiceName('');
      setNewPrice('');
      onRefresh();
      alert(t.saveSuccess);
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleDeleteRepairPrice = async (id) => {
    try {
      const { error } = await supabase.from('shop_repair_prices').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    try {
      const base64Logo = await convertToBase64(logoFile);
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', logoData: base64Logo });
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
      await supabase.from('shop_settings').update({ logoData: null }).eq('id', 'config');
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTicker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', tickerText: editableTicker });
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
      await supabase.from('shop_settings').upsert({ id: 'config', tickerText: DEFAULT_TICKER });
      setEditableTicker(DEFAULT_TICKER);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTickerSpeed = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ 
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
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', fontSize: editableFontSize });
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
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', headerSubtitle: editableSubtitle });
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
      await supabase.from('shop_settings').upsert({ id: 'config', headerSubtitle: DEFAULT_SUBTITLE });
      setEditableSubtitle(DEFAULT_SUBTITLE);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTimers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ 
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

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!editablePin || editablePin.length < 4) {
      alert("PIN required (4+ digits)");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', adminPin: editablePin });
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
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', cityName: editableCity });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleDelete = async (tableName, id) => {
    try { 
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const getTabInfo = () => {
    if (activeTab === 'devices') return { name: t.tabDevices, table: 'shop_devices', items: devices };
    if (activeTab === 'repairs') return { name: t.tabRepairs, table: 'shop_repairs', items: repairs };
    if (activeTab === 'offers') return { name: t.tabOffers, table: 'shop_offers', items: offers };
    return { name: t.tabSettings, table: 'shop_settings', items: [] };
  };

  const currentTab = getTabInfo();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans" dir={dir}>
      <TVScreenControls />
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="bg-black text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <Settings className="w-10 h-10 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-black text-yellow-500">
              {t.adminTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle lang={lang} setLang={setLang} />
            <button onClick={onBack} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3.5 rounded-2xl transition text-lg font-bold text-yellow-400 border border-gray-700 cursor-pointer">
              {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {t.returnToMenuBtn}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-b border-gray-200">
          <button onClick={() => { setActiveTab('devices'); setImageFile(null); setImagePreview(null); setIsPreviewVideo(false); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition cursor-pointer ${activeTab === 'devices' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Smartphone className="w-6 h-6" /> {t.tabDevices}
          </button>
          <button onClick={() => { setActiveTab('repairs'); setImageFile(null); setImagePreview(null); setIsPreviewVideo(false); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition cursor-pointer ${activeTab === 'repairs' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Wrench className="w-6 h-6" /> {t.tabRepairs}
          </button>
          <button onClick={() => { setActiveTab('offers'); setImageFile(null); setImagePreview(null); setIsPreviewVideo(false); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition cursor-pointer ${activeTab === 'offers' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Tag className="w-6 h-6" /> {t.tabOffers}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition cursor-pointer ${activeTab === 'settings' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Globe className="w-6 h-6" /> {t.tabSettings}
          </button>
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      {!imagePreview ? (
                        <div className="flex flex-col items-center pointer-events-none">
                          <div className="flex gap-2 mb-4 text-yellow-600">
                            <ImageIcon className="w-12 h-12" />
                            <Video className="w-12 h-12" />
                          </div>
                          <p className="font-extrabold text-xl text-gray-800">{t.selectImagePrompt}</p>
                          <p className="text-sm text-gray-500 mt-2">{t.noCropNote}</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {isPreviewVideo ? (
                            <video src={imagePreview} autoPlay loop muted className="max-h-56 mx-auto rounded-xl shadow-md object-contain" />
                          ) : (
                            <img src={imagePreview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-md object-contain" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition rounded-xl pointer-events-none">
                            <p className="text-white font-bold text-lg">{t.changeImage}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading || !imageFile} 
                      className={`w-full py-5 rounded-2xl text-2xl font-black flex justify-center items-center gap-3 shadow-xl transition-transform active:scale-95 border border-yellow-500/50 cursor-pointer ${loading || !imageFile ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}
                    >
                      {loading ? t.uploading : <><Plus className="w-7 h-7" /> {t.uploadBtn}</>}
                    </button>
                  </form>
                </div>
                
                <div className="lg:col-span-3">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">{t.displayedPosters} {currentTab.name} ({currentTab.items.length})</h3>
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

              {/* قسم إدارة قائمة أسعار الصيانة الحصرية لشاشة 2 */}
              {activeTab === 'repairs' && (
                <div className="bg-gray-50 p-8 rounded-3xl border-2 border-yellow-500/40 shadow-sm mt-8">
                  <h3 className="text-2xl font-black mb-6 text-gray-800 border-b pb-4 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                    {t.repairPricesTitle}
                  </h3>

                  <div className="grid lg:grid-cols-5 gap-10">
                    <form onSubmit={handleAddRepairPrice} className="lg:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.deviceModelLabel}</label>
                        <input 
                          type="text" 
                          value={newDeviceModel} 
                          onChange={(e) => setNewDeviceModel(e.target.value)}
                          placeholder="iPhone 13, Samsung S22..." 
                          className="w-full p-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-900 bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.serviceNameLabel}</label>
                        <input 
                          type="text" 
                          value={newServiceName} 
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="Display Express, Akku..." 
                          className="w-full p-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-900 bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.priceLabel}</label>
                        <input 
                          type="text" 
                          value={newPrice} 
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="79 €, 49 €..." 
                          className="w-full p-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-900 bg-gray-50 focus:bg-white"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-black text-yellow-400 font-extrabold text-lg rounded-xl hover:bg-gray-900 flex justify-center items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Plus className="w-5 h-5" /> {t.addPriceBtn}
                      </button>
                    </form>

                    <div className="lg:col-span-3">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">{t.displayedPrices} ({repairPrices.length})</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {repairPrices.length === 0 && (
                          <p className="text-gray-500 text-base text-center py-10 bg-white rounded-2xl border">{t.noPrices}</p>
                        )}
                        {repairPrices.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-yellow-400 transition">
                            <div>
                              <span className="font-black text-gray-900 text-base">{item.device_model}</span>
                              <span className="text-gray-500 text-sm mx-2">•</span>
                              <span className="font-semibold text-yellow-700 text-sm">{item.service_name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="bg-black text-yellow-400 font-extrabold px-3 py-1 rounded-xl text-base">{item.price}</span>
                              <button 
                                onClick={() => handleDeleteRepairPrice(item.id)} 
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 cursor-pointer transition"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* تبويب الإعدادات المتقدمة */
            <div className="space-y-10">
              
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
                        <Smartphone className="w-4 h-4 text-yellow-600" /> {t.timerScreen1Label}
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
                        <Wrench className="w-4 h-4 text-yellow-600" /> {t.timerScreen2Label}
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
                        <Tag className="w-4 h-4 text-yellow-600" /> {t.timerScreen3Label}
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

              {/* قسم التحكم بحجم الخط وسرعة الشريط الإخباري وحماية PIN والطقس */}
              <div className="grid lg:grid-cols-4 gap-6">
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
                      {t.tickerControlTitle}
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

                {/* التحكم بشعار المحل */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Globe className="w-6 h-6 text-yellow-600" />
                      {t.logoControlTitle}
                    </h3>
                    
                    <div className="mb-4 text-center">
                      <div className="bg-white p-1 rounded-full inline-flex items-center justify-center border-2 border-yellow-400 shadow-md w-24 h-24 overflow-hidden">
                        {customLogo ? (
                          <img src={customLogo} alt="Current Logo" className="w-full h-full object-contain rounded-full p-1" />
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full">
                            <Smartphone className="w-10 h-10 text-yellow-400" />
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
                  </div>

                  {customLogo && (
                    <button onClick={handleResetToDefaultLogo} className="mt-4 text-xs font-bold text-red-600 hover:text-red-800 underline text-center cursor-pointer">
                      {t.resetLogoBtn}
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
