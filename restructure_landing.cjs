const fs = require('fs');

let content = fs.readFileSync('src/components/LandingPage.jsx', 'utf8');

// 1. Update signature
content = content.replace(
  `export default function LandingPage({ onSelectRole, onRegister, language = 'en' }) {`,
  `export default function LandingPage({ onSelectRole, onRegister, language = 'en', publicSubPage = 'HOME', onChangePublicSubPage }) {`
);

// 2. Update Hero Section
content = content.replace(
  /\{\/\* ── 1\. HERO SECTION ── \*\/\}[\s\S]*?<h1 style={{/,
`{/* ── 1. HERO SECTION ── */}
      {publicSubPage === 'HOME' && (
      <section 
        id="home" 
        style={{
          position: 'relative', 
          minHeight: '520px',
          background: 'radial-gradient(circle at 50% 0%, #1E293B, #0F172A 70%)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '100px 24px 80px'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
          <h1 style={{`
);

// Close Hero Section and Wrap Filter
content = content.replace(
  /<\/section>\s*\{\/\* ── 2\. INTEGRATED SEARCH BAR & FILTER WIDGET ── \*\/\}\s*<div style={{ padding: '0 16px', position: 'relative', zIndex: 10 }}>/g,
  `</section>
      )}

      {/* ── 2. INTEGRATED SEARCH BAR & FILTER WIDGET ── */}
      {(publicSubPage === 'HOME' || publicSubPage === 'COMPETITIONS') && (
        <div style={{ padding: '0 16px', position: 'relative', zIndex: 10, marginTop: publicSubPage === 'COMPETITIONS' ? '40px' : 0 }}>`
);

// Close Filter Section
content = content.replace(
  /<\/div>\s*<\/div>\s*\{\/\* ── NEWS TICKER ── \*\/\}/g,
  `</div>
        </div>
      )}

      {/* ── NEWS TICKER ── */}`
);

// We need to re-order the sections. Let's split the file into parts based on section headers.
const getSection = (text, regex) => {
  const match = text.match(regex);
  return match ? match[0] : '';
};

let t = content;
const newsTicker = t.match(/\{\/\* ── NEWS TICKER ── \*\/\}[\s\S]*?(?=\{\/\* ── 3\. LATEST NEWS ── \*\/\})/)[0];
const latestNews = t.match(/\{\/\* ── 3\. LATEST NEWS ── \*\/\}[\s\S]*?(?=\{\/\* ── 4\. COMPETITIONS HUB ── \*\/\})/)[0];
const compsHub = t.match(/\{\/\* ── 4\. COMPETITIONS HUB ── \*\/\}[\s\S]*?(?=\{\/\* ── 5\. ATHLETE SPOTLIGHT ── \*\/\})/)[0];
const athleteSpot = t.match(/\{\/\* ── 5\. ATHLETE SPOTLIGHT ── \*\/\}[\s\S]*?(?=\{\/\* ── 6\. ABOUT ── \*\/\})/)[0];

// We will construct the new body order
let newBody = 
  compsHub.replace(/<section id="competitions"/, '{/* ── 4. COMPETITIONS HUB ── */}\n      {(publicSubPage === "HOME" || publicSubPage === "COMPETITIONS") && (\n      <section id="competitions"').replace(/<\/section>\s*$/, '</section>\n      )}\n') +
  newsTicker.replace(/\{\/\* ── NEWS TICKER ── \*\/\}/, '{/* ── NEWS TICKER ── */}\n      {publicSubPage === "HOME" && (\n      <>').replace(/<\/div>\s*$/, '</div>\n      </>\n      )}\n') +
  latestNews.replace(/<section id="news"/, '{/* ── 3. LATEST NEWS ── */}\n      {publicSubPage === "HOME" && (\n      <section id="news"').replace(/<\/section>\s*$/, '</section>\n      )}\n') +
  athleteSpot.replace(/<section id="athletes"/, '{/* ── 5. ATHLETE SPOTLIGHT ── */}\n      {(publicSubPage === "HOME" || publicSubPage === "ATHLETES") && (\n      <section id="athletes"').replace(/<\/section>\s*$/, '</section>\n      )}\n');

// Also need to add "View More" CTA inside the sections.
// For Competitions:
newBody = newBody.replace(
  /(\s*)(<\/div>\s*<\/section>\s*)}\s*$/,
  `$1  {publicSubPage === 'HOME' && (
$1    <div style={{ marginTop: '40px', textAlign: 'center' }}>
$1      <button className="btn-gov-secondary" style={{ padding: '12px 32px' }} onClick={() => onChangePublicSubPage('COMPETITIONS')}>
$1        View More Competitions →
$1      </button>
$1    </div>
$1  )}
$2`
);

// For Athletes:
newBody = newBody.replace(
  /(\s*)(<\/div>\s*<\/section>\s*)}\s*$/,
  `$1  {publicSubPage === 'HOME' && (
$1    <div style={{ marginTop: '40px', textAlign: 'center' }}>
$1      <button className="btn-gov-secondary" style={{ padding: '12px 32px' }} onClick={() => onChangePublicSubPage('ATHLETES')}>
$1        View More Athletes →
$1      </button>
$1    </div>
$1  )}
$2`
);

// Limit items on HOME view
// In compsHub, find `sortedMeets.map` and replace with `(publicSubPage === 'HOME' ? sortedMeets.slice(0, 3) : sortedMeets).map`
newBody = newBody.replace(/\{sortedMeets\.map/g, '{(publicSubPage === "HOME" ? sortedMeets.slice(0, 3) : sortedMeets).map');
newBody = newBody.replace(/\{ATHLETES\.map/g, '{(publicSubPage === "HOME" ? ATHLETES.slice(0, 4) : ATHLETES).map');

// Modernize Athlete cards
// Background of athlete card was a dark overlay, let's just make sure they look great. The prompt mentioned "modern card layouts featuring sleek hover interactions, athlete stats, and record badges".
// The existing card is actually decent, but let's tweak the hover state if needed.

// Replace everything from NEWS TICKER down to ATHLETE SPOTLIGHT
t = t.replace(/\{\/\* ── NEWS TICKER ── \*\/\}[\s\S]*?(?=\{\/\* ── 6\. ABOUT ── \*\/\})/, newBody);

// Wrap remaining sections (About, Structure, Partners) in {publicSubPage === 'HOME' && (...)}
t = t.replace(/\{\/\* ── 6\. ABOUT ── \*\/\}[\s\S]*?(?=<\/div>\s*\);\s*}\s*$)/, match => {
  return `{publicSubPage === 'HOME' && (\n<>\n${match}\n</>\n)}\n`;
});

// Add MEDIA page placeholder
t = t.replace(/(<\/div>\s*\);\s*}\s*$)/, 
`      {publicSubPage === 'MEDIA' && (
        <section style={{ padding: '100px 24px', textAlign: 'center', minHeight: '60vh' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0B2030' }}>Media & Gallery</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Photo and video galleries coming soon.</p>
        </section>
      )}
$1`
);

fs.writeFileSync('src/components/LandingPage.jsx', t);
console.log('Restructured LandingPage.jsx successfully!');
