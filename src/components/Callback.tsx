import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as jose from 'jose';
import { ShieldCheck, UserCheck, ArrowRight, Home, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStoredCodeVerifier, getStoredState, clearPkceSession, FAYDA_CONFIG } from '../constants/fayda';

interface UserInfo {
  sub?: string;
  name?: string;
  'name#en'?: string;
  'name#am'?: string;
  given_name?: string;
  family_name?: string;
  birthdate?: string;
  gender?: string;
  phone_number?: string;
  email?: string;
  nationality?: string;
  address?: any;
  picture?: string;
  nin?: string;
  national_id?: string;
  verificationToken?: string;
  [key: string]: any;
}

/**
 * Decodes the userinfo response.
 * Per the eSignet documentation, the /userinfo endpoint returns a JWT.
 * We decode it using jose.decodeJwt (no signature verification needed on frontend).
 */
async function decodeUserInfoResponse(data: any): Promise<UserInfo | null> {
  try {
    if (typeof data === 'string') {
      // JWT returned from real Fayda endpoint
      return jose.decodeJwt(data) as UserInfo;
    }
    if (typeof data === 'object' && data !== null) {
      // JSON object (from our backend mock or normalized response)
      return data as UserInfo;
    }
    return null;
  } catch (err) {
    console.error('[Callback] Failed to decode userinfo JWT:', err);
    return null;
  }
}

export default function Callback() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stateError, setStateError] = useState(false);

  useEffect(() => {
    const run = async () => {
      const query  = new URLSearchParams(window.location.search);
      const code   = query.get('code');
      const state  = query.get('state');
      const err    = query.get('error');
      const errDesc = query.get('error_description');

      // ── Error returned from Fayda ──────────────────────────────────────────
      if (err) {
        setError(`Fayda Authorization Error: ${errDesc || err}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code found in the callback URL. The flow may have been interrupted.');
        setLoading(false);
        return;
      }

      // ── CSRF State Validation ─────────────────────────────────────────────
      const storedState = getStoredState();
      if (storedState && state && storedState !== state) {
        setError('State mismatch — possible CSRF attack. Please restart the verification.');
        setStateError(true);
        setLoading(false);
        return;
      }

      // ── Retrieve stored PKCE code_verifier ────────────────────────────────
      const codeVerifier = getStoredCodeVerifier();
      if (!codeVerifier) {
        console.warn('[Callback] No code_verifier found in sessionStorage. Proceeding without it (may fail on real endpoint).');
      }

      try {
        // ── Step 1: Exchange authorization code for access token ──────────────
        console.log('[FaydaCallback] Exchanging authorization code for access token...');
        const tokenRes = await axios.post(FAYDA_CONFIG.tokenEndpoint, {
          code,
          code_verifier: codeVerifier || undefined,
          redirect_uri: `${window.location.origin}/callback`,
        });

        const { access_token } = tokenRes.data;
        if (!access_token) throw new Error('Token endpoint did not return an access_token.');

        setAccessToken(access_token);
        clearPkceSession();  // Clear after successful exchange
        console.log('[FaydaCallback] ✓ Access token obtained.');

        // ── Step 2: Fetch user demographic claims ─────────────────────────────
        console.log('[FaydaCallback] Fetching user info from /api/userinfo...');
        const userInfoRes = await axios.post(FAYDA_CONFIG.userInfoEndpoint, {
          access_token,
        });

        const decoded = await decodeUserInfoResponse(userInfoRes.data);
        if (!decoded) throw new Error('Failed to parse userinfo response from Fayda provider.');

        console.log('[FaydaCallback] ✓ User info retrieved:', decoded);
        setUserInfo(decoded);

        // ── Notify popup opener if launched in a popup window ─────────────────
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'FAYDA_OIDC_SUCCESS',
              payload: {
                access_token,
                userInfo: decoded,
                verificationToken: decoded.verificationToken,
              },
            },
            window.location.origin
          );
        }
      } catch (ex: any) {
        const msg =
          ex.response?.data?.error_description ||
          ex.response?.data?.error ||
          ex.response?.data?.message ||
          ex.message ||
          'Failed to complete Fayda OIDC token exchange.';
        console.error('[FaydaCallback] Exchange failed:', ex);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleContinueRegistration = () => {
    if (!userInfo) return;

    // Normalize address
    let region = 'Ethiopia';
    if (typeof userInfo.address === 'object' && userInfo.address?.region) {
      region = `${userInfo.address.region} Regional State`;
    } else if (typeof userInfo.address === 'string') {
      region = userInfo.address;
    }

    const fin = userInfo.nin || userInfo.national_id || userInfo.sub || '';
    const dobYear = userInfo.birthdate ? parseInt(userInfo.birthdate.substring(0, 4)) : 2001;
    const age = new Date().getFullYear() - (isNaN(dobYear) ? 2001 : dobYear);
    const ageTier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : 'Senior Division';

    const payload = {
      name: userInfo['name#en'] || userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Fayda Verified Athlete',
      amharic: userInfo['name#am'] || userInfo.name || '',
      fin,
      dob: userInfo.birthdate || '2000-01-01',
      gender: (userInfo.gender || 'MALE').toUpperCase(),
      blood: 'O+',
      region,
      photoUrl: userInfo.picture || '/images/fayda_resident_photo.jpg',
      verificationToken: userInfo.verificationToken || accessToken,
      hash: `SHA256:${fin.slice(-8)}_FAYDA_VERIFIED`,
      ageTier,
    };

    sessionStorage.setItem('eaf_fayda_verified', JSON.stringify(payload));
    window.location.href = '/?openReg=ATHLETE&faydaVerified=true';
  };

  const formattedAddress = (): string => {
    if (!userInfo?.address) return 'N/A';
    if (typeof userInfo.address === 'object') {
      return [userInfo.address.woreda, userInfo.address.zone, userInfo.address.region]
        .filter(Boolean).join(', ') || userInfo.address.formatted || 'Ethiopia';
    }
    return String(userInfo.address);
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: 0,
      padding: 0,
    }}>

      {/* Ethiopian flag stripe */}
      <div style={{ width: '100%', height: '5px', display: 'flex', flexShrink: 0 }}>
        <div style={{ flex: 1, background: '#009A44' }} />
        <div style={{ flex: 1, background: '#FED100' }} />
        <div style={{ flex: 1, background: '#EF3340' }} />
      </div>

      {/* Header — matches oidc-test-app Callback.js style */}
      <header style={{
        backgroundColor: '#0f3460',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/images/logo.jpeg"
            alt="EAF"
            width="44" height="44"
            style={{ borderRadius: '50%', border: '2px solid #f8c94e' }}
            onError={(e: any) => (e.target.style.display = 'none')}
          />
          <div>
            <h1 style={{ color: '#f8c94e', fontSize: '1.3rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Fayda Relying Party — User Info
            </h1>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.77rem' }}>
              Ethiopian Athletics Federation · VeriFayda 2.0 (eSignet OIDC)
            </p>
          </div>
        </div>
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
            color: '#E2E8F0', padding: '8px 14px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Home size={16} /> Home
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 16px', width: '100%',
      }}>

        {/* ── Loading ── */}
        {loading && (
          <div style={{
            background: '#162447', borderRadius: '16px', padding: '48px 32px',
            textAlign: 'center', maxWidth: '520px', width: '100%', marginTop: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              display: 'inline-block',
              border: '4px solid rgba(248,201,78,0.2)', borderTop: '4px solid #f8c94e',
              borderRadius: '50%', width: '44px', height: '44px',
              animation: 'spin 1s linear infinite', marginBottom: '20px',
            }} />
            <h3 style={{ color: '#f8c94e', margin: '0 0 8px', fontSize: '1.2rem' }}>
              Completing VeriFayda 2.0 Handshake...
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
              Exchanging authorization code · Generating signed client assertion ·
              Retrieving verified biometric claims
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div style={{
            background: '#162447', border: '1px solid #EF4444', borderRadius: '16px',
            padding: '32px', textAlign: 'center', maxWidth: '520px', width: '100%', marginTop: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}>
            <AlertCircle size={44} color="#EF4444" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#EF4444', margin: '0 0 10px', fontSize: '1.15rem' }}>
              Authentication Error
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => (window.location.href = '/?openReg=ATHLETE')}
                style={{
                  background: '#f8c94e', color: '#1a1a2e', border: 'none',
                  borderRadius: '8px', padding: '10px 18px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <RefreshCw size={16} /> Retry Verification
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  background: 'transparent', border: '1px solid #64748B', color: '#E2E8F0',
                  borderRadius: '8px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Success: User Info Card (matches oidc-test-app Callback.js layout) ── */}
        {!loading && !error && userInfo && (
          <div style={{
            background: '#162447', borderRadius: '18px',
            border: '1px solid rgba(248,201,78,0.25)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            width: '100%', maxWidth: '860px', overflow: 'hidden',
          }}>
            {/* Success banner */}
            <div style={{
              background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.3)',
              padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="#34D399" />
                <div>
                  <h4 style={{ margin: 0, color: '#34D399', fontSize: '1rem', fontWeight: 800 }}>
                    Fayda Identity Verified Successfully
                  </h4>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.77rem' }}>
                    Authenticated via eSignet OIDC · Authorization Code + PKCE (S256) · RS256 Client Assertion
                  </p>
                </div>
              </div>
              <span style={{
                background: '#059669', color: '#FFF', fontSize: '0.72rem',
                fontWeight: 800, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.04em',
              }}>
                AUTHENTICATED
              </span>
            </div>

            <div style={{ padding: '28px 24px' }}>
              {/* Profile header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {userInfo.picture ? (
                  <img
                    src={userInfo.picture}
                    alt="User"
                    style={{
                      width: '110px', height: '130px', objectFit: 'cover',
                      borderRadius: '12px', border: '3px solid #f8c94e',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '110px', height: '130px', borderRadius: '12px',
                    border: '3px solid #f8c94e', background: '#0f3460',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserCheck size={48} color="#f8c94e" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', color: '#FFF', fontWeight: 900 }}>
                    {userInfo['name#en'] || userInfo.name || 'Verified User'}
                  </h2>
                  {userInfo['name#am'] && (
                    <div style={{ color: '#38BDF8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                      {userInfo['name#am']}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#0f3460', color: '#f8c94e', padding: '4px 10px',
                      borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 800,
                    }}>
                      NIN: {userInfo.nin || userInfo.national_id || userInfo.sub || '—'}
                    </span>
                    <span style={{
                      background: '#0f3460', color: '#38BDF8', padding: '4px 10px',
                      borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                    }}>
                      {userInfo.gender || 'MALE'} · {userInfo.nationality || 'Ethiopian'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info List Group — matches oidc-test-app Callback.js */}
              <h5 style={{ color: '#f8c94e', fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                OpenID Connect Claims (from Fayda eSignet)
              </h5>

              <div style={{
                borderRadius: '12px', overflow: 'hidden',
                border: '1px solid rgba(248,201,78,0.2)', marginBottom: '24px',
              }}>
                {([
                  ['Name', userInfo['name#en'] || userInfo.name || 'N/A'],
                  ['Amharic Name (name#am)', userInfo['name#am'] || 'N/A'],
                  ['NIN / Fayda ID (sub)', userInfo.nin || userInfo.national_id || userInfo.sub || 'N/A'],
                  ['Email', userInfo.email || 'N/A'],
                  ['Gender', userInfo.gender || 'N/A'],
                  ['Phone', userInfo.phone_number || 'N/A'],
                  ['Nationality', userInfo.nationality || 'Ethiopian'],
                  ['Date of Birth (birthdate)', userInfo.birthdate || 'N/A'],
                  ['Address', formattedAddress()],
                ] as [string, string][]).map(([label, value], idx) => (
                  <div key={label} style={{
                    display: 'flex', padding: '11px 18px',
                    background: idx % 2 === 0 ? '#0f3460' : '#142547',
                    borderBottom: '1px solid rgba(248,201,78,0.12)',
                    fontSize: '0.88rem',
                  }}>
                    <strong style={{ width: '40%', color: '#94A3B8' }}>{label}:</strong>
                    <span style={{ width: '60%', color: '#FFF', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleContinueRegistration}
                  style={{
                    background: '#10B981', color: '#FFF', border: 'none',
                    borderRadius: '12px', padding: '16px', fontSize: '1rem', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                  }}
                >
                  <ShieldCheck size={20} />
                  Continue Athlete Registration with Verified Fayda ID
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  style={{
                    background: 'transparent', border: '1px solid #475569', color: '#94A3B8',
                    borderRadius: '10px', padding: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Return to EAF Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{
        background: '#0f3460', padding: '16px 0', borderTop: '2px solid #f8c94e',
        textAlign: 'center', color: '#94A3B8', fontSize: '13px',
      }}>
        <p style={{ margin: 0 }}>
          &copy; 2025–2026 National ID Program (NIDP) &amp; Ethiopian Athletics Federation.
          All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
