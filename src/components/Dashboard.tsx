import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Download, Save } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { refineTattooPrompt, triggerN8NWorkflow } from '../services/ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { TATTOO_STYLES } from '../constants/styles';

export function Dashboard({ userProfile: initialProfile }: { userProfile?: any }) {
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);
  const [tattooPreview, setTattooPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(initialProfile);

  useEffect(() => {
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
      toast.error('Lütfen vücut fotoğrafınızı yükleyin');
      return;
    }
    if (!tattooPreview && !prompt) {
      toast.error('Lütfen bir dövme tasarımı yükleyin veya fikrinizi tarif edin');
      return;
    }

    setIsProcessing(true);
    try {
      const refined = await refineTattooPrompt(prompt || "Dövme tasarımı", TATTOO_STYLES[0].name);
      toast.info('Yapay zeka tasarımı hazırlıyor...');
      
      const response = await triggerN8NWorkflow(bodyPreview, refined, TATTOO_STYLES[0].name, tattooPreview || undefined);
      
      if (response.success) {
        toast.success('Görselleştirme tamamlandı!');
        const mockResult = 'https://picsum.photos/seed/tattoo/800/800';
        setResult(mockResult);
 
        // Save simulation to history if member
        if (userProfile?.role === 'member') {
          await addDoc(collection(db, 'simulations'), {
            uid: auth.currentUser?.uid,
            bodyImage: bodyPreview,
            tattooImage: tattooPreview || 'generated',
            resultImage: mockResult,
            prompt: refined,
            style: TATTOO_STYLES[0].name,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        throw new Error('İş akışı tetiklenemedi');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'simulations');
    } finally {
      setIsProcessing(false);
    }
  };

  const isMember = userProfile?.role === 'member' || userProfile?.role === 'admin';

  return (
    <div className="w-full relative">
      <div className="absolute top-0 left-0 w-full h-full mesh-grid opacity-10 pointer-events-none" />
      
      <div className="grid gap-12 lg:grid-cols-[1fr_480px] relative z-10">
        {/* Left Column: Result */}
        <div className="relative flex flex-col items-center justify-center p-12 glass-panel min-h-[600px] overflow-hidden group ethereal-glow">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-1 accent-gradient opacity-50" />
          
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full space-y-10"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl group-hover:border-white/20 transition-all duration-700">
                  <img src={result} alt="AI Sonucu" className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex gap-6">
                  <button className="btn-glass flex-1 py-6 flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] uppercase font-bold">
                    <Download className="h-5 w-5" />
                    İNDİR
                  </button>
                  <button className="btn-primary flex-1 py-6 flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] uppercase font-bold">
                    <Save className="h-5 w-5" />
                    KAYDET
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center relative"
              >
                <div className="relative mx-auto mb-12 flex h-40 w-40 items-center justify-center">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl animate-pulse" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 group-hover:border-accent/40 transition-colors duration-500">
                    <ImageIcon className="h-16 w-16 text-white/10 group-hover:text-accent transition-colors duration-500" />
                  </div>
                </div>
                <h4 className="text-4xl font-display text-white tracking-tight uppercase mb-6 text-gradient">Görüntü Bekleniyor</h4>
                <p className="mx-auto max-w-[360px] micro-label leading-relaxed">
                  Dönüşüme tanık olmak için vücut fotoğrafınızı ve tasarımınızı yükleyin.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-xl z-50"
            >
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-accent/20 blur-3xl animate-pulse" />
                <Loader2 className="relative h-24 w-24 animate-spin text-accent" />
              </div>
              <p className="text-4xl font-display uppercase tracking-tight text-white mb-6 text-gradient">Mürekkep İşleniyor</p>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                ))}
              </div>
              <p className="mt-10 micro-label">Yapay zeka hayalinizi işliyor</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Input */}
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-8">
            <section className="group/section">
              <h3 className="mb-6 micro-label group-hover/section:text-accent transition-colors">01. Vücut</h3>
              <div className="p-4 glass-card rounded-2xl">
                <ImageUpload onUpload={() => {}} preview={bodyPreview} setPreview={setBodyPreview} />
              </div>
            </section>
            <section className="group/section">
              <h3 className="mb-6 micro-label group-hover/section:text-accent transition-colors">02. Tasarım</h3>
              <div className="p-4 glass-card rounded-2xl">
                <ImageUpload onUpload={() => {}} preview={tattooPreview} setPreview={setTattooPreview} />
              </div>
            </section>
          </div>

          <section className="group/section">
            <h3 className="mb-6 micro-label group-hover/section:text-white transition-colors">03. Hayalini Tarif Et</h3>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Ön kolumda geometrik bir kurt, ince çizgiler ve nokta gölgeleme..."
                className="h-44 w-full glass-panel p-8 text-sm text-white placeholder:text-white/20 focus:border-accent/50 focus:outline-none transition-all resize-none leading-relaxed font-medium tracking-tight"
              />
              <div className="absolute bottom-6 right-6 micro-label opacity-20">
                {prompt.length} KARAKTER
              </div>
            </div>
          </section>

          <button
            onClick={handleVisualize}
            disabled={isProcessing}
            className="btn-primary w-full py-8 text-xl group relative overflow-hidden accent-gradient !text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-6 tracking-[0.3em] uppercase font-bold">
                <Sparkles className="h-8 w-8 group-hover:rotate-12 transition-transform" />
                GÖRSELLEŞTİR
              </div>
            )}
          </button>

          <div className="p-8 glass-card rounded-2xl border-dashed border-white/10">
            <p className="micro-label leading-relaxed text-center">
              * En iyi sonuçlar için vücut fotoğrafınızın net ve iyi aydınlatılmış olduğundan emin olun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
