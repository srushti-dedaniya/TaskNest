import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { userService } from '../../services/api.js'

export default function InternDetails() {
  const { internId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchIntern() {
      if (!internId || internId === 'intern-01') return
      try {
        setLoading(true)
        const res = await userService.get(internId)
        if (res?.intern) {
          setData(res)
        }
      } catch (err) {
        console.warn('[InternDetails] API fetch failed:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchIntern()
  }, [internId])

  const intern = data?.intern
  const stats = data?.stats
  const name = intern?.name || 'Julian Vance'
  const email = intern?.email || 'julian.vance@tasknest.edu'
  const institution = intern?.institution || 'MIT Systems Group'
  const fieldOfStudy = intern?.fieldOfStudy || 'Systems & Distributed Consensus Fellow'
  const points = stats?.points ?? intern?.points ?? 4120
  const totalSubs = stats?.submissions ?? 18
  const approvedSubs = stats?.approved ?? 16
  const isEmailVerified = intern?.isEmailVerified !== false
  return (
    <div className="space-y-8">
      {/*Inner Page Architecture Context*/}
      <div className="w-full max-w-[1400px] mx-auto px-gutter py-space-md flex flex-col gap-space-lg">
      {/*Breadcrumb Header Grid*/}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
      {/*Identity Dossier Header: Left Column (col-08)*/}
      <div className="xl:col-span-8 flex flex-col gap-space-md">
      <div className="flex items-center gap-space-xs font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-widest">
      <Link to="/admin/interns" className="hover:text-on-surface transition-colors" >Studio</Link>
      <span className="text-outline-variant">/</span>
      <Link to="/admin/interns" className="hover:text-on-surface transition-colors" >People Governance</Link>
      <span className="text-outline-variant">/</span>
      <span className="text-on-surface font-semibold">{name}</span>
      </div>
      {/*Core Identity Pill Card*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05),0_2px_6px_-1px_rgba(53,51,45,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-lg">
      <div className="relative shrink-0">
      <div className="w-20 h-20 rounded-3xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-lg text-2xl font-bold shadow-inner">
        {name.charAt(0).toUpperCase()}
      </div>
      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-primary text-on-primary font-label-xs-caps text-[9px] uppercase shadow">
        {isEmailVerified ? 'VERIFIED' : 'PENDING'}
      </span>
      </div>
      <div className="flex flex-col">
      <div className="flex items-center gap-space-sm flex-wrap">
      <h1 className="font-headline-md text-headline-md text-primary tracking-tight">{name}</h1>
      <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase">{institution}</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-0.5">
        {fieldOfStudy}
      </p>
      <div className="flex items-center gap-space-sm mt-space-sm flex-wrap">
      <span className="font-label-md text-label-md px-space-sm py-1 rounded-lg bg-surface-container-low text-on-surface inline-flex items-center gap-1 font-mono text-xs">
        <span className="material-symbols-outlined text-[16px]">mail</span>{email}
      </span>
      </div>
      </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-space-sm shrink-0">
      <Link to="/admin/interns" className="flex items-center justify-center gap-1.5 px-space-md py-2 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Back to Fellows</span>
      </Link>
      </div>
      </div>
      {/*4x Metric Stat Grid*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex flex-col justify-between">
      <span className="material-symbols-outlined text-[20px] text-secondary">military_tech</span>
      <div className="font-headline-sm text-headline-sm text-primary tracking-tight mt-space-sm">{points}<span className="font-title-md text-title-md text-on-surface-variant ml-1">XP</span></div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant mt-0.5">Total Ledger XP</div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex flex-col justify-between">
      <span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
      <div className="font-headline-sm text-headline-sm text-primary tracking-tight mt-space-sm">{approvedSubs}</div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant mt-0.5">Approved Submissions</div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex flex-col justify-between">
      <span className="material-symbols-outlined text-[20px] text-secondary">lightbulb</span>
      <div className="font-headline-sm text-headline-sm text-primary tracking-tight mt-space-sm">{totalSubs}<span className="font-title-md text-title-md text-on-surface-variant ml-1">Subs</span></div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant mt-0.5">Total Submissions</div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex flex-col justify-between">
      <span className="material-symbols-outlined text-[20px] text-secondary">stacked_bar_chart</span>
      <div className="font-headline-sm text-headline-sm text-primary tracking-tight mt-space-sm">
        {isEmailVerified ? 'Active' : 'Unverified'}
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant mt-0.5">Account Status</div>
      </div>
      </div>
      {/*2. Peer Trajectory Graph & Target Specs Panel*/}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      {/*Trajectory Graph Card (col-08)*/}
      <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center justify-between pb-space-md">
      <div>
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">ssid_chart</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Peer Sustained Trajectory</span>
      </div>
      <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">XP synthesis velocity across Cycle 04 → 06</div>
      </div>
      <div className="flex items-center gap-space-xs">
      <span className="px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase font-semibold">Index Rising</span>
      <span className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase font-medium">6k Window</span>
      </div>
      </div>
      <svg className="w-full h-56" fill="none" preserveAspectRatio="none" viewBox="0 0 900 260"><defs><linearGradient id="julianGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#74593f" stopOpacity="0.3"></stop><stop offset="1" stopColor="#74593f" stopOpacity="0.02"></stop></linearGradient></defs><g><text x="8" y="20" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#49473f" }}>6.5k</text><text x="8" y="80" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#49473f" }}>5.2k</text><text x="8" y="140" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#49473f" }}>4.0k</text><text x="8" y="200" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#49473f" }}>2.8k</text></g><g><line x1="42" x2="890" y1="16" y2="16" stroke="#cbc6bc" strokeWidth="1" strokeDasharray="4"></line><line x1="42" x2="890" y1="76" y2="76" stroke="#cbc6bc" strokeWidth="1" strokeDasharray="4"></line><line x1="42" x2="890" y1="136" y2="136" stroke="#cbc6bc" strokeWidth="1"></line><line x1="42" x2="890" y1="196" y2="196" stroke="#cbc6bc" strokeWidth="1" strokeDasharray="4"></line></g><path d="M42 206 C130 196, 180 176, 260 180 C340 184, 400 150, 480 142 C560 134, 620 88, 700 72 C780 56, 830 46, 890 24" fill="none" stroke="#74593f" strokeWidth="3"></path><path d="M42 206 C130 196, 180 176, 260 180 C340 184, 400 150, 480 142 C560 134, 620 88, 700 72 C780 56, 830 46, 890 24 L890 248 L42 248 Z" fill="url(#julianGrad)" stroke="none"></path><g fill="none" stroke="#ba1a1a" strokeWidth="3"><circle cx="260" cy="180" r="5" fill="#fff8f2"></circle></g><text x="240" y="164" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#ba1a1a", fontWeight: "600" }}>S04 Breach Event</text><g fill="none" stroke="#74593f" strokeWidth="3"><circle cx="890" cy="24" r="6" fill="#fff8f2"></circle></g><text x="820" y="50" style={{ font: "400 12px 'Manrope', sans-serif", fill: "#201e19", fontWeight: "600", textAnchor: "end" }}>4.12k</text></svg>
      <div className="flex items-center justify-between pt-space-sm">
      <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>Sustained XP Log Scale</div>
      <a className="font-label-md text-label-md px-space-md py-1.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all shadow-sm" data-path="cohort-analytics" title="Full cohort analysis" href="#">Full Trajectory State</a>
      </div>
      </div>
      {/*Assigned Specification Dossier (col-04)*/}
      <div className="lg:col-span-4 flex flex-col gap-space-lg">
      <div className="bg-primary text-on-primary rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)] relative overflow-hidden">
      <div className="flex items-center justify-between pb-space-md">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[20px] opacity-90">code_blocks</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-80 font-semibold">Assigned Specs Repository</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps uppercase bg-primary-container text-on-primary-container px-space-sm py-1 rounded-full">3 Open</span>
      </div>
      <div className="space-y-space-md">
      <Link to="/intern/daily-tasks" className="flex items-center justify-between gap-space-sm group hover:opacity-80 transition-opacity" >
      <div className="min-w-0">
      <div className="font-title-md text-title-md font-mono">SPEC-0841</div>
      <div className="font-body-sm text-body-sm opacity-75 truncate">Distributed Consensus — Raft Elections</div>
      </div>
      <span className="material-symbols-outlined text-[18px] opacity-60 group-hover:opacity-100 transition-all">arrow_outward</span>
      </Link>
      <Link to="/intern/daily-tasks" className="flex items-center justify-between gap-space-sm group hover:opacity-80 transition-opacity" >
      <div className="min-w-0">
      <div className="font-title-md text-title-md font-mono">SPEC-0842</div>
      <div className="font-body-sm text-body-sm opacity-75 truncate">Zero-Knowledge Sink Buffer</div>
      </div>
      <span className="material-symbols-outlined text-[18px] opacity-60 group-hover:opacity-100 transition-all">arrow_outward</span>
      </Link>
      <Link to="/intern/daily-tasks" className="flex items-center justify-between gap-space-sm group hover:opacity-80 transition-opacity" >
      <div className="min-w-0">
      <div className="font-title-md text-title-md font-mono">SPEC-0792</div>
      <div className="font-body-sm text-body-sm opacity-75 truncate">Deterministic Log Scheduler</div>
      </div>
      <span className="material-symbols-outlined text-[18px] opacity-60 group-hover:opacity-100 transition-all">arrow_outward</span>
      </Link>
      </div>
      </div>
      {/*Editor Notes / Faculty Contacts*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center gap-2 pb-space-sm">
      <span className="material-symbols-outlined text-secondary text-[20px]">index</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Monograph Archive</span>
      </div>
      <div className="divide-y divide-surface-container-high">
      <div className="flex items-start justify-between gap-space-sm py-space-sm">
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface">Academic Term 02 — Real-time Consensus Paradoxes</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">Drafted Oct 18 • Candidate bound semantics on cancellation safety.</div>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase font-semibold shrink-0">Verified</span>
      </div>
      <div className="flex items-start justify-between gap-space-sm py-space-sm">
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface">Academic Term 01 — Circuits &amp; Memory Layering</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">Drafted Sep 22 • Boundaries on register allocation overhead.</div>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase font-semibold shrink-0">Published</span>
      </div>
      <div className="py-space-sm">
      <div className="font-title-md text-title-md text-primary pb-space-xs">Editor Advisory Notes</div>
      <textarea className="w-full resize-none h-24 p-space-md bg-surface-container-low rounded-2xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-0 transition-all" placeholder="Write formal feedback for Julian regarding curriculum orientation, SLA compliance..."></textarea>
      <div className="flex items-center justify-between pt-space-sm">
      <p className="font-body-sm text-body-sm text-on-surface-variant italic">Notes are persisted to peer-bound dossiers; encrypted for academic integrity.</p>
      <button className="px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm">Save Note</button>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      {/*3. Academic Credentials & Monograph Analysis (Low Layout)*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
      {/*Domain Expertise Chart*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center gap-2 pb-space-md">
      <span className="material-symbols-outlined text-secondary text-[20px]">radar</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Field Expertise Mapping</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-lg gap-y-space-md">
      <div className="flex items-center justify-between gap-2">
      <span className="font-body-md text-body-md text-on-surface">Distributed Consensus</span>
      <span className="font-label-md text-label-md text-secondary font-mono">98%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "98%" }}></div></div>
      <div className="flex items-center justify-between gap-2">
      <span className="font-body-md text-body-md text-on-surface">Capability Modding</span>
      <span className="font-label-md text-label-md text-secondary font-mono">91%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "91%" }}></div></div>
      <div className="flex items-center justify-between gap-2">
      <span className="font-body-md text-body-md text-on-surface">Cryptography &amp; ZK</span>
      <span className="font-label-md text-label-md text-secondary font-mono">74%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "74%" }}></div></div>
      <div className="flex items-center justify-between gap-2">
      <span className="font-body-md text-body-md text-on-surface">Formal Proofs / Coq</span>
      <span className="font-label-md text-label-md text-secondary font-mono">82%</span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "82%" }}></div></div>
      </div>
      </div>
      {/*Academic Credentials*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center gap-2 pb-space-md">
      <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Academic Credentials &amp; Certification</span>
      </div>
      <div className="space-y-space-md">
      <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-secondary-container text-[20px]">workspace_premium</span></div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface truncate">Fellowship Term 01 Award</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">Excellence in Systems Design</div>
      </div>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase shrink-0">Verified</span>
      </div>
      <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-surface-variant text-[20px]">article</span></div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface truncate">Peer-Reviewed Crypto Paper</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">IEEE Transactions, 2025</div>
      </div>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase shrink-0">Published</span>
      </div>
      <div className="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center gap-space-md min-w-0">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-surface-variant text-[20px]">code</span></div>
      <div className="min-w-0">
      <div className="font-title-md text-title-md text-on-surface truncate">Rust Foundation Member</div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">Async I/O Working Group</div>
      </div>
      </div>
      <span className="px-space-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-xs-caps text-label-xs-caps uppercase shrink-0">Active</span>
      </div>
      </div>
      </div>
      </div>
      {/*4. Cryptocurrency Periferal Ledger*/}
      <div className="bg-primary text-on-primary rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)] flex flex-col lg:flex-row gap-space-lg lg:items-center">
      <div className="flex-1">
      <div className="flex items-center gap-2 pb-space-xs">
      <span className="material-symbols-outlined text-[20px] opacity-80">verified_user</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-80 font-semibold">Cryptographic Ledger Merit</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm tracking-tight mb-space-sm">Immutable Merit Chain &amp; Proof of Durability</h3>
      <p className="font-body-md text-body-md opacity-75 max-w-lg leading-relaxed">Credentials &amp; monograph submissions are hashed into a 256-bit practical stable regime. Tests render locally, syncing back to faculty nodes each cycle.</p>
      </div>
      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-space-sm items-stretch">
      <div className="bg-primary-container/60 rounded-2xl px-space-lg py-space-md flex flex-col shadow-inner">
      <div className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-70">Ledger Hash</div>
      <div className="font-title-md text-title-md font-mono mt-1">0x888d0A...e4F</div>
      </div>
      <div className="bg-primary-container/60 rounded-2xl px-space-lg py-space-md flex flex-col shadow-inner">
      <div className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-70">Last Sync</div>
      <div className="font-title-md text-title-md font-mono mt-1">2m ago</div>
      </div>
      <button className="px-space-lg py-space-md rounded-2xl bg-surface-bright text-primary font-label-md text-label-md hover:bg-surface-container-lowest transition-all shadow-sm flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-[18px]">file_download</span>Export Ledger</button>
      </div>
      </div>
      </div>
      </div>
      </div>
    </div>
  )
}
