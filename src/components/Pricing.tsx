import { Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const tiers = [
  {
    id: 'free',
    name: 'Bireysel',
    price: '0₺',
    description: 'Yeni başlayanlar için temel özellikler.',
    features: ['Ayda 3 AI görselleştirme', 'Standart dövme stilleri', 'Düşük çözünürlüklü önizleme'],
    cta: 'Ücretsiz Başla',
    popular: false
  },
  {
    id: 'member',
    name: 'Bireysel Pro',
    price: '199₺',
    description: 'En popüler bireysel planımız.',
    features: ['Sınırsız görselleştirme', 'Tüm premium stiller', 'Yüksek çözünürlüklü çıktı', 'Öncelikli işleme', 'Reklamsız deneyim'],
    cta: 'Hemen Yükselt',
    popular: true
  },
  {
    id: 'admin',
    name: 'Sanatçı',
    price: '499₺',
    description: 'Profesyonel dövme sanatçıları için yakında.',
    features: ['Ticari kullanım lisansı', 'Müşteri portföy yönetimi', 'Özel stil eğitimi', 'API erişimi', '7/24 Destek'],
    cta: 'Hazırlanıyor',
    popular: false,
    disabled: true
  }
];

export function Pricing() {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleUpgrade = async (tierId: string) => {
    if (!auth.currentUser) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (userRole === tierId) {
      toast.info('Zaten bu plana sahipsiniz');
      return;
    }

    setIsUpgrading(tierId);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        role: tierId,
      });
      setUserRole(tierId);
      toast.success(`${tierId === 'member' ? 'Pro' : 'Sanatçı'} üyeliğiniz başarıyla aktif edildi!`);
      // Sayfayı yenilemek gerekebilir veya state ile App.tsx'e haber verilebilir
      // Şimdilik state güncellemesi yeterli
      window.location.reload(); // En temiz çözüm tüm app state'ini yenilemek
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsUpgrading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full mesh-grid opacity-10 pointer-events-none" />
      
      <div className="mb-24 text-center relative z-10">
        <h2 className="text-6xl font-display tracking-tight text-white sm:text-8xl mb-6 uppercase text-gradient">Plan <span className="display-serif italic opacity-30">Seç</span></h2>
        <p className="mt-4 micro-label">Sınırsız mürekkep için şeffaf paketler</p>
      </div>
      
      <div className="grid gap-10 md:grid-cols-3 relative z-10">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "p-12 flex flex-col relative group transition-all duration-500 glass-panel ethereal-glow",
              tier.popular 
                ? "border-accent/50 scale-105 z-10 shadow-[0_0_50px_rgba(99,102,241,0.15)]" 
                : "hover:border-white/20 hover:-translate-y-2"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 accent-gradient text-white px-8 py-2 text-[10px] font-bold uppercase tracking-[0.4em] rounded-full shadow-lg">
                EN POPÜLER
              </div>
            )}
            
            <div className="mb-14">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-display text-white tracking-tight uppercase">{tier.name}</h3>
                {tier.popular && <Sparkles className="h-6 w-6 text-accent animate-pulse" />}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-display tracking-tight text-white group-hover:text-accent transition-colors">{tier.price}</span>
                <span className="micro-label opacity-30">/AYLIK</span>
              </div>
              <p className="mt-10 text-sm font-medium text-white/50 leading-relaxed min-h-[3.5rem]">{tier.description}</p>
            </div>
            
            <ul className="mb-14 flex-1 space-y-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-wider text-white/70 group/item">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 group-hover/item:bg-accent group-hover/item:text-white group-hover/item:border-accent transition-all duration-300">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="group-hover/item:text-white transition-colors">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleUpgrade(tier.id)}
              disabled={isUpgrading !== null || userRole === tier.id || (tier as any).disabled}
              className={cn(
                "btn-primary w-full py-6 flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] font-bold uppercase",
                !tier.popular && "btn-glass",
                tier.popular && "accent-gradient !text-white",
                (userRole === tier.id || (tier as any).disabled) && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              {isUpgrading === tier.id ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : userRole === tier.id ? (
                'AKTİF PLAN'
              ) : (
                <>
                  {tier.cta}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
