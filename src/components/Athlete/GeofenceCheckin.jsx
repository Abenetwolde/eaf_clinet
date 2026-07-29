import React, { useState, useEffect } from 'react';
import { Navigation, QrCode, MapPin, RefreshCw, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';

export default function GeofenceCheckin({ athlete, onUpdateAthlete, onNotify }) {
  const [selectedMeet, setSelectedMeet] = useState(MOCK_MEETS[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(athlete.checkinStatus === 'CHECKED_IN');
  const [countdown, setCountdown] = useState(120);
  const [qrToken, setQrToken] = useState('EAF_QR_HASH_99218');

  useEffect(() => {
    setCheckinSuccess(false);
  }, [selectedMeet]);

  useEffect(() => {
    let timer;
    if (checkinSuccess) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setQrToken('EAF_QR_HASH_' + Math.floor(10000 + Math.random() * 90000));
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkinSuccess]);

  const handleSimulateGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setCheckinSuccess(true);
      onUpdateAthlete({ ...athlete, checkinStatus: 'CHECKED_IN' });
      onNotify(`GPS check-in confirmed for ${selectedMeet.title}! QR Code generated.`, 'success');
    }, 1500);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          GPS Venue Check-In & Call Room QR
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Select your meet, verify GPS presence, and generate your dynamic call room QR code
        </p>
      </div>

      {/* Meet selector with images */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Select Meet
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {MOCK_MEETS.map(meet => {
            const isSelected = selectedMeet.id === meet.id;
            return (
              <div
                key={meet.id}
                onClick={() => setSelectedMeet(meet)}
                style={{
                  position: 'relative', borderRadius: '14px', overflow: 'hidden',
                  minHeight: '130px', cursor: 'pointer',
                  border: isSelected ? '3px solid var(--primary)' : '2px solid var(--border-card)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(11,87,142,0.15)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {/* Background image */}
                <img
                  src={meet.bannerUrl}
                  alt={meet.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)' }} />
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, padding: '14px' }}>
                  {isSelected && (
                    <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', marginBottom: '8px', display: 'inline-block' }}>
                      SELECTED
                    </span>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF', lineHeight: 1.3, marginBottom: '6px' }}>
                    {meet.title.length > 52 ? meet.title.slice(0, 52) + '…' : meet.title}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem', color: 'rgba(255,255,255,0.82)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {meet.venue.split(',')[0]}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {meet.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GPS + QR grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* GPS Check-In Card */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Navigation size={22} color="var(--primary)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Venue GPS Geofence Check-In</h4>
          </div>

          {/* Selected meet banner */}
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', height: '100px' }}>
            <img src={selectedMeet.bannerUrl} alt={selectedMeet.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', inset: 0, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', lineHeight: 1.3 }}>{selectedMeet.title.length > 50 ? selectedMeet.title.slice(0, 50) + '…' : selectedMeet.title}</div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.8)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} /> {selectedMeet.venue}
              </div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '14px', marginBottom: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Coordinates: <strong style={{ color: 'var(--text-heading)' }}>{selectedMeet.geofenceCoordinates.lat}° N, {selectedMeet.geofenceCoordinates.lng}° E</strong>
            {' '}| Radius: <strong style={{ color: 'var(--text-heading)' }}>{selectedMeet.geofenceCoordinates.radiusMeters}m</strong>
          </div>

          {!checkinSuccess ? (
            <button onClick={handleSimulateGPS} className="btn-gov-primary"
              style={{ width: '100%', padding: '12px' }} disabled={isLocating}>
              {isLocating ? (
                <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying GPS Location...</>
              ) : (
                <><Navigation size={15} /> Check In at Venue</>
              )}
            </button>
          ) : (
            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <CheckCircle2 size={28} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>GPS Check-In Confirmed!</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Call Room 1 — Eligible to compete</div>
            </div>
          )}
        </div>

        {/* Dynamic QR Code */}
        <div className="gov-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <QrCode size={22} color="var(--primary)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Referee Call Room QR Code</h4>
          </div>

          {checkinSuccess ? (
            <>
              <div style={{
                position: 'relative', width: '200px', height: '200px',
                margin: '0 auto 16px', background: '#FFFFFF',
                border: '3px solid var(--primary)', borderRadius: '14px',
                padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(11,87,142,0.15)'
              }}>
                <svg width="160" height="160" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="#FFFFFF"/>
                  <rect x="10" y="10" width="25" height="25" fill="#0B2A42"/>
                  <rect x="15" y="15" width="15" height="15" fill="#FFFFFF"/>
                  <rect x="18" y="18" width="9" height="9" fill="var(--primary)"/>
                  <rect x="65" y="10" width="25" height="25" fill="#0B2A42"/>
                  <rect x="70" y="15" width="15" height="15" fill="#FFFFFF"/>
                  <rect x="73" y="18" width="9" height="9" fill="var(--primary)"/>
                  <rect x="10" y="65" width="25" height="25" fill="#0B2A42"/>
                  <rect x="15" y="70" width="15" height="15" fill="#FFFFFF"/>
                  <rect x="18" y="73" width="9" height="9" fill="var(--primary)"/>
                  <rect x="42" y="12" width="8" height="8" fill="#0B2A42"/>
                  <rect x="52" y="24" width="8" height="8" fill="var(--primary)"/>
                  <rect x="42" y="42" width="16" height="16" fill="#0B2A42"/>
                  <rect x="68" y="42" width="10" height="10" fill="var(--accent)"/>
                  <rect x="22" y="45" width="10" height="10" fill="#0B2A42"/>
                  <rect x="42" y="68" width="12" height="12" fill="var(--primary)"/>
                  <rect x="65" y="68" width="22" height="22" fill="#0B2A42"/>
                </svg>
                <div className="laser-line" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                <Clock size={14} color="var(--accent)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  Refreshes in {countdown}s
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {qrToken}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
              <QrCode size={48} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.88rem' }}>Complete venue GPS check-in first to generate your Call Room QR code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
