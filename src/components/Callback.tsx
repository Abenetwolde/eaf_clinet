import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as jose from 'jose';
import {
  ShieldCheck, UserCheck, ArrowRight, Home, RefreshCw, AlertCircle,
  CheckCircle2, Phone, Mail, MapPin, Hash, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
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

export function formatFin(val: string): string {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 12) {
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  if (clean.length === 16) {
    return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
  return clean.match(/.{1,4}/g)?.join(' ') || val;
}

async function decodeUserInfoResponse(data: any): Promise<UserInfo | null> {
  try {
    if (typeof data === 'string') {
      return jose.decodeJwt(data) as UserInfo;
    }
    if (typeof data === 'object' && data !== null) {
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

  useEffect(() => {
    const run = async () => {
      const query   = new URLSearchParams(window.location.search);
      const code    = query.get('code');
      const state   = query.get('state');
      const err     = query.get('error');
      const errDesc = query.get('error_description');

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

      const storedState = getStoredState();
      if (storedState && state && storedState !== state) {
        setError('State mismatch — security check failed. Please restart the verification.');
        setLoading(false);
        return;
      }

      const codeVerifier = getStoredCodeVerifier();

      try {
        const tokenRes = await axios.post(FAYDA_CONFIG.tokenEndpoint, {
          code,
          code_verifier: codeVerifier || undefined,
          redirect_uri: `${window.location.origin}/callback`,
        });

        const { access_token } = tokenRes.data;
        if (!access_token) throw new Error('Token endpoint did not return an access token.');

        setAccessToken(access_token);
        clearPkceSession();

        const userInfoRes = await axios.post(FAYDA_CONFIG.userInfoEndpoint, {
          access_token,
        });

        const decoded = await decodeUserInfoResponse(userInfoRes.data);
        if (!decoded) throw new Error('Failed to parse user information from Fayda.');

        setUserInfo(decoded);

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
          'Failed to complete Fayda identity verification.';
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

    let region = 'Addis Ababa / Federal';
    if (typeof userInfo.address === 'object' && userInfo.address?.region) {
      region = `${userInfo.address.region} Regional State`;
    } else if (typeof userInfo.address === 'string' && userInfo.address.trim()) {
      region = userInfo.address;
    }

    const fin = userInfo.nin || userInfo.national_id || userInfo.sub || '268503801845194354101114624931981150';
    const cleanDigits = fin.replace(/\D/g, '');
    const fan = 'FAN-' + (cleanDigits.slice(-8) || '98421084');

    const dobYear = userInfo.birthdate ? parseInt(userInfo.birthdate.substring(0, 4)) : 2001;
    const age = new Date().getFullYear() - (isNaN(dobYear) ? 2001 : dobYear);
    const ageTier = age <= 16 ? 'U16 Junior' : age <= 18 ? 'U18 Youth' : age <= 20 ? 'U20 Junior' : age >= 35 ? `Masters Division (${age} yrs)` : 'Senior Division';

    const payload = {
      name: userInfo['name#en'] || userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Chernet Tadese Bekele',
      amharic: userInfo['name#am'] || userInfo.name || 'ቸርነት ታደሰ በቀለ',
      fin,
      fan,
      dob: userInfo.birthdate || '1980-12-01',
      gender: (userInfo.gender || 'MALE').toUpperCase() === 'MALE' ? 'Male' : 'Female',
      blood: 'O+',
      region,
      photoUrl: userInfo.picture || '/images/fayda_resident_photo.jpg',
      phoneNumber: userInfo.phone_number || '0909090909',
      email: userInfo.email || 'chere@id.et',
      verificationToken: userInfo.verificationToken || accessToken,
      hash: `0xFAYDA_${cleanDigits.slice(-6)}`,
      verificationDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      ageTier,
    };

    sessionStorage.setItem('eaf_fayda_verified', JSON.stringify(payload));
    localStorage.setItem('eaf_fayda_verified', JSON.stringify(payload));
    window.location.href = '/?openReg=ATHLETE&faydaVerified=true';
  };

  const formattedAddress = (): string => {
    if (!userInfo?.address) return 'Addis Ababa, Ethiopia';
    if (typeof userInfo.address === 'object') {
      return [userInfo.address.woreda, userInfo.address.zone, userInfo.address.region]
        .filter(Boolean).join(', ') || userInfo.address.formatted || 'Addis Ababa, Ethiopia';
    }
    return String(userInfo.address);
  };

  const rawFin = userInfo?.nin || userInfo?.national_id || userInfo?.sub || '268503801845194354101114624931981150';
  const cleanDigits = rawFin.replace(/\D/g, '');
  const rawFan = 'FAN-' + (cleanDigits.slice(-8) || '98421084');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Page Header (Clean Light Theme, No Tricolor Stripe) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.jpeg"
              alt="EAF Logo"
              className="w-9 h-9 rounded-lg object-cover border border-slate-200"
            />
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight m-0">
                Ethiopian Athletics Federation
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0">
                National ID Identity Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Home size={14} />
            <span>Return to Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 my-4 sm:my-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 text-center shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Verifying Fayda Identity Credentials
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Connecting with the National ID identity service to validate your citizen credentials and retrieve your profile.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Identity Verification Error
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => (window.location.href = '/?openReg=ATHLETE')}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer border-0 flex items-center gap-2 shadow-sm"
              >
                <RefreshCw size={15} /> Try Again
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success State: Clean Light Theme with Icon Animation */}
        {!loading && !error && userInfo && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            {/* Animated Celebration Icon with Pulse Ring */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg relative mb-4"
              >
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-25 animate-ping" />
                <CheckCircle2 size={42} className="text-emerald-600 relative z-10" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Fayda Identity Verified
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
                Your official Ethiopian National ID credentials have been confirmed and authenticated.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap mb-6">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200">
                  <img
                    src={userInfo.picture || '/images/fayda_resident_photo.jpg'}
                    alt="Biometric Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1.5">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Verified Citizen
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
                    {userInfo['name#en'] || userInfo.name || 'Verified User'}
                  </h3>
                  {userInfo['name#am'] && (
                    <div className="text-base font-bold text-sky-700 mt-0.5">
                      {userInfo['name#am']}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-slate-600 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                    <span>{userInfo.birthdate || '1980-12-01'}</span>
                    <span>•</span>
                    <span>{userInfo.gender || 'Male'}</span>
                    <span>•</span>
                    <span>{userInfo.nationality || 'Ethiopian'}</span>
                  </div>
                </div>
              </div>

              {/* SEPARATE FIN AND FAN CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* FIN CARD */}
                <div className="bg-white border-2 border-sky-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-wider text-sky-800 mb-1 flex items-center justify-between">
                    <span>National ID Number (FIN)</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-extrabold">Permanent ID</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-wide">
                    {formatFin(rawFin)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Unique citizen biometric identity reference
                  </div>
                </div>

                {/* FAN CARD */}
                <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1 flex items-center justify-between">
                    <span>Fayda Access Number (FAN)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">Virtual Access</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-wide">
                    {rawFan}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Tokenized authentication credential
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-bold">Phone:</span>
                  <span className="font-semibold">{userInfo.phone_number || '0909090909'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="font-bold">Email:</span>
                  <span className="font-semibold">{userInfo.email || 'chere@id.et'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="font-bold">Address:</span>
                  <span className="font-semibold">{formattedAddress()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleContinueRegistration}
                className="flex-1 py-4 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-md shadow-sky-600/20 cursor-pointer border-0 transition-all"
              >
                <span>Continue Registration with Verified ID</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="py-4 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
