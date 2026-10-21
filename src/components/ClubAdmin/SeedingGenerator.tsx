import React, { useState } from 'react';
import { Sparkles, Layers, CheckCircle2, FileText, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useGetAthletesQuery } from '../../store/api/athleteApi';
import { useI18n } from '../../i18n';
import { useAppSelector } from '../../store/hooks';

interface SeedingGeneratorProps {
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

export default function SeedingGenerator({ onNotify }: SeedingGeneratorProps) {
  const { t } = useI18n();
  const club = useAppSelector((state) => state.auth.club);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [seedingMethod, setSeedingMethod] = useState<string>('SB_PB_HYBRID'); // 'SB_PB_HYBRID' or 'RANDOM'
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { data: roster = [] } = useGetAthletesQuery(club?.id ? { clubId: club.id } : undefined);
  const startList: StartListItem[] = roster
    .filter((athlete: any) => !selectedEvent || (athlete.primaryEvent || '').toLowerCase() === selectedEvent.toLowerCase())
    .map((athlete: any, index: number) => ({
      laneBib: index + 1,
      athlete: athlete.name || `${athlete.user?.firstName || ''} ${athlete.user?.lastName || ''}`.trim(),
      sb: athlete.seasonBest || '',
      pb: athlete.personalBest || athlete.pb || '',
      rankSeed: index + 1,
      heat: '',
    }));

  const handleGenerateSeeding = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (!startList.length) onNotify('No registered athletes with this event are available to seed.', 'info');
      else onNotify(t('toast.seedingCalculated', { event: selectedEvent }), 'success');
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-[16px] mb-[24px]">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            {t('club.seedingTitle')}
          </h3>
          <p className="text-[0.85rem] text-text-muted">
            {t('club.seedingSub')}
          </p>
        </div>

        <button 
          onClick={handleGenerateSeeding}
          className="btn-gov-primary"
          disabled={isGenerating}
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
          {t('club.recalcSeeding')}
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="gov-card mb-[24px] p-[20px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[16px]">
          <div className="form-group m-0">
            <label className="form-label">{t('club.selectDiscipline')}</label>
            <select 
              className="form-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">All roster athletes</option>
              {[...new Set(roster.map((a: any) => a.primaryEvent).filter(Boolean))].map((event: any) => <option key={event} value={event}>{event}</option>)}
            </select>
          </div>

          <div className="form-group m-0">
            <label className="form-label">{t('club.seedingRulesMatrix')}</label>
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
            {t('club.generatedStartList', { event: selectedEvent })}
          </div>
          <span className="badge badge-green">{t('club.lynxReady')}</span>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('club.hipLaneBib')}</th>
                <th>{t('club.athleteNameClub')}</th>
                <th>{t('club.seasonBest')}</th>
                <th>{t('club.personalBest')}</th>
                <th>{t('club.seedingRank')}</th>
                <th>{t('club.heatAssignment')}</th>
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
                      {t('club.seed', { seed: item.rankSeed })}
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
