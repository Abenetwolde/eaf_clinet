import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Share2, Camera, Calendar, MapPin,
  Check, Play, Image, Eye, ArrowRight, Bookmark, Sparkles, Layers, Maximize2, Minimize2, ZoomIn, X, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';
import type { GalleryItem, GalleryCapture } from './LandingPage';

interface GalleryDetailProps {
  album: GalleryItem;
  allAlbums: GalleryItem[];
  onBack: () => void;
  onSelectAlbum: (album: GalleryItem) => void;
  darkMode?: boolean;
}

export default function GalleryDetail({
  album,
  allAlbums,
  onBack,
  onSelectAlbum,
  darkMode = false,
}: GalleryDetailProps) {
  const { t: tr } = useI18n();

  const captures: GalleryCapture[] = album.captures && album.captures.length > 0
    ? album.captures
    : [{ id: 1, img: album.img, title: album.title, caption: album.description || 'EAF Press Photography', photographer: 'EAF Media Unit' }];

  // Find index of the exact image that was displayed on the card
  const exactImgIndex = captures.findIndex((c) => c.img === album.img);
  const [activeCaptureIndex, setActiveCaptureIndex] = useState<number>(exactImgIndex >= 0 ? exactImgIndex : 0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const filmstripRef = useRef<HTMLDivElement>(null);
  const mainStageRef = useRef<HTMLDivElement>(null);

  const activeCapture = captures[activeCaptureIndex] || captures[0];

  // Immediately scroll to the top of the window on mount and album change
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [album.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const idx = captures.findIndex((c) => c.img === album.img);
    setActiveCaptureIndex(idx >= 0 ? idx : 0);
  }, [album.id, album.img]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onBack();
        }
      } else if (e.key === 'ArrowRight') {
        setActiveCaptureIndex((prev) => (prev < captures.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveCaptureIndex((prev) => (prev > 0 ? prev - 1 : captures.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [captures.length, isFullscreen, onBack]);

  // Scroll filmstrip thumbnail into view
  useEffect(() => {
    if (filmstripRef.current) {
      const activeEl = filmstripRef.current.children[activeCaptureIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCaptureIndex]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#gallery-${album.id}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleScrollFilmstrip = (direction: 'left' | 'right') => {
    if (filmstripRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      filmstripRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Find previous and next albums
  const currentIndex = allAlbums.findIndex((a) => a.id === album.id);
  const prevAlbum = currentIndex > 0 ? allAlbums[currentIndex - 1] : allAlbums[allAlbums.length - 1];
  const nextAlbum = currentIndex < allAlbums.length - 1 ? allAlbums[currentIndex + 1] : allAlbums[0];

  // Related albums (excluding current)
  const relatedAlbums = allAlbums.filter((a) => a.id !== album.id).slice(0, 3);

  // Theme tokens
  const theme = {
    bg: darkMode ? '#080C14' : '#FFFFFF',
    bgAlt: darkMode ? '#0F1524' : '#F8FAFC',
    surface: darkMode ? '#131B2E' : '#FFFFFF',
    surfaceRaised: darkMode ? '#1E294B' : '#F1F5F9',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    textSub: darkMode ? '#CBD5E1' : '#334155',
    textMuted: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    headerBg: darkMode ? 'rgba(8, 12, 20, 0.9)' : 'rgba(255, 255, 255, 0.92)',
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background 0.3s, color 0.3s' }}>
      {/* Sticky Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: theme.headerBg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.border}`,
          padding: '12px 24px',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Back button & breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.03, x: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              style={{
                background: darkMode ? '#1A223B' : '#F1F5F9',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={18} />
              Back to Gallery
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: theme.textMuted, fontWeight: 600 }}>
              <span onClick={onBack} style={{ cursor: 'pointer' }}>Home</span>
              <span>/</span>
              <span onClick={onBack} style={{ cursor: 'pointer' }}>Media Vault</span>
              <span>/</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {album.category}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Capture Counter Pill */}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(1, 64, 167, 0.25)',
              }}
            >
              <Camera size={14} /> Shot {activeCaptureIndex + 1} of {captures.length}
            </span>

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              title="Share album link"
              style={{
                background: copied ? '#DCFCE7' : darkMode ? '#1A223B' : '#F1F5F9',
                color: copied ? '#15803D' : theme.text,
                border: copied ? '1px solid #86EFAC' : `1px solid ${theme.border}`,
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link Copied!' : 'Share'}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Album Header Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: '#FFFFFF',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 4px 12px rgba(1, 64, 167, 0.25)',
              }}
            >
              {album.category}
            </span>

            {album.type === 'VIDEO' ? (
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Play size={12} fill="#EF4444" /> HD Video Coverage
              </span>
            ) : (
              <span
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                  color: theme.textMuted,
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Camera size={13} /> {captures.length} Press Photography Captures
              </span>
            )}

            <span style={{ color: theme.textMuted, fontSize: '0.82rem', fontWeight: 600 }}>
              📍 {album.location} • 🗓️ {album.date}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: theme.text,
              marginBottom: '10px',
            }}
          >
            {album.title}
          </h1>

          <p style={{ color: theme.textSub, fontSize: '1rem', lineHeight: 1.6, maxWidth: '820px', margin: 0 }}>
            {album.description}
          </p>
        </motion.div>

        {/* Main High-Resolution Photo Theater Stage */}
        <motion.div
          ref={mainStageRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'relative',
            background: '#020617',
            borderRadius: '26px',
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            minHeight: 'min(76vh, 620px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          {/* Ambient Lighting / Blurred Backdrop Wallpaper */}
          <div
            key={`ambient-${activeCapture.id}`}
            style={{
              position: 'absolute',
              inset: '-40px',
              backgroundImage: `url(${activeCapture.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(45px) brightness(0.35) saturate(1.6)',
              transform: 'scale(1.15)',
              opacity: fitMode === 'cover' ? 0.3 : 0.85,
              transition: 'opacity 0.4s ease, background-image 0.4s ease',
              pointerEvents: 'none',
            }}
          />

          {/* Vignette & Soft Gradient Mesh Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(2,6,23,0.7) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Top Stage Action Controls */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {/* Ultra-HD Press Badge */}
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '999px',
                padding: '6px 13px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Sparkles size={13} /> Ultra-HD Press Quality
            </span>

            {/* Fit / Cover Display Toggle */}
            <button
              onClick={() => setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
              title={fitMode === 'contain' ? 'Fill stage (cover)' : 'Fit entire photo (contain)'}
              style={{
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.82)';
              }}
            >
              <SlidersHorizontal size={13} />
              {fitMode === 'contain' ? 'Fit View' : 'Fill View'}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              title="Open full screen lightbox (Esc to exit)"
              style={{
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.82)';
              }}
            >
              <Maximize2 size={13} /> Fullscreen
            </button>
          </div>

          {/* Main Foreground Image Container */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              minHeight: 'min(76vh, 620px)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: fitMode === 'cover' ? 0 : '32px 24px 92px',
              boxSizing: 'border-box',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCapture.id}-${fitMode}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                style={{
                  width: fitMode === 'cover' ? '100%' : 'auto',
                  height: fitMode === 'cover' ? '100%' : 'auto',
                  maxHeight: fitMode === 'cover' ? 'min(76vh, 620px)' : 'min(64vh, 500px)',
                  maxWidth: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: fitMode === 'cover' ? 'absolute' : 'relative',
                  inset: fitMode === 'cover' ? 0 : undefined,
                }}
              >
                <img
                  src={activeCapture.img}
                  alt={activeCapture.title}
                  onClick={() => setIsFullscreen(true)}
                  title="Click to view full screen high-resolution capture"
                  style={{
                    width: fitMode === 'cover' ? '100%' : 'auto',
                    height: fitMode === 'cover' ? 'min(76vh, 620px)' : 'auto',
                    maxWidth: '100%',
                    maxHeight: fitMode === 'cover' ? 'min(76vh, 620px)' : 'min(64vh, 500px)',
                    objectFit: fitMode === 'cover' ? 'cover' : 'contain',
                    borderRadius: fitMode === 'cover' ? '0px' : '18px',
                    boxShadow: fitMode === 'cover' ? 'none' : '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                    cursor: 'zoom-in',
                    display: 'block',
                    transition: 'transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (fitMode === 'contain') {
                      e.currentTarget.style.transform = 'scale(1.015)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (fitMode === 'contain') {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Left Navigation Button */}
          {captures.length > 1 && (
            <button
              onClick={() => setActiveCaptureIndex((prev) => (prev > 0 ? prev - 1 : captures.length - 1))}
              title="Previous photo (←)"
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 15,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Floating Right Navigation Button */}
          {captures.length > 1 && (
            <button
              onClick={() => setActiveCaptureIndex((prev) => (prev + 1) % captures.length)}
              title="Next photo (→)"
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#FFFFFF',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 15,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Bottom Caption Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.72) 65%, transparent 100%)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '12px',
              zIndex: 10,
            }}
          >
            <div style={{ maxWidth: '85%' }}>
              <div style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {activeCapture.title}
              </div>
              <div style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {activeCapture.caption}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeCapture.photographer && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#38BDF8',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  📷 {activeCapture.photographer}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filmstrip Track of All Captures in This Album */}
        <div
          style={{
            background: theme.bgAlt,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '20px 24px',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image size={18} color="var(--primary)" />
              All High-Resolution Captures in this Event ({captures.length}):
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => handleScrollFilmstrip('left')}
                title="Scroll thumbnails left"
                style={{
                  background: darkMode ? '#1A223B' : '#FFFFFF',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                ◀
              </button>
              <button
                onClick={() => handleScrollFilmstrip('right')}
                title="Scroll thumbnails right"
                style={{
                  background: darkMode ? '#1A223B' : '#FFFFFF',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                ▶
              </button>
            </div>
          </div>

          {/* Filmstrip Thumbnails Row */}
          <div
            ref={filmstripRef}
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              padding: '6px 2px 14px',
              scrollBehavior: 'smooth',
            }}
          >
            {captures.map((capture, idx) => {
              const isSelected = idx === activeCaptureIndex;
              return (
                <motion.div
                  key={capture.id}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setActiveCaptureIndex(idx)}
                  style={{
                    minWidth: '170px',
                    maxWidth: '180px',
                    height: '110px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    border: isSelected ? '3px solid #38BDF8' : `2px solid ${theme.border}`,
                    boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.45)' : 'none',
                    opacity: isSelected ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    background: '#0F172A',
                  }}
                >
                  <img
                    src={capture.img}
                    alt={capture.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Number Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      background: isSelected ? '#0284C7' : 'rgba(0,0,0,0.75)',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    #{idx + 1}
                  </div>
                  {/* Title Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      padding: '6px 8px',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {capture.title}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Album Switcher: Previous & Next Album Navigation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}
        >
          {/* Previous Album */}
          {prevAlbum && (
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onSelectAlbum(prevAlbum)}
              style={{
                background: theme.bgAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '8px' }}>
                <ChevronLeft size={16} /> PREVIOUS EVENT ALBUM
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: theme.text, lineHeight: 1.35 }}>
                {prevAlbum.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '10px' }}>
                📍 {prevAlbum.location} • {prevAlbum.category}
              </div>
            </motion.div>
          )}

          {/* Next Album */}
          {nextAlbum && (
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onSelectAlbum(nextAlbum)}
              style={{
                background: theme.bgAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'right',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '8px' }}>
                NEXT EVENT ALBUM <ChevronRight size={16} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: theme.text, lineHeight: 1.35 }}>
                {nextAlbum.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '10px' }}>
                📍 {nextAlbum.location} • {nextAlbum.category}
              </div>
            </motion.div>
          )}
        </div>

        {/* More Albums from Media Vault */}
        {relatedAlbums.length > 0 && (
          <section style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>
                  More Media Vault Albums
                </h2>
                <p style={{ color: theme.textMuted, fontSize: '0.92rem', marginTop: '4px' }}>
                  Explore other national team championships, road races, and ceremonies
                </p>
              </div>

              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  color: 'var(--primary)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Browse all albums →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {relatedAlbums.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -6 }}
                  onClick={() => onSelectAlbum(item)}
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', background: '#0F172A', overflow: 'hidden' }}>
                    <img
                      src={item.img}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.category}
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.76rem', color: theme.textMuted, fontWeight: 600, marginBottom: '6px' }}>
                        📍 {item.location} • 🗓️ {item.date}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: theme.text, lineHeight: 1.35, marginBottom: '8px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: theme.textSub, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${theme.border}`, color: 'var(--primary)', fontSize: '0.84rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Full Album ({item.captures?.length || 1} Photos) <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(2, 6, 23, 0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px 24px',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                zIndex: 10,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      color: '#FFFFFF',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {album.category}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>
                    📍 {album.location} • 🗓️ {album.date}
                  </span>
                </div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  {activeCapture.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FEF08A',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Camera size={14} /> Shot {activeCaptureIndex + 1} of {captures.length}
                </span>

                <button
                  onClick={() => setIsFullscreen(false)}
                  title="Close Fullscreen (Esc)"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Main Image Stage */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '16px 0',
                overflow: 'hidden',
              }}
            >
              {/* Floating Previous Button */}
              {captures.length > 1 && (
                <button
                  onClick={() => setActiveCaptureIndex((prev) => (prev > 0 ? prev - 1 : captures.length - 1))}
                  title="Previous (←)"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={26} />
                </button>
              )}

              {/* Foreground Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={`fullscreen-${activeCapture.id}`}
                  src={activeCapture.img}
                  alt={activeCapture.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    maxWidth: '92vw',
                    maxHeight: '74vh',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8)',
                  }}
                />
              </AnimatePresence>

              {/* Floating Next Button */}
              {captures.length > 1 && (
                <button
                  onClick={() => setActiveCaptureIndex((prev) => (prev + 1) % captures.length)}
                  title="Next (→)"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={26} />
                </button>
              )}
            </div>

            {/* Modal Bottom Caption */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 18px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 10,
              }}
            >
              <div style={{ color: '#E2E8F0', fontSize: '0.9rem', maxWidth: '80%' }}>
                {activeCapture.caption}
              </div>
              {activeCapture.photographer && (
                <div style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 700 }}>
                  📷 {activeCapture.photographer}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
