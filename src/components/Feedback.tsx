import React, { useState } from 'react';
import { MessageSquare, Send, Star, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

export function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Lütfen bir puan verin');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const path = 'feedback';
      await addDoc(collection(db, path), {
        uid: auth.currentUser?.uid || null,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      
      toast.success('Geri bildiriminiz için teşekkürler!');
      setRating(0);
      setComment('');
      setIsOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center glass-panel ethereal-glow hover:border-accent/50 transition-all duration-300"
          >
            <MessageSquare className="relative h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 overflow-hidden glass-panel ethereal-glow border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 mesh-grid opacity-5 pointer-events-none" />
            
            <div className="relative flex items-center justify-between bg-white/5 px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
                  <MessageSquare className="h-4 w-4 text-accent" />
                </div>
                <h3 className="micro-label !text-white !opacity-100">GERİ BİLDİRİM</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="group h-8 w-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/40 group-hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative p-8 space-y-10">
              <div className="flex flex-col items-center gap-6">
                <p className="micro-label">DENEYİMİNİZİ PUANLAYIN</p>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="group/star relative transition-all hover:scale-125"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-all duration-300",
                          star <= rating 
                            ? "fill-accent text-accent" 
                            : "text-white/5 hover:text-accent/20"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="micro-label ml-1">GÖRÜŞÜNÜZ</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Düşüncelerinizi paylaşın..."
                  className="h-36 w-full resize-none glass-panel p-6 text-sm text-white placeholder:text-white/10 focus:border-accent/50 focus:outline-none transition-all leading-relaxed font-medium tracking-tight"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-6 flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] uppercase font-bold accent-gradient !text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    GÖNDER
                  </>
                )}
              </button>
              
              <p className="micro-label text-center">
                * Geri bildirimleriniz vizyonumuzu geliştirmemize yardımcı olur.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
