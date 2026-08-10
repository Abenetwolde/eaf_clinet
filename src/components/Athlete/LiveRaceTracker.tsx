import React from 'react';
import { Activity, Radio, Trophy, Share2, Download, Award, FileCode } from 'lucide-react';
import { MOCK_LIVE_SPLITS } from '../../data/mockData';
import type { Athlete } from '../../types';

interface LiveRaceTrackerProps {
  athlete: Athlete;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LiveRaceTracker({ athlete, onNotify }: LiveRaceTrackerProps) {
  const handleShareBadge = (badgeTitle: string) => {
    onNotify(`Generated Digital Achievement Card for "${badgeTitle}"!`, 'success');
  };

  const handleDownloadWAXml = () => {
    onNotify(`Downloading certified World Athletics XML schema log for ${athlete.name}...`, 'info');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            Live Race Split Tracker & World Athletics Data Log
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            FR-3.1: Real-time broadcast sync (&lt; 1.5s latency) & World Athletics XML schema (FR-3.3)
          </p>
        </div>

        {/* Live Broadcast Sync Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-[20px] bg-primary-light border border-[rgba(5,150,105,0.3)]">
          <Radio size={16} color="var(--primary)" className="animate-pulse" />
          <span className="text-[0.8rem] font-bold text-primary">
            WebSocket Live Broadcast Sync (&lt; 1.2s Latency)
          </span>
        </div>
      </div>

      {/* Grid: Split Times Table vs Digital Achievement Badges */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
        {/* Table of Live Splits */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[18px]">
            <h4 className="text-[1.1rem] font-bold">
              Addis Ababa GP — Men's 5,000m Final Splits
            </h4>
            <span className="badge badge-amber">Official certified</span>
          </div>

          <div className="table-responsive mb-5">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Split Distance</th>
                  <th>Lap Time</th>
                  <th>Pace (/km)</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LIVE_SPLITS.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-text-heading">{item.distance}</td>
                    <td className="font-mono text-accent font-bold">{item.splitTime}</td>
                    <td className="text-[0.85rem] text-text-muted">{item.pace}</td>
                    <td>
                      <span className={`badge ${item.position === 1 ? 'badge-green' : 'badge-amber'}`}>
                        Pos #{item.position} ({item.leaderGap})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            onClick={handleDownloadWAXml}
            className="btn-gov-secondary w-full text-[0.85rem]"
          >
            <FileCode size={16} />
            Export World Athletics XML Results File (FR-3.3)
          </button>
        </div>

        {/* Digital Achievement Badges Collector */}
        <div className="gov-card">
          <div className="flex items-center justify-between mb-[18px]">
            <h4 className="text-[1.1rem] font-bold">
              Digital Achievement Badges & Credentials
            </h4>
            <Trophy color="var(--accent)" size={22} />
          </div>

          <div className="flex flex-col gap-3.5 mb-6">
            {(athlete.achievements as any).map((ach, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-border-card rounded-[10px] p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-full bg-accent-light border border-[rgba(217,119,6,0.3)] flex items-center justify-center text-accent">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-text-heading text-[0.88rem]">{ach.title}</div>
                    <div className="text-[0.75rem] text-text-muted">
                      Year: {ach.year} | Time: <strong>{ach.time}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleShareBadge(ach.title)}
                  className="btn-gov-secondary px-2.5 py-1 text-[0.75rem]"
                >
                  <Share2 size={12} />
                  Share
                </button>
              </div>
            ))}
          </div>

          {/* Social Share Card Preview */}
          <div className="bg-primary-light border border-[rgba(5,150,105,0.3)] rounded-xl p-4 text-center">
            <span className="badge badge-green mb-2">EACRMS VERIFIED ATHLETE</span>
            <div className="text-[1.1rem] font-extrabold text-text-heading">{athlete.name}</div>
            <div className="text-[0.85rem] text-primary mt-1 font-bold">
              Personal Best: <strong>{athlete.pb}</strong>
            </div>
            <div className="text-[0.75rem] text-text-muted mt-1">
              Fayda FIN Hash: {athlete.faydaHash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
