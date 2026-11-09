import React from 'react';
import { Award, CalendarDays, CheckCircle2, ClipboardList, HeartPulse, LogOut, ShieldCheck, Stethoscope } from 'lucide-react';

type ProfessionalPortalProps = {
  professionalRole: string;
  name: string;
  onLogout: () => void;
};

const roleViews: Record<string, { title: string; subtitle: string; icon: typeof Award; focus: string[] }> = {
  MEDICAL_STAFF: {
    title: 'Medical & Anti-Doping Dashboard',
    subtitle: 'Medical credentials, athlete welfare, and anti-doping support.',
    icon: Stethoscope,
    focus: ['Medical clearance workflow', 'Athlete health support', 'Anti-doping and TUE coordination'],
  },
  REFEREE: {
    title: 'Referee Dashboard',
    subtitle: 'Competition officiating, rules, and event reporting.',
    icon: ShieldCheck,
    focus: ['Competition assignments', 'Technical rules and briefings', 'Incident and result reports'],
  },
  COMPETITION_OFFICER: {
    title: 'Competition Officer Dashboard',
    subtitle: 'Competition operations and technical event administration.',
    icon: CalendarDays,
    focus: ['Competition operations', 'Entries and start lists', 'Results and event reports'],
  },
  OFFICIAL: {
    title: 'Technical Official Dashboard',
    subtitle: 'Technical assignments, event readiness, and officiating reports.',
    icon: Award,
    focus: ['Technical assignments', 'Event readiness checks', 'Officiating reports'],
  },
  DISCIPLINARY_OFFICER: {
    title: 'Disciplinary Officer Dashboard',
    subtitle: 'Federation case review and disciplinary administration.',
    icon: ClipboardList,
    focus: ['Case review queue', 'Hearing records', 'Decision documentation'],
  },
};

function normalizedRole(value: string) {
  const role = value.toUpperCase().replace(/[ -]+/g, '_');
  if (role === 'MEDICAL_HEAD' || role === 'MEDICAL') return 'MEDICAL_STAFF';
  if (role === 'TECHNICAL_OFFICIAL') return 'OFFICIAL';
  return role;
}

export default function ProfessionalPortal({ professionalRole, name, onLogout }: ProfessionalPortalProps) {
  const key = normalizedRole(professionalRole);
  const view = roleViews[key] || {
    title: `${key.replace(/_/g, ' ')} Dashboard`,
    subtitle: 'Your federation professional workspace.',
    icon: CheckCircle2,
    focus: ['Role-specific federation tasks', 'Competition information', 'Professional profile and accreditation'],
  };
  const Icon = view.icon;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><Icon size={23} /></div>
          <div><p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-500">Ethiopian Athletics Federation</p><p className="m-0 font-extrabold">Professional Portal</p></div>
        </div>
        <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><LogOut size={16} /> Sign out</button>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-sky-900 p-6 text-white sm:p-8">
          <p className="m-0 text-sm font-semibold text-sky-200">Welcome, {name || 'Federation Professional'}</p>
          <h1 className="mb-2 mt-2 text-2xl font-black sm:text-3xl">{view.title}</h1>
          <p className="m-0 max-w-2xl text-sm text-slate-200">{view.subtitle}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200"><CheckCircle2 size={15} /> Accreditation active</div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {view.focus.map((item, index) => {
            const icons = [ClipboardList, HeartPulse, ShieldCheck];
            const ItemIcon = icons[index % icons.length];
            return <article key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><ItemIcon size={20} /></div>
              <h2 className="m-0 text-base font-bold">{item}</h2>
              <p className="mb-0 mt-2 text-sm text-slate-600">Your {key.replace(/_/g, ' ').toLowerCase()} workspace is ready for this area.</p>
            </article>;
          })}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="m-0 text-lg font-bold">Current activity</h2>
          <p className="mb-0 mt-2 text-sm text-slate-600">There are no assigned items to show yet. Federation assignments will appear here when they are issued.</p>
        </section>
      </div>
    </main>
  );
}
