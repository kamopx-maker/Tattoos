import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Download, Save, Settings, Maximize2, RotateCcw, Droplets, ArrowLeft, User, UserCheck, Trash2, Layers, Eye, EyeOff, Diamond, Move, Layout, Sliders, Footprints, Ear, Hand, Accessibility, ChevronRight, RefreshCw, Dumbbell } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { refineTattooPrompt, triggerN8NWorkflow } from '../services/ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { TATTOO_STYLES } from '../constants/styles';

const bodyPresets = [
  { id: 'male-arm-1', gender: 'Erkek', part: 'Kol (Ön)', url: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=800' },
  { id: 'male-arm-2', gender: 'Erkek', part: 'Kol (Yan)', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800' },
  { id: 'male-chest', gender: 'Erkek', part: 'Göğüs', url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&q=80&w=800' },
  { id: 'male-back', gender: 'Erkek', part: 'Sırt', url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=800' },
  { id: 'female-arm-1', gender: 'Kadın', part: 'Kol', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
  { id: 'female-back-1', gender: 'Kadın', part: 'Sırt', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800' },
  { id: 'female-leg-1', gender: 'Kadın', part: 'Bacak', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800' },
  { id: 'female-shoulder', gender: 'Kadın', part: 'Omuz', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800' },
];

const DEFAULT_SETTINGS = {
  opacity: 85,
  scale: 100,
  rotation: 0,
  posX: 50,
  posY: 50,
  placement: 'Kol',
  brightness: 100,
  contrast: 100,
  blur: 0
};

interface TattooLayer {
  id: string;
  url: string;
  settings: typeof DEFAULT_SETTINGS;
  visible: boolean;
  name: string;
}

export function ProStudio({ userProfile: initialProfile }: { userProfile?: any }) {
  const [bodyPreview, setBodyPreview] = useState<string | null>(bodyPresets[0].url);
  const [gender, setGender] = useState<'Erkek' | 'Kadın'>('Erkek');
  const [location, setLocation] = useState('Sırt');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  const locations = [
    { id: 'male-arm-1', name: 'Ön Kol', icon: <Dumbbell className="h-4 w-4" />, femaleId: 'female-arm-1' },
    { id: 'female-leg-1', name: 'Bacak', icon: <Footprints className="h-4 w-4" />, maleId: 'female-leg-1' }, // Fallback to female leg if no male leg preset
    { id: 'female-shoulder', name: 'Omuz', icon: <Ear className="h-4 w-4" />, maleId: 'female-shoulder' },
    { id: 'male-chest', name: 'Göğüs', icon: <User className="h-4 w-4" />, femaleId: 'female-arm-1' },
    { id: 'wrist', name: 'Bilek', icon: <Hand className="h-4 w-4" /> },
    { id: 'male-back', name: 'Sırt', icon: <Accessibility className="h-4 w-4" />, femaleId: 'female-back-1' },
  ];
  const [tattooLayers, setTattooLayers] = useState<TattooLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(100);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(initialProfile);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingTattoo, setIsGeneratingTattoo] = useState(false);
  const [activeTab, setActiveTab] = useState<'prep' | 'canvas' | 'edit'>('canvas');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLayerId && (activeTab === 'prep' || activeTab === 'canvas')) {
      setActiveTab('edit');
    }
  }, [selectedLayerId]);

  const selectedLayer = tattooLayers.find(l => l.id === selectedLayerId);

  const addTattooLayer = (url: string, name: string = 'Yeni Dövme') => {
    const newLayer: TattooLayer = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      settings: { ...DEFAULT_SETTINGS },
      visible: true,
      name
    };
    setTattooLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayerSettings = (updates: Partial<typeof DEFAULT_SETTINGS>) => {
    if (!selectedLayerId) return;
    setTattooLayers(prev => prev.map(l => 
      l.id === selectedLayerId ? { ...l, settings: { ...l.settings, ...updates } } : l
    ));
  };

  const toggleLayerVisibility = (id: string) => {
    setTattooLayers(prev => prev.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  };

  const deleteLayer = (id: string) => {
    setTattooLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const getTattooStyle = (layer: TattooLayer) => ({
    opacity: layer.settings.opacity / 100,
    transform: `translate(-50%, -50%) scale(${layer.settings.scale / 100}) rotate(${layer.settings.rotation}deg)`,
    filter: `brightness(${layer.settings.brightness}%) contrast(${layer.settings.contrast}%) blur(${layer.settings.blur}px)`,
    mixBlendMode: 'multiply' as const,
    position: 'absolute' as const,
    top: `${layer.settings.posY}%`,
    left: `${layer.settings.posX}%`,
    width: '200px', // Fixed base size to prevent shrinking
    height: 'auto',
    aspectRatio: '1/1',
    pointerEvents: activeTab === 'edit' ? 'auto' as const : 'none' as const,
    transition: 'opacity 0.2s ease, filter 0.2s ease',
    zIndex: tattooLayers.indexOf(layer) + 10,
    cursor: 'move',
    touchAction: 'none'
  });

  const handleTouchStart = (e: React.TouchEvent, layerId: string) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      pinchStartDistance.current = dist;
      const layer = tattooLayers.find(l => l.id === layerId);
      if (layer) {
        pinchStartScale.current = layer.settings.scale;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent, layerId: string) => {
    if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = dist / pinchStartDistance.current;
      const newScale = Math.max(10, Math.min(400, pinchStartScale.current * ratio));
      
      setTattooLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, settings: { ...l.settings, scale: newScale } } : l
      ));
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
  };

  const handlePan = (event: any, info: any, layerId: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    setTattooLayers(prev => prev.map(l => {
      if (l.id !== layerId) return l;
      
      const deltaX = (info.delta.x / rect.width) * 100;
      const deltaY = (info.delta.y / rect.height) * 100;
      
      return {
        ...l,
        settings: {
          ...l.settings,
          posX: Math.max(0, Math.min(100, l.settings.posX + deltaX)),
          posY: Math.max(0, Math.min(100, l.settings.posY + deltaY))
        }
      };
    }));
  };

  const handleResizePan = (event: any, info: any, layerId: string) => {
    const layer = tattooLayers.find(l => l.id === layerId);
    if (!layer) return;

    // Use a combination of X and Y movement for a more natural feel
    // Dragging away from center (bottom-right) increases scale
    const sensitivity = 0.5;
    const delta = (info.delta.x + info.delta.y) * sensitivity;
    const newScale = Math.max(10, Math.min(400, layer.settings.scale + delta));

    setTattooLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, settings: { ...l.settings, scale: newScale } } : l
    ));
  };

  const handleGenerateTattoo = async () => {
    if (!aiPrompt) {
      toast.error('Lütfen üretmek istediğiniz dövmeyi tarif edin');
      return;
    }
    setIsGeneratingTattoo(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTattoo = `https://picsum.photos/seed/${encodeURIComponent(aiPrompt)}/512/512`;
      addTattooLayer(mockTattoo, aiPrompt.substring(0, 15) + '...');
      toast.success('Yapay zeka dövme tasarımını üretti!');
    } catch (error) {
      toast.error('Dövme üretilirken bir hata oluştu');
    } finally {
      setIsGeneratingTattoo(false);
    }
  };

  const handleDownload = () => {
    if (!result) {
      toast.error('Önce bir görsel oluşturmalısınız');
      return;
    }
    const link = document.createElement('a');
    link.href = result;
    link.download = `pro-tattoo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('HD Görsel indiriliyor...');
  };

  const handleSaveToGallery = async () => {
    if (!result) {
      toast.error('Önce bir görsel oluşturmalısınız');
      return;
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Galeriye kaydediliyor...',
        success: 'Görsel başarıyla galerinize kaydedildi!',
        error: 'Kaydedilirken bir hata oluştu',
      }
    );
  };

  useEffect(() => {
    // Add an initial example layer
    if (tattooLayers.length === 0) {
      addTattooLayer('https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&q=80&w=500', 'Örnek Dövme');
    }

    if (initialProfile) {
      setUserProfile(initialProfile);
    } else {
      const fetchProfile = async () => {
        if (auth.currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
              setUserProfile(userDoc.data());
            }
          } catch (error) {
            console.error(error);
          }
        }
      };
      fetchProfile();
    }
  }, [initialProfile]);

  const handleVisualize = async () => {
    if (!bodyPreview) {
      toast.error('Lütfen vücut fotoğrafınızı veya bir profil seçin');
      return;
    }
    setIsProcessing(true);
    try {
      const refined = await refineTattooPrompt(prompt || "Dövme tasarımı", TATTOO_STYLES[0].name);
      const response = await triggerN8NWorkflow(bodyPreview, refined, TATTOO_STYLES[0].name, tattooLayers[0]?.url || undefined);
      
      if (response.success) {
        toast.success('Pro Görselleştirme Tamamlandı!');
        setResult('https://picsum.photos/seed/pro-tattoo/1200/1200');
        
        await addDoc(collection(db, 'simulations'), {
          uid: auth.currentUser?.uid,
          bodyImage: bodyPreview,
          tattooLayers,
          resultImage: 'https://picsum.photos/seed/pro-tattoo/1200/1200',
          prompt: refined,
          style: TATTOO_STYLES[0].name,
          type: 'pro',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'simulations');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans relative overflow-hidden pb-24">
      <div className="fixed inset-0 atmosphere z-0 pointer-events-none" />
      <div className="absolute inset-0 mesh-grid opacity-10 pointer-events-none" />
      
      {/* Mobile/Tablet Creative Controls - Floating Bar */}
      <motion.div 
        initial={{ y: -100, x: '-50%', opacity: 0 }}
        animate={{ y: 20, x: '-50%', opacity: 1 }}
        className="fixed top-0 left-1/2 z-50 flex items-center gap-2 rounded-full glass-panel p-2 shadow-2xl lg:hidden border border-white/10"
      >
        {[
          { id: 'prep', icon: Layout, label: 'Hazırlık' },
          { id: 'canvas', icon: ImageIcon, label: 'Tuval' },
          { id: 'edit', icon: Sliders, label: 'Düzenle' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
              activeTab === tab.id 
                ? "bg-white text-black" 
                : "text-white/40 hover:bg-white/5"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </motion.div>

      <div className="mx-auto max-w-[1700px] px-4 md:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12 pt-12 hidden items-center justify-center md:flex">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex h-16 w-16 items-center justify-center rounded-2xl glass-panel hover:border-accent/50 transition-all duration-300">
              <ArrowLeft className="h-8 w-8 text-white group-hover:-translate-x-1 transition-all" />
            </Link>
            <div>
              <h1 className="text-5xl font-display tracking-tight text-white uppercase text-gradient">Pro <span className="display-serif italic text-accent">Studio</span></h1>
              <p className="micro-label mt-2">Advanced Ink Simulation / V1.0</p>
            </div>
          </div>
        </div>

        <div className={cn(
          "grid gap-8 lg:grid-cols-[minmax(320px,22%)_1fr_minmax(320px,22%)]",
          activeTab === 'edit' && "grid-cols-1 lg:grid-cols-[65%_35%]"
        )}>
          {/* Left Column: Assets & AI Generator */}
          <div className={cn("space-y-8 order-3 lg:order-1", activeTab !== 'prep' && "hidden lg:block")}>
            <section className="glass-panel p-8 ethereal-glow group">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="micro-label group-hover:text-accent transition-colors">01. Tuval Hazırlığı</h3>
                <UserCheck className="h-5 w-5 text-white/20" />
              </div>
              
              <div className="grid grid-cols-4 gap-3 mb-10">
                {bodyPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setBodyPreview(preset.url)}
                    className={cn(
                      "group relative aspect-[3/4] overflow-hidden rounded-xl border transition-all duration-500",
                      bodyPreview === preset.url 
                        ? "border-accent shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105" 
                        : "border-white/10 hover:border-white/40"
                    )}
                  >
                    <img src={preset.url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-10">
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors group/item">
                  <span className="micro-label mb-3 block">Bölge Seçimi</span>
                  <button 
                    onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                    className="flex w-full items-center justify-between"
                  >
                    <span className="text-2xl font-display text-white tracking-tight uppercase">{location}</span>
                    <ChevronRight className={cn("h-6 w-6 text-white/20 transition-all group-hover/item:text-accent", isLocationMenuOpen && "rotate-90")} />
                  </button>

                  <AnimatePresence>
                    {isLocationMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-0 top-full z-[100] mt-4 w-full glass-panel p-4 shadow-2xl lg:left-full lg:top-0 lg:ml-6 lg:mt-0 lg:w-80"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {locations.map((loc) => (
                            <button
                              key={loc.id}
                              onClick={() => {
                                setLocation(loc.name);
                                setIsLocationMenuOpen(false);
                                const targetId = gender === 'Erkek' ? (loc.id.includes('female') ? (loc as any).maleId : loc.id) : ((loc as any).femaleId || loc.id);
                                const preset = bodyPresets.find(p => p.id === targetId);
                                if (preset) setBodyPreview(preset.url);
                              }}
                              className={cn(
                                "flex items-center gap-5 p-4 rounded-xl text-left transition-all border",
                                location === loc.name 
                                  ? "bg-white text-black border-white" 
                                  : "text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <div className={cn("flex h-10 w-10 rounded-lg items-center justify-center transition-colors", location === loc.name ? "bg-black/10" : "bg-white/5")}>
                                {loc.icon}
                              </div>
                              <span className="text-sm font-display tracking-wider uppercase">{loc.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors group/item">
                  <span className="micro-label mb-3 block">Anatomi</span>
                  <button 
                    onClick={() => setGender(gender === 'Erkek' ? 'Kadın' : 'Erkek')}
                    className="flex w-full items-center justify-between"
                  >
                    <span className="text-2xl font-display text-white tracking-tight uppercase">{gender}</span>
                    <RefreshCw className="h-6 w-6 text-white/20 group-hover/item:text-accent group-hover/item:rotate-180 transition-all duration-700" />
                  </button>
                </div>
              </div>

              <ImageUpload onUpload={() => {}} preview={bodyPreview} setPreview={setBodyPreview} />
            </section>

            <section className="glass-panel p-8 ethereal-glow">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="micro-label">02. Katman Kontrolü</h3>
                <Layers className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-3 mb-8">
                {tattooLayers.map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      selectedLayerId === layer.id 
                        ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                        : "border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                        <img src={layer.url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase tracking-tight truncate max-w-[120px]">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                        className="p-2 text-white/40 hover:text-accent"
                      >
                        {layer.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                        className="p-2 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {tattooLayers.length === 0 && (
                  <p className="text-center py-6 micro-label">Aktif Katman Yok</p>
                ) }
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="micro-label">Yapay Zeka Üretici</h3>
                  <Diamond className="h-4 w-4 fill-accent text-accent" />
                </div>
                <div className="space-y-5">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Dövme hayalinizi tarif edin..."
                    className="h-24 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-medium uppercase tracking-tight text-white focus:border-accent/50 focus:outline-none transition-all placeholder:text-white/20"
                  />
                  <button
                    onClick={handleGenerateTattoo}
                    disabled={isGeneratingTattoo}
                    className="btn-primary w-full py-4 text-[11px] accent-gradient !text-white"
                  >
                    {isGeneratingTattoo ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'ÜRET VE UYGULA'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Middle Column: Main Preview */}
          <div className={cn(
            "flex flex-col gap-8 order-1 lg:order-2", 
            activeTab === 'prep' && "hidden lg:flex",
            activeTab === 'edit' && "col-span-1"
          )}>
            <div 
              ref={canvasRef}
              className="relative aspect-[4/5] w-full max-h-[75vh] overflow-hidden glass-panel lg:max-h-none border border-white/10 shadow-2xl ethereal-glow"
            >
              <AnimatePresence mode="wait">
                {result && !showOriginal ? (
                  <motion.img
                    key="result"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={result}
                    alt="Result"
                    className="h-full w-full object-contain"
                  />
                ) : bodyPreview ? (
                  <div className="relative h-full w-full">
                    <motion.img
                      key="body"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={bodyPreview}
                      alt="Body"
                      className="h-full w-full object-contain pointer-events-none"
                    />
                    {tattooLayers.map((layer) => layer.visible && !showOriginal && (
                      <motion.div 
                        key={layer.id}
                        onPan={(e, info) => handlePan(e, info, layer.id)}
                        onTap={() => setSelectedLayerId(layer.id)}
                        onPointerDown={() => setSelectedLayerId(layer.id)}
                        onTouchStart={(e) => handleTouchStart(e, layer.id)}
                        onTouchMove={(e) => handleTouchMove(e, layer.id)}
                        onTouchEnd={handleTouchEnd}
                        style={getTattooStyle(layer)}
                        className={cn(
                          "group touch-none",
                          selectedLayerId === layer.id && "ring-2 ring-accent ring-offset-4 ring-offset-obsidian rounded-lg"
                        )}
                      >
                        <img
                          src={layer.url}
                          alt={layer.name}
                          className="h-full w-full object-contain pointer-events-none filter contrast-125"
                        />
                        
                        {/* Resize Handle - Only visible when selected */}
                        {selectedLayerId === layer.id && (
                          <motion.div
                            onPan={(e, info) => handleResizePan(e, info, layer.id)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="absolute -right-6 -bottom-6 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-2xl cursor-nwse-resize z-50 border-2 border-white"
                          >
                            <Maximize2 className="h-5 w-5" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white/20">
                    <ImageIcon className="mb-6 h-20 w-20 opacity-10" />
                    <p className="text-xl font-display uppercase tracking-widest">Girdi Bekleniyor</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Canvas Overlays */}
              <div className="absolute bottom-8 left-8 flex gap-4">
                <button 
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl glass-panel hover:border-accent/50 transition-all"
                >
                  {showOriginal ? <EyeOff className="h-6 w-6 text-accent" /> : <Eye className="h-6 w-6 text-white/60" />}
                </button>
                <button 
                  onClick={() => {setResult(null); setBodyPreview(null); setTattooLayers([]); setSelectedLayerId(null);}}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl glass-panel hover:text-red-400 hover:border-red-400/50 transition-all"
                >
                  <Trash2 className="h-6 w-6 text-white/60" />
                </button>
              </div>

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-xl z-[100]">
                  <Loader2 className="mb-6 h-16 w-16 animate-spin text-accent" />
                  <p className="text-3xl font-display uppercase tracking-widest text-white text-gradient">Mürekkep İşleniyor</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={handleVisualize}
                disabled={isProcessing}
                className="btn-primary py-5 flex items-center justify-center gap-4 text-sm tracking-widest uppercase font-bold accent-gradient !text-white"
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    SON RENDER
                  </>
                )}
              </button>
              <div className="flex gap-4">
                <button 
                  onClick={handleDownload}
                  className="btn-glass flex-1 flex items-center justify-center gap-3 py-5 text-[11px] font-bold"
                >
                  <Download className="h-5 w-5" />
                  HD DIŞA AKTAR
                </button>
                <button 
                  onClick={handleSaveToGallery}
                  className="btn-glass flex-1 flex items-center justify-center gap-3 py-5 text-[11px] font-bold"
                >
                  <Save className="h-5 w-5" />
                  KASA
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Advanced Controls */}
          <div className={cn(
            "space-y-6 lg:space-y-8 order-2 lg:order-3", 
            activeTab !== 'edit' && "hidden lg:block",
            activeTab === 'edit' && "col-span-1"
          )}>
            <section className="glass-panel p-8 ethereal-glow h-full overflow-y-auto max-h-[75vh] lg:max-h-none">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-display uppercase tracking-widest text-white">
                    {selectedLayer ? `"${selectedLayer.name}"` : 'KATMAN SEÇİLMEDİ'}
                  </h3>
                </div>
                {selectedLayer && (
                  <button 
                    onClick={() => updateLayerSettings(DEFAULT_SETTINGS)}
                    className="micro-label hover:text-accent transition-colors"
                  >
                    SIFIRLA
                  </button>
                )}
              </div>

              {selectedLayer ? (
                <div className="space-y-8">
                  <div className="hidden lg:block space-y-4">
                    <div className="flex items-center gap-3 micro-label">
                      <Move className="h-4 w-4" />
                      Yerleşim
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ControlSlider label="X-Ekseni" value={selectedLayer.settings.posX} min={0} max={100} onChange={(v) => updateLayerSettings({ posX: v })} />
                      <ControlSlider label="Y-Ekseni" value={selectedLayer.settings.posY} min={0} max={100} onChange={(v) => updateLayerSettings({ posY: v })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <ControlSlider label="Opaklık" icon={<Droplets className="h-3 w-3" />} value={selectedLayer.settings.opacity} min={0} max={100} onChange={(v) => updateLayerSettings({ opacity: v })} />
                    <ControlSlider label="Ölçek" icon={<Maximize2 className="h-3 w-3" />} value={selectedLayer.settings.scale} min={50} max={250} onChange={(v) => updateLayerSettings({ scale: v })} />
                  </div>
                  <ControlSlider label="Döndürme" icon={<RotateCcw className="h-3 w-3" />} value={selectedLayer.settings.rotation} min={-180} max={180} onChange={(v) => updateLayerSettings({ rotation: v })} />
                  
                  <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 micro-label">
                      <Layers className="h-4 w-4" />
                      Mürekkep Filtreleri
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ControlSlider label="Parlaklık" value={selectedLayer.settings.brightness} min={50} max={150} onChange={(v) => updateLayerSettings({ brightness: v })} />
                      <ControlSlider label="Kontrast" value={selectedLayer.settings.contrast} min={50} max={150} onChange={(v) => updateLayerSettings({ contrast: v })} />
                    </div>
                    <ControlSlider label="Bulanıklık" value={selectedLayer.settings.blur} min={0} max={10} onChange={(v) => updateLayerSettings({ blur: v })} />
                  </div>

                  <button 
                    onClick={() => deleteLayer(selectedLayer.id)}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 py-4 micro-label !text-red-400 transition-all hover:bg-red-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                    KATMANI SİL
                  </button>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Layers className="mx-auto h-16 w-16 text-white/10 mb-6" />
                  <p className="micro-label">Düzenlemeye başlamak için bir katman seçin</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Mobile Bottom Title */}
        <div className="mt-16 flex flex-col items-center justify-center gap-6 lg:hidden">
          <div className="h-px w-20 bg-white/10" />
          <h1 className="text-3xl font-display tracking-tight text-white/40 uppercase">Pro <span className="text-accent opacity-50">Studio</span></h1>
          <Link to="/" className="flex items-center gap-3 micro-label hover:text-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
            ANA SAYFAYA DÖN
          </Link>
        </div>
      </div>
    </div>
  );
}

function ControlSlider({ label, icon, value, min, max, onChange }: { label: string, icon?: React.ReactNode, value: number, min: number, max: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between micro-label">
        <div className="flex items-center gap-2">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        <span className="tabular-nums text-white">{value}{label === 'Rotation' ? '°' : '%'}</span>
      </div>
      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <input 
          type="range" 
          min={min} max={max} 
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent accent-accent z-10" 
        />
        <div 
          className="absolute top-0 left-0 h-full bg-accent/20 pointer-events-none" 
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}
