import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  Zap, 
  Layers, 
  ChevronDown,
  MessageSquare,
  MousePointer2,
  CheckCircle2,
  Smartphone,
  Check,
  User as UserIcon,
  LogOut,
  Settings,
  Crown
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Pricing } from './components/Pricing';
import { Feedback } from './components/Feedback';
import { ProStudio } from './components/ProStudio';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, googleProvider, db, OperationType, handleFirestoreError } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

const faqs = [
  {
    question: "InkVision'un dövme aracını kullanmak için çizim becerisine veya tasarım deneyimine ihtiyacım var mı?",
    answer: "Hayır, hiç gerek yok! InkVision'un AI dövme oluşturucusu, sadece metin açıklamalarınızı kullanarak profesyonel kalitede dövme tasarımları oluşturur. Sadece ne istediğinizi yazın ve yapay zekanın gerisini halletmesine izin verin."
  },
  {
    question: "Dövme yaptırmadan önce vücudumda nasıl duracağını görebilir miyim?",
    answer: "Evet! AI Dövme Simülatörümüz, oluşturduğunuz veya yüklediğiniz dövmeleri kendi fotoğrafınız üzerinde denemenize olanak tanır. Böylece kalıcı bir karar vermeden önce yerleşimi ve boyutu görebilirsiniz."
  },
  {
    question: "Gerçekten ücretsiz mi, yoksa kullanmadan önce kaydolmam mı gerekiyor?",
    answer: "Temel özelliklerimizi ücretsiz olarak deneyebilirsiniz. Daha gelişmiş özellikler ve sınırsız kullanım için uygun fiyatlı abonelik planlarımız mevcuttur."
  },
  {
    question: "InkVision'daki tasarımları bir stüdyoda dövme yaptırmak için kullanabilir miyim?",
    answer: "Kesinlikle. Oluşturduğunuz tasarımları yüksek çözünürlüklü olarak indirebilir ve dövme sanatçınıza referans olarak gösterebilirsiniz."
  }
];

const steps = [
  {
    title: "KONSEPT",
    description: "Hayalindeki dövmeyi metin olarak tarif et veya bir referans görsel yükle.",
    icon: MessageSquare
  },
  {
    title: "YARATIM",
    description: "Yapay zeka saniyeler içinde senin için benzersiz tasarımlar hazırlar.",
    icon: Sparkles
  },
  {
    title: "DENEYİM",
    description: "Dövmenin vücudunun neresinde ve ne boyutta duracağını ayarla.",
    icon: MousePointer2
  },
  {
    title: "SONUÇ",
    description: "Mükemmel tasarımı bulduğunda yüksek çözünürlüklü olarak indir.",
    icon: CheckCircle2
  }
];

function LandingPage({ user, userProfile, isAuthReady, handleLogin, handleLogout }: any) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isMember = true; // Force visible for now as requested by user "Pro studio kayboldu"

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-obsidian selection:bg-accent selection:text-white font-sans text-white relative overflow-hidden">
      <div className="atmosphere" />
      <div className="fixed inset-0 mesh-grid z-0" />
      
      {/* Navigation */}
      <nav className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1400px] transition-all duration-500",
        isScrolled ? "glass-panel py-3 px-8 shadow-2xl" : "py-6 px-4"
      )}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 accent-gradient rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg shadow-accent/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-display font-black tracking-tight text-gradient">InkVision</span>
          </Link>

          <div className="hidden items-center gap-12 lg:flex">
            {['studio', 'features', 'pricing', 'faq'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors uppercase tracking-widest"
              >
                {item === 'studio' ? 'STÜDYO' : item === 'features' ? 'ÖZELLİKLER' : item === 'pricing' ? 'FİYATLAR' : 'SSS'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {isAuthReady && (
              <div className="flex items-center gap-6">
                {user ? (
                  <div className="flex items-center gap-6">
                    <div className="hidden flex-col items-end sm:flex">
                      <span className="text-xs font-bold uppercase tracking-wider">{user.displayName}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em]",
                        isMember ? "text-accent-secondary" : "text-white/30"
                      )}>
                        {isMember ? 'ELİT ÜYE' : 'ÜCRETSİZ RUH'}
                      </span>
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-bold text-white/40 hover:text-red-400 transition-colors uppercase tracking-widest">ÇIKIŞ</button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="btn-glass py-2 px-6 text-xs">GİRİŞ</button>
                )}
                {isMember && (
                  <Link to="/pro-studio" className="btn-primary py-2 px-6 text-xs shadow-lg shadow-white/10">
                    PRO STUDIO
                  </Link>
                )}
              </div>
            )}
            <button className="lg:hidden text-white/70 hover:text-white transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[55] flex flex-col bg-obsidian/95 backdrop-blur-2xl p-8 pt-32 lg:hidden"
          >
            <div className="atmosphere opacity-50" />
            
            <div className="relative z-10 flex flex-col gap-12">
              <div className="space-y-8">
                <p className="micro-label text-accent">NAVİGASYON</p>
                <div className="flex flex-col gap-8">
                  {['studio', 'features', 'pricing', 'faq'].map((item) => (
                    <button 
                      key={item} 
                      onClick={() => scrollToSection(item)} 
                      className="text-5xl font-display font-black tracking-tighter text-left hover:text-accent transition-colors"
                    >
                      {item === 'studio' ? 'STÜDYO' : item === 'features' ? 'ÖZELLİKLER' : item === 'pricing' ? 'FİYATLAR' : 'SSS'}
                    </button>
                  ))}
                  <Link 
                    to="/pro-studio" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-display font-black tracking-tighter text-accent-secondary italic"
                  >
                    PRO STUDIO
                  </Link>
                </div>
              </div>

              <div className="space-y-6 pt-12 border-t border-white/10">
                <p className="micro-label">HESAP</p>
                {user ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-display font-bold">{user.displayName}</span>
                      <span className="text-xs font-bold text-accent-secondary tracking-widest uppercase">ELİT ÜYE</span>
                    </div>
                    <button onClick={handleLogout} className="text-xl font-bold text-red-500 text-left uppercase tracking-tight">ÇIKIŞ YAP</button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="text-4xl font-display font-black text-left hover:text-accent transition-colors">GİRİŞ YAP</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative flex min-h-screen flex-col items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-20 pointer-events-none" />
        
        <div className="absolute left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-32">
          <div className="vertical-text opacity-30 text-accent">EST. 2026 / ISTANBUL</div>
          <div className="vertical-text opacity-30">AI POWERED TATTOO DESIGN</div>
          <div className="vertical-text opacity-30">BEYOND THE SKIN</div>
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-32">
          <div className="vertical-text opacity-30 text-accent-secondary">SCROLL TO DISCOVER</div>
          <div className="vertical-text opacity-30">DESIGNED FOR THE BOLD</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-full text-center px-6 relative z-10"
        >
          <div className="mb-8 inline-block">
            <span className="glass-panel px-6 py-2 text-[10px] font-mono font-bold tracking-[0.3em] text-accent-secondary">V1.0 / GENESIS</span>
          </div>
          
          <h1 className="text-[12vw] lg:text-[10vw] font-display font-black leading-[0.85] mb-12 text-gradient tracking-tighter">
            INK<br /><span className="ethereal-glow">VISION</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-16 mt-16">
            <div className="max-w-xs text-left border-l border-accent/30 pl-8">
              <span className="micro-label block mb-3 text-accent">01 / KONSEPT</span>
              <p className="text-sm font-medium text-white/70 leading-relaxed">
                Hayallerinizi Yapay Zeka ile gerçeğe dönüştürün. <span className="display-serif text-white">Benzersiz tasarımlar oluşturun.</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <button 
                onClick={() => scrollToSection('studio')}
                className="btn-primary group"
              >
                TASARIMA BAŞLA 
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="max-w-xs text-left border-l border-white/10 pl-8">
              <span className="micro-label block mb-3">02 / VİZYON</span>
              <p className="text-sm font-medium text-white/70 leading-relaxed">
                Vücudunuzda sanal olarak deneyin. <span className="display-serif text-white">Sınırları zorlayan teknoloji.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Marquee - Modernized */}
        <div className="mt-auto w-full py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex overflow-hidden">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-24 items-center whitespace-nowrap pr-24"
            >
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={i}>
                  <span className="text-5xl font-display font-black tracking-tighter text-white/10 uppercase">YAPAY ZEKA DÖVME DEVRİMİ</span>
                  <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <span className="text-5xl font-serif italic tracking-tighter text-white/40">SANATIN GELECEĞİ</span>
                  <Sparkles className="h-8 w-8 text-accent-secondary opacity-50" />
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-48 px-6 relative">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="lg:sticky lg:top-48">
              <span className="micro-label block mb-8 text-accent">İŞ AKIŞI</span>
              <h2 className="text-7xl lg:text-[9vw] font-display font-black leading-[0.85] tracking-tighter mb-12 text-gradient">
                YARATIM<br /><span className="display-serif text-white/20">SÜRECİ</span>
              </h2>
              <div className="flex items-center gap-8">
                <div className="h-px w-16 bg-accent" />
                <p className="text-xl font-medium text-white/60 max-w-sm leading-relaxed">
                  Fikirden sanata giden yolda <span className="text-white">kusursuz</span> dövme deneyimi.
                </p>
              </div>
            </div>
            
            <div className="space-y-8 mt-24 lg:mt-0">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-12 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 accent-gradient opacity-0 group-hover:opacity-10 transition-opacity blur-3xl -translate-y-16 translate-x-16" />
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-7xl font-display font-black text-white/5 group-hover:text-accent/20 transition-colors leading-none">0{idx + 1}</span>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/50 transition-colors">
                      <step.icon className="h-8 w-8 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-4 group-hover:text-accent transition-colors">{step.title}</h3>
                  <p className="text-lg text-white/40 group-hover:text-white/70 transition-colors leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tattoo Studio Section */}
      <section id="studio" className="py-32 px-6 relative">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-20 flex flex-col lg:flex-row justify-between items-end gap-12">
            <div>
              <span className="micro-label block mb-4 text-accent">PRO ARAÇLAR</span>
              <h2 className="text-6xl lg:text-8xl font-display font-black leading-none tracking-tighter text-gradient">
                AI STUDIO
              </h2>
            </div>
            <div className="max-w-sm text-right">
              <p className="text-lg font-medium text-white/60 leading-relaxed mb-6">
                Hemen şimdi kendi tasarımını oluşturmaya başla. Profesyonel araçlar emrinizde.
              </p>
              <div className="h-px w-full bg-white/10" />
            </div>
          </div>
          <div className="glass-panel p-1 shadow-2xl shadow-black/50 overflow-hidden">
            <Dashboard userProfile={userProfile} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-48 px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid lg:grid-cols-12 gap-6">
              <div className="glass-card p-16 lg:col-span-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap size={300} />
                </div>
                <span className="micro-label block mb-10 text-accent">ANA ÖZELLİK</span>
                <h3 className="text-6xl lg:text-8xl font-display font-black tracking-tighter mb-8 leading-none text-gradient">Metinden<br />Tasarıma</h3>
                <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
                  Sadece hayalindekileri yazın, yapay zekamız saniyeler içinde benzersiz dövme tasarımları oluştursun. Sınırsız yaratıcılık parmaklarınızın ucunda.
                </p>
              </div>
              
              <div className="glass-card p-12 lg:col-span-4 flex flex-col justify-between group">
                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/50 transition-all">
                  <Layers className="h-8 w-8 text-white/40 group-hover:text-white" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">Görselden Sanata</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Elinizdeki herhangi bir çizimi veya fotoğrafı dövme formatına dönüştürün ve geliştirin.</p>
                </div>
              </div>

              <div className="glass-card p-12 lg:col-span-4 flex flex-col justify-between group">
                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/50 transition-all">
                  <Smartphone className="h-8 w-8 text-white/40 group-hover:text-white" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">Sanal Deneme</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Oluşturduğunuz dövmeyi kendi vücudunuzda önizleyin, boyutunu ve yerleşimini test edin.</p>
                </div>
              </div>

              <div className="glass-card p-16 lg:col-span-8 flex flex-col md:flex-row items-center gap-12 group">
                <div className="h-40 w-40 shrink-0 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 group-hover:border-accent/50 group-hover:rotate-12 transition-all duration-700">
                  <Sparkles className="h-16 w-16 text-accent" />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-bold mb-4">Pro Stüdyo Araçları</h3>
                  <p className="text-lg text-white/60 leading-relaxed">Katmanlı düzenleme, gelişmiş filtreler ve hassas yerleşim araçları ile tasarımınızı mükemmelleştirin.</p>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-48 px-6 relative overflow-hidden">
        <div className="atmosphere opacity-30" />
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-24 lg:grid-cols-2 items-center">
            <div className="relative">
              <h2 className="text-7xl lg:text-[8vw] font-display font-black leading-[0.85] tracking-tighter mb-16 text-gradient">
                NEDEN<br /><span className="display-serif text-white/20">BİZ?</span>
              </h2>
              <div className="space-y-12">
                {[
                  { text: "Kullanımı son derece kolay ve hızlıdır.", desc: "Saniyeler içinde profesyonel sonuçlar." },
                  { text: "Temel özellikler tamamen ücretsizdir.", desc: "Yaratıcılığınızı kısıtlamadan deneyin." },
                  { text: "Tasarımlarınızda filigran bulunmaz.", desc: "Kendi sanatınızın tam sahibi olun." },
                  { text: "Mobil cihazlarla tam uyumlu çalışır.", desc: "İstediğiniz yerde, istediğiniz zaman." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-8 group"
                  >
                    <span className="text-4xl font-display font-black text-white/5 group-hover:text-accent transition-colors">0{i + 1}</span>
                    <div>
                      <h4 className="text-2xl font-bold mb-2">{item.text}</h4>
                      <p className="text-white/40 text-sm font-mono uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 accent-gradient opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-700" />
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10">
                <img 
                  src="https://picsum.photos/seed/inkvision-ethereal/1000/1250" 
                  alt="AI Tattoo Design" 
                  className="h-full w-full object-cover transition-transform duration-1000 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -bottom-8 -left-8 p-10 glass-panel max-w-sm shadow-2xl">
                <p className="text-xl font-serif italic leading-relaxed text-white/90">"InkVision ile hayalimdeki dövmeyi saniyeler içinde tasarladım. İnanılmaz!"</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px w-12 bg-accent" />
                  <span className="micro-label text-accent">MUTLU MÜŞTERİ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="mx-auto max-w-[1400px] mb-20 text-center">
          <span className="micro-label block mb-4 text-accent font-bold tracking-widest uppercase">YATIRIM</span>
          <h2 className="text-7xl lg:text-9xl font-display font-black leading-none tracking-tighter text-gradient uppercase">PLANLAR</h2>
        </div>
        <Pricing />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-48 px-6 relative">
        <div className="mx-auto max-w-4xl">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
            <h2 className="text-7xl lg:text-9xl font-display font-black leading-[0.85] tracking-tighter text-gradient uppercase">SIKÇA<br /><span className="display-serif text-white/20 italic">SORULAN</span></h2>
            <div className="max-w-xs text-right">
              <span className="micro-label block mb-3 text-accent font-bold tracking-widest">YARDIM MERKEZİ</span>
              <p className="text-sm text-white/40 leading-relaxed">Aklınıza takılan tüm soruların cevapları burada.</p>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card overflow-hidden rounded-2xl">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-8 text-left group transition-colors"
                >
                  <span className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">{faq.question}</span>
                  <div className={cn("h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-accent/50 transition-all", openFaq === idx && "rotate-180 bg-accent/20 border-accent/50")}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 border-t border-white/5">
                        <p className="text-lg text-white/40 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-32 px-6 relative">
        <div className="mx-auto max-w-[1400px] mb-20">
          <span className="micro-label block mb-4 text-accent font-bold tracking-widest">REFERANSLAR</span>
          <h2 className="text-7xl lg:text-9xl font-display font-black leading-none tracking-tighter text-gradient uppercase">TOPLULUK</h2>
        </div>
        <Feedback />
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 relative border-t border-white/5 bg-black/50">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-24 lg:grid-cols-12 mb-24">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-12 w-12 accent-gradient rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-display font-black tracking-tight text-gradient">InkVision</span>
              </div>
              <p className="text-2xl font-medium text-white/60 leading-relaxed max-w-xl">
                Yapay zeka ile hayalinizdeki dövmeyi tasarlayın ve vücudunuzda nasıl duracağını saniyeler içinde keşfedin.
              </p>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="micro-label block mb-8 text-accent">NAVİGASYON</h4>
              <ul className="space-y-4 text-lg font-medium text-white/40">
                <li><button onClick={() => scrollToSection('studio')} className="hover:text-white transition-colors">AI Stüdyo</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Özellikler</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Fiyatlandırma</button></li>
              </ul>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="micro-label block mb-8 text-accent">DESTEK</h4>
              <ul className="space-y-4 text-lg font-medium text-white/40">
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">SSS</button></li>
                <li><button onClick={() => scrollToSection('feedback')} className="hover:text-white transition-colors">Geri Bildirim</button></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-12 flex flex-col items-center justify-between gap-8 md:flex-row">
            <p className="text-xs font-medium text-white/20 uppercase tracking-widest">© 2026 InkVision AI. TÜM HAKLARI SAKLIDIR.</p>
            <div className="flex gap-12">
              <a href="#" className="text-xs font-medium text-white/20 hover:text-accent transition-colors underline underline-offset-4 uppercase tracking-widest">GİZLİLİK POLİTİKASI</a>
              <a href="#" className="text-xs font-medium text-white/20 hover:text-accent transition-colors underline underline-offset-4 uppercase tracking-widest">KULLANIM ŞARTLARI</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUserProfile(userDoc.data());
            } else {
              const newProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'free',
                createdAt: serverTimestamp(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
              setUserProfile(newProfile);
            }
          } catch (error) {
            console.error('Profile fetch/create error:', error);
            // Don't throw here to avoid blocking isAuthReady
            toast.error('Profil bilgileri alınamadı, ancak giriş yapıldı.');
          }
        } else {
          setUserProfile(null);
        }
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast.success('Başarıyla giriş yapıldı!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Lütfen tarayıcınızın açılır pencere engelleyicisini kapatın.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, no need for error toast
      } else {
        toast.error('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Çıkış yapıldı.');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="light" />
      <Routes>
        <Route path="/" element={<LandingPage user={user} userProfile={userProfile} isAuthReady={isAuthReady} handleLogin={handleLogin} handleLogout={handleLogout} />} />
        <Route path="/pro-studio" element={<ProStudio userProfile={userProfile} />} />
      </Routes>
    </BrowserRouter>
  );
}
