const fs = require('fs');
let t = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Light theme for header background
t = t.replace(/background: 'rgba\(26, 31, 46, 0\.82\)'/, "background: 'rgba(255, 255, 255, 0.95)'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.1\)'/, "border: '1px solid #E2E8F0'");
t = t.replace(/boxShadow: '0 8px 32px rgba\(0, 0, 0, 0\.25\)'/, "boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'");

// 2. Light theme for header texts
t = t.replace(/color: '#FFFFFF', letterSpacing: '-0\.01em'/, "color: '#0F172A', letterSpacing: '-0.01em'");
t = t.replace(/color: '#FFE082', fontWeight: 700/, "color: '#0EA5E9', fontWeight: 700");

// 3. Light theme for Nav Links
t = t.replace(/background: publicSubPage === link\.page \? 'rgba\(255,255,255,0\.1\)' : 'none'/, "background: publicSubPage === link.page ? '#F1F5F9' : 'none'");
t = t.replace(/color: publicSubPage === link\.page \? '#FFFFFF' : '#94A3B8'/, "color: publicSubPage === link.page ? '#0EA5E9' : '#64748B'");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255,255,255,0\.15\)'/g, "e.currentTarget.style.background = '#E2E8F0'");
t = t.replace(/e\.currentTarget\.style\.color = '#FFFFFF'/g, "e.currentTarget.style.color = '#0EA5E9'");
t = t.replace(/e\.currentTarget\.style\.background = publicSubPage === link\.page \? 'rgba\(255,255,255,0\.1\)' : 'none'/g, "e.currentTarget.style.background = publicSubPage === link.page ? '#F1F5F9' : 'none'");
t = t.replace(/e\.currentTarget\.style\.color = publicSubPage === link\.page \? '#FFFFFF' : '#94A3B8'/g, "e.currentTarget.style.color = publicSubPage === link.page ? '#0EA5E9' : '#64748B'");

// 4. Light theme for Language Switcher
t = t.replace(/background: 'rgba\(255, 255, 255, 0\.08\)'/g, "background: '#F8FAFC'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.15\)'/, "border: '1px solid #CBD5E1'");
t = t.replace(/color: '#FFE082',([\s\S]*?)padding: '7px 11px',/, "color: '#0F172A',$1padding: '7px 11px',");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.15\)'/, "e.currentTarget.style.background = '#E2E8F0'");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.08\)'/, "e.currentTarget.style.background = '#F8FAFC'");

// 5. Light theme for Login Buttons
t = t.replace(/background: 'linear-gradient\(135deg, #0284C7 0%, #0369A1 100%\)'/, "background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'");
t = t.replace(/background: 'rgba\(255, 255, 255, 0\.05\)'/g, "background: '#FFFFFF'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.1\)'/, "border: '1px solid #CBD5E1'");
t = t.replace(/color: '#FFFFFF',\s*border: '1px solid #CBD5E1'/g, "color: '#0F172A',\n                border: '1px solid #CBD5E1'");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.12\)'/, "e.currentTarget.style.background = '#F1F5F9'");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.05\)'/, "e.currentTarget.style.background = '#FFFFFF'");

// 6. Handle Athlete Login UI in Header
// Replace the Right side (Language Switcher + Buttons) with a conditional block if Athlete is logged in
const rightSideRegex = /\{\/\* Right — Switcher \+ Register Athlete \+ Club Portal Login \*\/\}([\s\S]*?)<\/header>/;
const match = t.match(rightSideRegex);
if (match) {
  const originalRightSide = match[1];
  
  const loggedInRightSide = `
          {/* Right Side */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'am' : 'en')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '7px 11px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
            >
              🌐 {language === 'en' ? 'አማርኛ' : 'EN'}
            </button>

            {currentRole === 'ATHLETE' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => { setAthleteSubPage('OVERVIEW'); setPublicSubPage('DASHBOARD'); }}
                  className="btn-accent"
                  style={{
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {language === 'en' ? 'My Dashboard' : 'ዳሽቦርድ'}
                </button>
                <button
                  onClick={() => { localStorage.removeItem('eaf_currentRole'); setCurrentRole('LANDING'); }}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setRegModalRole('ATHLETE')}
                  className="btn-accent"
                  style={{ 
                    fontSize: '0.78rem', padding: '7px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', boxShadow: 'none', color: '#FFF', border: 'none', cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  {language === 'en' ? 'Register as Athlete' : 'አትሌት ይመዝገቡ'}
                </button>

                <button
                  onClick={handleOpenAuthModal}
                  className="btn-gov-secondary"
                  style={{ 
                    fontSize: '0.76rem', padding: '7px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {language === 'en' ? 'Club Portal Login' : 'የክለብ መግቢያ'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
              </>
            )}
          </div>
        </header>`;
        
  t = t.replace(match[0], loggedInRightSide);
}

// 7. Ensure Landing Page is rendered when currentRole === 'LANDING' OR (currentRole === 'ATHLETE' && publicSubPage !== 'DASHBOARD')
t = t.replace(/if \(currentRole === 'LANDING'\) \{/, "if (currentRole === 'LANDING' || (currentRole === 'ATHLETE' && publicSubPage !== 'DASHBOARD')) {");

fs.writeFileSync('src/App.jsx', t);
console.log('App.jsx theme and routing updated.');
