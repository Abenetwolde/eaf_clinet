import React, { useState, useEffect } from 'react';
import { Navigation, QrCode, MapPin, RefreshCw, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { MOCK_MEETS } from '../../data/mockData';
import type { Athlete } from '../../types';

interface GeofenceCheckinProps {
  athlete: Athlete;
  onUpdateAthlete: (athlete: Athlete) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function GeofenceCheckin({ athlete, onUpdateAthlete, onNotify }: GeofenceCheckinProps) {
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
      <div className="mb-6">
        <h3 className="text-[1.4rem] font-extrabold text-text-heading">
          GPS Venue Check-In & Call Room QR
        </h3>
        <p className="text-[0.85rem] text-text-muted mt-1">
          Select your meet, verify GPS presence, and generate your dynamic call room QR code
        </p>
      </div>

      {/* Meet selector with images */}
      <div className="mb-6">
        <div className="text-[0.8rem] font-bold text-text-muted uppercase tracking-[0.05em] mb-3">
          Select Meet
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
          {MOCK_MEETS.map(meet => {
            const isSelected = selectedMeet.id === meet.id;
            return (
              <div
                key={meet.id}
                onClick={() => setSelectedMeet(meet)}
                className="relative rounded-[14px] overflow-hidden min-h-[130px] cursor-pointer transition-all duration-150"
                style={{
                  border: isSelected ? '3px solid var(--primary)' : '2px solid var(--border-card)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(11,87,142,0.15)' : 'none'
                }}
              >
                {/* Background image */}
                <img
                  src={meet.bannerUrl}
                  alt={meet.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.58)]" />
                {/* Content */}
                <div className="relative z-[1] p-3.5">
                  {isSelected && (
                    <span className="bg-primary text-white text-[0.65rem] font-extrabold px-[9px] py-[3px] rounded-full mb-2 inline-block">
                      SELECTED
                    </span>
                  )}
                  <div className="font-extrabold text-[0.88rem] text-white leading-[1.3] mb-1.5">
                    {meet.title.length > 52 ? meet.title.slice(0, 52) + '…' : meet.title}
                  </div>
                  <div className="flex gap-3 text-[0.74rem] text-[rgba(255,255,255,0.82)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {meet.venue.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
        {/* GPS Check-In Card */}
        <div className="gov-card">
          <div className="flex items-center gap-2.5 mb-4">
            <Navigation size={22} color="var(--primary)" />
            <h4 className="text-[1.1rem] font-bold">Venue GPS Geofence Check-In</h4>
          </div>

          {/* Selected meet banner */}
          <div className="relative rounded-[10px] overflow-hidden mb-4 h-[100px]">
            <img src={selectedMeet.bannerUrl} alt={selectedMeet.title}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
              <div className="font-extrabold text-[0.85rem] text-white leading-[1.3]">{selectedMeet.title.length > 50 ? selectedMeet.title.slice(0, 50) + '…' : selectedMeet.title}</div>
              <div className="text-[0.74rem] text-[rgba(255,255,255,0.8)] mt-[3px] flex items-center gap-1">
                <MapPin size={11} /> {selectedMeet.venue}
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-border-card rounded-[10px] p-3.5 mb-[18px] text-[0.82rem] text-text-muted">
            Coordinates: <strong className="text-text-heading">{selectedMeet.geofenceCoordinates.lat}° N, {selectedMeet.geofenceCoordinates.lng}° E</strong>
            {' '}| Radius: <strong className="text-text-heading">{selectedMeet.geofenceCoordinates.radiusMeters}m</strong>
          </div>

          {!checkinSuccess ? (
            <button onClick={handleSimulateGPS} className="btn-gov-primary w-full p-3" disabled={isLocating}>
              {isLocating ? (
                <><RefreshCw size={15} className="animate-spin" /> Verifying GPS Location...</>
              ) : (
                <><Navigation size={15} /> Check In at Venue</>
              )}
            </button>
          ) : (
            <div className="bg-primary-light border border-primary rounded-[10px] p-4 text-center">
              <CheckCircle2 size={28} color="var(--primary)" className="mx-auto mb-2" />
              <div className="font-extrabold text-primary text-base">GPS Check-In Confirmed!</div>
              <div className="text-[0.8rem] text-text-muted mt-1">Call Room 1 — Eligible to compete</div>
            </div>
          )}
        </div>

        {/* Dynamic QR Code */}
        <div className="gov-card text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode size={22} color="var(--primary)" />
            <h4 className="text-[1.1rem] font-bold">Referee Call Room QR Code</h4>
          </div>

          {checkinSuccess ? (
            <>
              <div className="relative w-[200px] h-[200px] mx-auto mb-4 bg-white border-[3px] border-primary rounded-[14px] p-3.5 flex items-center justify-center shadow-[0_4px_14px_rgba(11,87,142,0.15)]">
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
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Clock size={14} color="var(--accent)" />
                <span className="text-[0.82rem] font-extrabold text-accent font-mono">
                  Refreshes in {countdown}s
                </span>
              </div>
              <div className="text-[0.72rem] text-text-muted font-mono">
                {qrToken}
              </div>
            </>
          ) : (
            <div className="px-5 py-10 text-text-muted">
              <QrCode size={48} color="#CBD5E1" className="mx-auto mb-3" />
              <p className="text-[0.88rem]">Complete venue GPS check-in first to generate your Call Room QR code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
