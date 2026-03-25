import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  preview: string | null;
  setPreview: (url: string | null) => void;
}

export function ImageUpload({ onUpload, preview, setPreview }: ImageUploadProps) {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload(file);
    }
  }, [onUpload, setPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false
  } as any);

  return (
    <div className="w-full">
      {preview ? (
        <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-white/5 border border-white/10 shadow-xl">
          <img src={preview} alt="Upload preview" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 backdrop-blur-md text-white transition-all hover:bg-red-600 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 glass-panel p-3">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <p className="micro-label !text-white/80">Görsel Analiz Edildi</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 transition-all duration-500 hover:bg-white/10 hover:border-accent/50",
            isDragActive && "border-accent bg-accent/10 scale-[0.98]"
          )}
        >
          <div className="absolute inset-0 mesh-grid opacity-5 pointer-events-none" />
          <input {...getInputProps()} />
          
          <div className="relative flex flex-col items-center gap-6 text-white/20 group-hover:text-white transition-all duration-500">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-accent/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-500">
              <Upload className="h-8 w-8 transition-transform group-hover:-translate-y-1" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-accent rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white transition-colors">Fotoğraf Yükle</p>
              <p className="micro-label group-hover:text-white/60 transition-colors">Sürükle bırak veya tıkla</p>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="h-[1px] w-8 bg-white/5" />
              <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">JPG, PNG, WEBP</span>
              <div className="h-[1px] w-8 bg-white/5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
