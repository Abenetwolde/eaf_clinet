const fs = require('fs');
let t = fs.readFileSync('src/components/LandingPage.jsx', 'utf8');

// 1. Hero Background
t = t.replace(/background: 'radial-gradient\(circle at 50% 0%, #1E293B, #0F172A 70%\)'/, "background: 'radial-gradient(circle at 50% 0%, #F8FAFC, #E2E8F0 70%)'");
// 2. Hero Text Colors
t = t.replace(/color: '#FFFFFF',([\s\S]*?)fontSize: 'clamp\(2rem, 5\.5vw, 3\.8rem\)',/, "color: '#0F172A',$1fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',");
t = t.replace(/color: '#E2E8F0',([\s\S]*?)fontSize: 'clamp\(0\.95rem, 2vw, 1\.15rem\)',/, "color: '#475569',$1fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',");

// 3. Hero Buttons
// Primary Button
t = t.replace(/background: 'linear-gradient\(135deg, #0284C7 0%, #0369A1 100%\)'/, "background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'");
// Secondary Button
t = t.replace(/background: 'rgba\(255, 255, 255, 0\.1\)'/, "background: '#FFFFFF'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.25\)'/, "border: '1px solid #CBD5E1'");
t = t.replace(/color: '#FFFFFF',([\s\S]*?)fontWeight: 700,\s*fontSize: '0\.95rem',([\s\S]*?)padding: '14px 28px',/, "color: '#0F172A',$1fontWeight: 700,\n                fontSize: '0.95rem',$2padding: '14px 28px',");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.2\)'/, "e.currentTarget.style.background = '#F1F5F9'");
t = t.replace(/e\.currentTarget\.style\.background = 'rgba\(255, 255, 255, 0\.1\)'/, "e.currentTarget.style.background = '#FFFFFF'");

// 4. Filter Widget Background & Text
t = t.replace(/background: 'rgba\(30, 41, 59, 0\.85\)'/, "background: 'rgba(255, 255, 255, 0.95)'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.1\)'/, "border: '1px solid #E2E8F0'");
t = t.replace(/boxShadow: '0 24px 48px rgba\(0,0,0,0\.3\)'/, "boxShadow: '0 24px 48px rgba(0,0,0,0.08)'");
t = t.replace(/color: '#FFFFFF',/, "color: '#0F172A',");

// Search Input
t = t.replace(/background: 'rgba\(255, 255, 255, 0\.08\)'/, "background: '#F1F5F9'");
t = t.replace(/border: '1px solid rgba\(255, 255, 255, 0\.15\)'/, "border: '1px solid #CBD5E1'");
t = t.replace(/color: '#FFFFFF',([\s\S]*?)fontSize: '0\.98rem',/, "color: '#0F172A',$1fontSize: '0.98rem',");
t = t.replace(/onBlur={e => e\.target\.style\.borderColor = 'rgba\(255, 255, 255, 0\.15\)'}/, "onBlur={e => e.target.style.borderColor = '#CBD5E1'}");

// Filter Labels & Selects
t = t.replace(/color: '#E2E8F0'/g, "color: '#475569'");
t = t.replace(/background: 'rgba\(15, 23, 42, 0\.6\)'/g, "background: '#F8FAFC'");
t = t.replace(/border: '1px solid rgba\(255,255,255,0\.1\)'/g, "border: '1px solid #CBD5E1'");
t = t.replace(/color: '#FFFFFF'/g, "color: '#0F172A'");

fs.writeFileSync('src/components/LandingPage.jsx', t);
console.log('LandingPage theme updated.');
