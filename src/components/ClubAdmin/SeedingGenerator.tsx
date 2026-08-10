import React, { useState } from 'react';
import { Sparkles, Layers, CheckCircle2, FileText, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { MOCK_ATHLETES } from '../../data/mockData';
import type { Club } from '../../types';

interface SeedingGeneratorProps {
  club: Club;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface StartListItem {
  laneBib: number;
  athlete: string;
  sb: string;
  pb: string;
  rankSeed: number;
  heat: string;
}

export default function SeedingGenerator({ club, onNotify }: SeedingGeneratorProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('5,000m Final');
  const [seedingMethod, setSeedingMethod] = useState<string>('SB_PB_HYBRID'); // 'SB_PB_HYBRID' or 'RANDOM'
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [startList, setStartList] = useState<StartListItem[]>([
    { laneBib: 1, athlete: 'Haile Demisse (Defense AC)', sb: '12:51.20', pb: '12:49.00', rankSeed: 1, heat: 'Heat 1' },
    { laneBib: 2, athlete: 'Yomif Kejelcha (CBE AC)', sb: '12:53.10', pb: '12:50.10', rankSeed: 2, heat: 'Heat 1' },
    { laneBib: 3, athlete: 'Tilahun Regassa (Oromia AC)', sb: '12:58.40', pb: '12:55.00', rankSeed: 3, heat: 'Heat 1' },
    { laneBib: 4, athlete: 'Biniam Mehary (Defense AC)', sb: '13:02.15', pb: '13:00.00', rankSeed: 4, heat: 'Heat 1' },
    { laneBib: 5, athlete: 'Selemon Barega (Police AC)', sb: '13:05.80', pb: '12:52.00', rankSeed: 5, heat: 'Heat 1' },
  ]);

  const handleGenerateSeeding = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onNotify(`Automated World Athletics seeding matrix calculated for ${selectedEvent}!`, 'success');
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            World Athletics Automated Seeding & Start List Generator
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            Roster Athletics inspired heat allocation based on Season Best (SB) and Personal Best (PB) rankings
          </p>
        </div>

        <button 
          onClick={handleGenerateSeeding}
          className="btn-gov-primary"
          disabled={isGenerating}
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
          Recalculate Heat & Lane Seeding
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="gov-card mb-[24px] p-[20px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[16px]">
          <div className="form-group m-0">
            <label className="form-label">Select Championship Discipline</label>
            <select 
              className="form-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="5,000m Final">Men's 5,000m Final</option>
              <option value="1,500m Semi-Final">Men's 1,500m Semi-Final</option>
              <option value="10,000m Final">Women's 10,000m Final</option>
              <option value="3,000m Steeplechase">Men's 3,000m Steeplechase</option>
            </select>
          </div>

          <div className="form-group m-0">
            <label className="form-label">Seeding Rules Matrix</label>
            <select 
              className="form-select"
              value={seedingMethod}
              onChange={(e) => setSeedingMethod(e.target.value)}
            >
              <option value="SB_PB_HYBRID">World Athletics SB/PB Weighting (Standard)</option>
              <option value="RANDOM">Random Draw (Preliminary Round)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated Start List Grid */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="bg-[#F1F5F9] px-[20px] py-[16px] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="font-extrabold text-text-heading text-[0.95rem]">
            Generated Start List: {selectedEvent}
          </div>
          <span className="badge badge-green">Official Lynx .LIF Export Ready</span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Hip / Lane Bib</th>
                <th>Athlete Name & Club</th>
                <th>Season Best (SB)</th>
                <th>Personal Best (PB)</th>
                <th>Seeding Rank</th>
                <th>Heat Assignment</th>
              </tr>
            </thead>
            <tbody>
              {startList.map(item => (
                <tr key={item.laneBib}>
                  <td className="font-extrabold font-mono text-text-heading">
                    #{item.laneBib}
                  </td>
                  <td className="font-bold text-text-heading">
                    {item.athlete}
                  </td>
                  <td className="font-mono text-accent font-bold">
                    {item.sb}
                  </td>
                  <td className="font-mono text-text-muted">
                    {item.pb}
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      Seed #{item.rankSeed}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      {item.heat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
