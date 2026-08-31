import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Share2, Calendar, Clock, MapPin,
  Check, Award, Eye, Image, ArrowRight, Bookmark, Printer, Sparkles, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';
import type { NewsItem } from './LandingPage';
import { useGetNewsByIdQuery } from '../store/api/newsApi';

interface NewsDetailProps {
  news: NewsItem;
  allNews: NewsItem[];
  onBack: () => void;
  onSelectNews: (item: NewsItem) => void;
  onRegister?: (role: 'CLUB' | 'ATHLETE') => void;
  currentRole?: string;
  currentAthlete?: any;
  darkMode?: boolean;
}

const TAG_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Championship: { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284C7', border: 'rgba(2, 132, 199, 0.3)' },
  CHAMPIONSHIP: { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284C7', border: 'rgba(2, 132, 199, 0.3)' },
  Marathon: { bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  MARATHON: { bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  'Road Race': { bg: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: 'rgba(22, 163, 74, 0.3)' },
  ROAD_RACE: { bg: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: 'rgba(22, 163, 74, 0.3)' },
  Training: { bg: 'rgba(147, 51, 234, 0.12)', color: '#9333EA', border: 'rgba(147, 51, 234, 0.3)' },
  TRAINING: { bg: 'rgba(147, 51, 234, 0.12)', color: '#9333EA', border: 'rgba(147, 51, 234, 0.3)' },
  'National Team': { bg: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', border: 'rgba(220, 38, 38, 0.3)' },
  NATIONAL_TEAM: { bg: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', border: 'rgba(220, 38, 38, 0.3)' },
  RECOGNITION: { bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  ANNOUNCEMENT: { bg: 'rgba(67, 56, 202, 0.12)', color: '#4338CA', border: 'rgba(67, 56, 202, 0.3)' },
  COMMUNITY: { bg: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: 'rgba(22, 163, 74, 0.3)' },
  GENERAL: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748B', border: 'rgba(100, 116, 139, 0.3)' },
};

export default function NewsDetail({
  news,
  allNews,
  onBack,
  onSelectNews,
  onRegister,
  darkMode = false,
}: NewsDetailProps) {
  const { t: tr } = useI18n();
  const [copied, setCopied] = useState(false);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Fetch full article detail if it's a backend string ID
  const isBackendId = typeof news.id === 'string';
  const { data: apiDetail } = useGetNewsByIdQuery(news.id.toString(), {
    skip: !isBackendId,
  });

  const displayTitle = apiDetail?.title || news.title;
  const displaySummary = apiDetail?.shortDescription || news.summary;
  const displayAuthor = apiDetail?.author || news.author;
  const displayParagraphs = apiDetail?.content
    ? apiDetail.content.split('\n\n').filter(Boolean)
    : news.paragraphs;
  const displayImg = apiDetail?.imageUrl || news.img;
  const displayGallery = apiDetail?.insideImages && apiDetail.insideImages.length > 0
    ? apiDetail.insideImages
    : news.gallery;

  // Scroll to top when article loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [news.id]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for gallery & escape to back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeGalleryImg) {
          setActiveGalleryImg(null);
        } else {
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryImg, onBack]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#news-${news.id}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find previous & next stories
  const currentIndex = allNews.findIndex((n) => n.id === news.id);
  const prevStory = currentIndex > 0 ? allNews[currentIndex - 1] : allNews[allNews.length - 1];
  const nextStory = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : allNews[0];

  // Related news (excluding current story)
  const relatedNews = allNews.filter((item) => item.id !== news.id).slice(0, 3);

  const tc = TAG_COLORS[news.tag] || { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284C7', border: 'rgba(2, 132, 199, 0.3)' };

  // Theme tokens
  const theme = {
    bg: darkMode ? '#090D16' : '#FFFFFF',
    bgAlt: darkMode ? '#0F1524' : '#F8FAFC',
    surface: darkMode ? '#131B2E' : '#FFFFFF',
    surfaceRaised: darkMode ? '#1E294B' : '#F1F5F9',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    textSub: darkMode ? '#CBD5E1' : '#334155',
    textMuted: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    borderSubtle: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#CBD5E1',
    headerBg: darkMode ? 'rgba(9, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background 0.3s, color 0.3s' }}>
      {/* Top Reading Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3px',
          width: `${readingProgress}%`,
          background: 'linear-gradient(90deg, var(--primary) 0%, #38BDF8 50%, #F59E0B 100%)',
          zIndex: 9999,
          transition: 'width 0.1s linear',
        }}
      />

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
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Back to news button & breadcrumbs */}
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
              {tr('newsDetail.back') || 'Back to News'}
            </motion.button>

            {/* Breadcrumb path */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: theme.textMuted, fontWeight: 600 }}>
              <span onClick={onBack} style={{ cursor: 'pointer' }}>Home</span>
              <span>/</span>
              <span onClick={onBack} style={{ cursor: 'pointer' }}>News</span>
              <span>/</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {news.tag}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              title="Share article link"
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

            {/* Bookmark button */}
            <button
              onClick={() => setBookmarked((prev) => !prev)}
              title="Bookmark article"
              style={{
                background: bookmarked ? 'rgba(245, 158, 11, 0.15)' : darkMode ? '#1A223B' : '#F1F5F9',
                color: bookmarked ? '#F59E0B' : theme.textMuted,
                border: bookmarked ? '1px solid #F59E0B' : `1px solid ${theme.border}`,
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Bookmark size={17} fill={bookmarked ? '#F59E0B' : 'none'} />
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              title="Print article"
              style={{
                background: darkMode ? '#1A223B' : '#F1F5F9',
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Printer size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Article Meta Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '32px' }}
        >
          {/* Badges & Meta Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span
              style={{
                background: tc.bg,
                color: tc.color,
                border: `1px solid ${tc.border}`,
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {news.tag}
            </span>

            <span
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                color: theme.textMuted,
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={14} /> {news.readTime || '4 min read'}
            </span>

            <span
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                color: theme.textMuted,
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MapPin size={14} /> {news.location}
            </span>

            <span
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                color: theme.textMuted,
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={14} /> {news.date}
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              color: theme.text,
              marginBottom: '16px',
            }}
          >
            {displayTitle}
          </h1>

          {/* Amharic Title Subheading */}
          {news.amharicTitle && (
            <div
              style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                fontWeight: 800,
                color: 'var(--primary)',
                lineHeight: 1.4,
                marginBottom: '24px',
              }}
            >
              {news.amharicTitle}
            </div>
          )}

          {/* Author & Press Card Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px 20px',
              borderRadius: '16px',
              background: theme.bgAlt,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(1, 64, 167, 0.25)',
                }}
              >
                🇪🇹
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: theme.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {displayAuthor || 'EAF Media Unit'}
                  <ShieldCheck size={16} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '0.78rem', color: theme.textMuted, fontWeight: 600 }}>
                  Official Ethiopian Athletics Federation Press Dispatch
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: '#16A34A',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ✓ Official Press Release
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '40px',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${theme.border}`,
            background: '#0F172A',
          }}
        >
          <img
            src={displayImg}
            alt={displayTitle}
            style={{
              width: '100%',
              maxHeight: '520px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 40%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <span>📸 Ethiopian Athletics Federation Press Photography</span>
            <span style={{ color: '#94A3B8' }}>📍 {news.location}</span>
          </div>
        </motion.div>

        {/* Article Grid Layout: Main Story Body + Side Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '48px' }}>
          {/* Article Main Body */}
          <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
            {/* Lead Summary Callout */}
            {displaySummary && (
              <div
                style={{
                  background: darkMode ? 'rgba(2, 132, 199, 0.12)' : '#F0F9FF',
                  borderLeft: '5px solid var(--primary)',
                  padding: '24px 28px',
                  borderRadius: '0 20px 20px 0',
                  fontSize: '1.15rem',
                  lineHeight: 1.75,
                  fontWeight: 600,
                  color: darkMode ? '#BAE6FD' : '#0369A1',
                  marginBottom: '36px',
                  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)',
                }}
              >
                {displaySummary}
              </div>
            )}

            {/* Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
              {displayParagraphs && displayParagraphs.length > 0 ? (
                displayParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: '1.1rem',
                      lineHeight: 1.9,
                      color: theme.textSub,
                      fontWeight: 450,
                      margin: 0,
                    }}
                  >
                    {idx === 0 ? (
                      <>
                        <span
                          style={{
                            float: 'left',
                            fontSize: '3.4rem',
                            lineHeight: 0.85,
                            fontWeight: 900,
                            color: 'var(--primary)',
                            paddingRight: '12px',
                            paddingTop: '4px',
                            fontFamily: 'serif',
                          }}
                        >
                          {paragraph.charAt(0)}
                        </span>
                        {paragraph.slice(1)}
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: '1.1rem', lineHeight: 1.9, color: theme.textSub }}>{displaySummary}</p>
              )}
            </div>

            {/* Featured Quote Callout */}
            {news.quote && (
              <div
                style={{
                  position: 'relative',
                  background: darkMode ? '#131B2E' : '#F8FAFC',
                  border: `1px solid ${theme.border}`,
                  borderTop: '4px solid #F59E0B',
                  borderRadius: '20px',
                  padding: '32px 36px',
                  marginBottom: '40px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '3rem', lineHeight: 0.5, color: '#F59E0B', fontFamily: 'serif', marginBottom: '16px', opacity: 0.8 }}>“</div>
                <p style={{ fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 600, color: theme.text, lineHeight: 1.7, margin: '0 0 16px' }}>
                  {news.quote.text}
                </p>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
                  — {news.quote.author}
                </div>
              </div>
            )}

            {/* Key Statistics / Highlights */}
            {news.stats && news.stats.length > 0 && (
              <div style={{ marginBottom: '44px' }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: theme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Award size={20} color="var(--primary)" />
                  Championship Metrics &amp; Key Highlights
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {news.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: theme.bgAlt,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 900,
                          color: 'var(--primary)',
                          lineHeight: 1.2,
                          marginBottom: '6px',
                        }}
                      >
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Press Photo Gallery from the Event */}
            {displayGallery && displayGallery.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: theme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Image size={20} color="var(--primary)" />
                  Event Press Photos &amp; Media Moments
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {displayGallery.map((imgSrc, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setActiveGalleryImg(imgSrc)}
                      style={{
                        position: 'relative',
                        height: '180px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={`Event gallery ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        className="gallery-hover-overlay"
                      >
                        <span
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            color: '#0F172A',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={14} /> View Photo
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Press Verification Stamp */}
            <div
              style={{
                borderTop: `2px dashed ${theme.border}`,
                paddingTop: '28px',
                marginBottom: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/images/logo.jpeg"
                  alt="EAF Official"
                  style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.92rem', color: theme.text }}>
                    Ethiopian Athletics Federation (EAF)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme.textMuted }}>
                    Official Media &amp; Communications Directorate
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleShare}
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 18px rgba(1, 64, 167, 0.25)',
                }}
              >
                <Share2 size={16} /> Share This Story
              </motion.button>
            </div>

            {/* Story Navigation: Previous & Next Story Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '56px',
              }}
            >
              {/* Previous Story */}
              {prevStory && (
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectNews(prevStory)}
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
                    <ChevronLeft size={16} /> PREVIOUS STORY
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: theme.text, lineHeight: 1.35 }}>
                    {prevStory.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '10px' }}>
                    {prevStory.date} • {prevStory.tag}
                  </div>
                </motion.div>
              )}

              {/* Next Story */}
              {nextStory && (
                <motion.div
                  whileHover={{ y: -4 }}
                  onClick={() => onSelectNews(nextStory)}
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
                    NEXT STORY <ChevronRight size={16} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: theme.text, lineHeight: 1.35 }}>
                    {nextStory.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '10px' }}>
                    {nextStory.date} • {nextStory.tag}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <section style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '48px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.text }}>
                  {tr('newsDetail.related') || 'Related Federation News'}
                </h2>
                <p style={{ color: theme.textMuted, fontSize: '0.92rem', marginTop: '4px' }}>
                  {tr('newsDetail.relatedSub') || 'Continue reading the latest from the Ethiopian Athletics Federation'}
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
                {tr('newsDetail.browseAll') || 'Browse all news'} →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {relatedNews.map((item) => {
                const itemTc = TAG_COLORS[item.tag] || { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284C7' };
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -6 }}
                    onClick={() => onSelectNews(item)}
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
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: itemTc.bg,
                          color: itemTc.color,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.tag}
                      </div>
                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.76rem', color: theme.textMuted, fontWeight: 600, marginBottom: '6px' }}>
                          🗓️ {item.date} • ⏱️ {item.readTime || '3 min'}
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: theme.text, lineHeight: 1.35, marginBottom: '8px' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: theme.textSub, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.summary}
                        </p>
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${theme.border}`, color: 'var(--primary)', fontSize: '0.84rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Read Full Story <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Embedded Lightbox Modal for Gallery Images */}
      <AnimatePresence>
        {activeGalleryImg && (
          <div
            onClick={() => setActiveGalleryImg(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(3, 7, 18, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '900px',
                maxHeight: '90vh',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                background: '#0F172A',
              }}
            >
              <img
                src={activeGalleryImg}
                alt="Enlarged view"
                style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
              />
              <button
                onClick={() => setActiveGalleryImg(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
