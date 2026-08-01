const fs = require('fs');
let t = fs.readFileSync('src/components/LandingPage.jsx', 'utf8');

// 1. Add useEffect to imports
t = t.replace(
  "import React, { useState, useRef } from 'react';",
  "import React, { useState, useRef, useEffect } from 'react';"
);

// 2. Add athleteScrollRef and auto-scroll effect after bannerScrollRef
t = t.replace(
  "  const bannerScrollRef = useRef(null);",
  `  const bannerScrollRef = useRef(null);
  const athleteScrollRef = useRef(null);

  // Auto-scroll athlete cards
  useEffect(() => {
    const el = athleteScrollRef.current;
    if (!el) return;
    let frame;
    let paused = false;
    let speed = 0.8;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    const step = () => {
      if (!paused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);`
);

// 3. Replace athlete cards grid with duplicated auto-scroll strip
t = t.replace(
  `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {(publicSubPage === "HOME" ? ATHLETES.slice(0, 4) : ATHLETES).map(athlete => (`,
  `<div 
              ref={athleteScrollRef}
              style={{ display: 'flex', gap: '24px', overflowX: 'hidden', paddingBottom: '8px', cursor: 'grab' }}
            >
              {[...ATHLETES, ...ATHLETES, ...ATHLETES].map((athlete, idx) => (`
);

// 4. Fix the closing of the map — change key from athlete.id to idx and close differently  
t = t.replace(
  `              ))}\n            </div>\n          </div>\n        </section>\n      )}\n\n      {/* ── 4. FEATURED ATHLETES SPOTLIGHT`,
  `              ))}\n            </div>\n          </div>\n        </section>\n      )}\n\n      {/* ── 4. FEATURED ATHLETES SPOTLIGHT`
);

// Fix the athlete card minWidth since it's now in a flex scroll
t = t.replace(
  `                  position: 'relative', \n                  minHeight: 400,\n                  borderRadius: 24,`,
  `                  position: 'relative', \n                  minWidth: '300px',\n                  width: '300px',\n                  flexShrink: 0,\n                  minHeight: 420,\n                  borderRadius: 24,`
);

fs.writeFileSync('src/components/LandingPage.jsx', t);
console.log('LandingPage.jsx auto-scroll updated!');
