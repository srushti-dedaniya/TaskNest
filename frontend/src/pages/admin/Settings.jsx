import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Settings() {
  const { user } = useAuth()
  const [showToast, setShowToast] = useState(false)

  const handleSyncConfig = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  return (
    <div className="space-y-8">
      {/*Inner Page Architecture Context*/}
      <div className="w-full max-w-[1400px] mx-auto px-gutter py-space-md flex flex-col gap-space-lg">
      {/*Settings Navigator Bio Card*/}
      <div className="flex flex-col lg:flex-row gap-space-lg items-stretch">
      {/*Left Faculty Identity Block (col span 8)*/}
      <div className="lg:col-span-8 grid grid-cols-1 gap-space-lg">
      {/*Faculty Profile Card*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-lg pb-space-lg border-b border-dashed border-surface-container-highest">
      <div className="flex items-center gap-space-lg">
      <img alt="An elegant black and white profile portrait of Elena Rostova wearing a sharp black jacket, soft studio lighting." className="w-16 h-16 rounded-2xl object-cover shadow-sm" data-alt="An elegant black and white profile portrait of Elena Rostova wearing a sharp black jacket, soft studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKmLgbqr-iilZaLteqKcxjZ-vhpZuJdInbBcA8ciq30T_UIpnl9-iPHyvT8oc-DOYbBPPCFmtb1FRNEnhlabAGPK94S0QZRGh6N7Lvh8r7CtBy4EkM2M-VuGOmv3xnt_DTlw09b_NzAApYp61a_FfuhX3reNHisXkORFPSf7FY8zGxbdRiLHTG21RT7aXiwEy7T3D5RMdaI2U2KzXcfFYvaVy9F_GgothM0XQovpXXW7yUziB9eLnmzyU" />
      <div className="flex flex-col">
      <div className="flex items-center gap-space-sm flex-wrap">
      <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Elena Rostova</h1>
      <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase">Admin • Chair</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">Lead Systems Architect &amp; Faculty Chair, Summer Cohort 2025</p>
      </div>
      </div>
      <div className="flex items-center gap-space-sm">
      <button className="flex items-center gap-1.5 px-space-md py-2 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all"><span className="material-symbols-outlined text-[18px]">edit</span>Edit Dossier</button>
      <button onClick={handleSyncConfig} className="flex items-center gap-1.5 px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm" id="saveConfigBtn"><span className="material-symbols-outlined text-[18px]">settings_overscan</span>Sync Config</button>
      </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-md">
      <div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Faculty ID</div>
      <div className="font-title-md text-title-md text-on-surface font-mono mt-0.5">FCH-2025-A147</div>
      </div>
      <div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Peer Cycle</div>
      <div className="font-title-md text-title-md text-on-surface font-mono mt-0.5">S06 • D11</div>
      </div>
      <div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Node Region</div>
      <div className="font-title-md text-title-md text-on-surface font-mono mt-0.5">us-east-2</div>
      </div>
      <div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Time Zone</div>
      <div className="font-title-md text-title-md text-on-surface font-mono mt-0.5">UTC-5</div>
      </div>
      </div>
      </div>
      {/*Regulatory Settings Layout Scroll Spy Tabs*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex flex-col">
      <div className="flex flex-wrap items-center gap-space-sm pb-space-md">
      <span className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase cursor-pointer">Account</span>
      <span className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase cursor-pointer">Security</span>
      <span className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase cursor-pointer">Ledger Rules</span>
      <span className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase cursor-pointer">Notifications</span>
      <span className="px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase cursor-pointer">Sessions</span>
      </div>
      {/*SLA Dispatch Config*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
      {/*SLA Visualizer Subcard*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Dispatch SLA Visualizer</span>
      </div>
      <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
      </div>
      <div className="grid grid-cols-3 gap-space-sm pb-space-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-sm border border-dashed border-surface-container-highest">
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Standard</div>
      <div className="font-headline-sm text-headline-sm text-on-surface tracking-tight">24h</div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-sm border border-dashed border-surface-container-highest">
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Rush</div>
      <div className="font-headline-sm text-headline-sm text-on-surface tracking-tight">6h</div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-space-sm border border-dashed border-surface-container-highest">
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant">Halts</div>
      <div className="font-headline-sm text-headline-sm text-on-surface tracking-tight">None</div>
      </div>
      </div>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-lock-edits">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
      <span className="font-body-md text-body-md text-on-surface">Lock edits post dispatch cycle</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-lock-edits" type="checkbox" defaultChecked="" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-alert-dt">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications_active</span>
      <span className="font-body-md text-body-md text-on-surface">DT deltas alert peer nodes</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-alert-dt" type="checkbox" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-disp-log">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">receipt_long</span>
      <span className="font-body-md text-body-md text-on-surface">Attach dispatch logs to XP Ledger</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-disp-log" type="checkbox" defaultChecked="" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      </div>
      {/*Security Level Card*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Hardware Security Keys</span>
      </div>
      <a className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold hover:underline" href="#">Manage</a>
      </div>
      {/*Secure YubiCard*/}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-dashed border-surface-container-highest">
      <div className="flex items-start justify-between gap-2 pb-space-sm">
      <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-secondary">usb</span>
      <span className="font-title-md text-title-md text-on-surface">SoloKey / YubiKey 5C NFC</span>
      </div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant mt-0.5">Primary Auth Channel</div>
      </div>
      <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase">Trusted</span>
      </div>
      <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-1">
      <span>Bound: 2025.03.18 (fpr: 08:C1:A4...00B2)</span>
      <a className="text-secondary font-semibold hover:underline" href="#">Deregister</a>
      </div>
      </div>
      {/*Sessions Table*/}
      <div className="pt-space-md">
      <div className="flex items-center justify-between pb-2">
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-on-surface-variant tracking-widest">Recent Sessions</span>
      </div>
      <div className="space-y-space-sm">
      <div className="flex items-center justify-between gap-2 bg-surface-container-lowest rounded-xl p-2.5 border border-dashed border-surface-container-highest">
      <div className="flex items-center gap-2 min-w-0">
      <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">laptop_mac</span>
      <div className="min-w-0">
      <div className="font-body-md text-body-md text-on-surface truncate">MacBook Pro • Cambridge Vault</div>
      <div className="font-label-xs-caps text-label-xs-caps text-outline uppercase">IP 84.211.42.111 • Just now</div>
      </div>
      </div>
      <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-surface-container-lowest rounded-xl p-2.5 border border-dashed border-surface-container-highest">
      <div className="flex items-center gap-2 min-w-0">
      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">phone_iphone</span>
      <div className="min-w-0">
      <div className="font-body-md text-body-md text-on-surface truncate">iPhone 15 Pro • VPN 2.4G</div>
      <div className="font-label-xs-caps text-label-xs-caps text-outline uppercase">IP 108.42.94.10 • 2d ago</div>
      </div>
      </div>
      <button className="text-on-error-container font-label-xs-caps text-label-xs-caps uppercase hover:underline shrink-0">Kill</button>
      </div>
      </div>
      </div>
      </div>
      </div>
      {/*Structural Toggle Tab Panel*/}
      <div className="bg-surface-container-low rounded-2xl p-space-md">
      <div className="flex items-center justify-between pb-space-sm">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">notifications</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Core Notification Dispatches</span>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg">
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-sla-breach">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">gpp_maybe</span>
      <span className="font-body-md text-body-md text-on-surface">SLA breach threat pulses</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-sla-breach" type="checkbox" defaultChecked="" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-peer-radius">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">diversity_3</span>
      <span className="font-body-md text-body-md text-on-surface">Peer Radius / Imbalance deltas</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-peer-radius" type="checkbox" defaultChecked="" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-scholarship">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">school</span>
      <span className="font-body-md text-body-md text-on-surface">Scholarship &amp; Termic tasks</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-scholarship" type="checkbox" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      <label className="flex items-center justify-between cursor-pointer py-2.5" htmlFor="toggle-mercury">
      <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">speed</span>
      <span className="font-body-md text-body-md text-on-surface">Mercury Telemetry migrations</span>
      </div>
      <div className="relative"><input className="peer sr-only" id="toggle-mercury" type="checkbox" defaultChecked="" /><div className="w-9 h-5 bg-outline rounded-full peer-checked:bg-secondary peer-checked:shadow-sm transition-colors"></div><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-bright rounded-full shadow transition-transform peer-checked:translate-x-4"></div></div>
      </label>
      </div>
      </div>
      </div>
      </div>
      {/*Product Settings Side Meta (col-4)*/}
      <div className="lg:col-span-4 flex flex-col gap-space-lg">
      {/*Studio Log Framing*/}
      <div className="bg-primary rounded-3xl p-space-lg text-on-primary shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)] relative overflow-hidden">
      <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-80">Division Rank Equity</span>
      <span className="material-symbols-outlined text-[20px] opacity-70">activity_zone</span>
      </div>
      <div className="font-headline-lg text-headline-lg tracking-tight">7.2</div>
      <p className="font-body-md text-body-md opacity-80 leading-relaxed">Balance maintained across calibration Groups A/B. Deviation &lt; 0.5 from idealized curve.</p>
      <div className="mt-space-md pt-space-md border-t border-on-primary/10">
      <div className="flex items-center justify-between font-body-sm text-body-sm opacity-90">
      <span>Datacenter sync</span><span className="font-mono">25ms</span>
      </div>
      <div className="flex items-center justify-between font-body-sm text-body-sm opacity-90 mt-space-xs">
      <span>Commit replication</span><span className="font-mono">98.4%</span>
      </div>
      <div className="flex items-center justify-between font-body-sm text-body-sm opacity-90 mt-space-xs">
      <span>Recovery window</span><span className="font-mono">12 min</span>
      </div>
      </div>
      </div>
      </div>
      {/*Faculty Verification Nodes*/}
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)]">
      <div className="flex items-center justify-between pb-space-md">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest text-on-surface-variant font-semibold">Profile Integrity Nodes</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary font-semibold">98% Ready</span>
      </div>
      <div className="space-y-space-md">
      <div className="flex items-center gap-space-sm">
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "100%" }}></div></div>
      <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">check_circle</span>
      </div>
      <div className="flex items-center gap-space-sm">
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: "96%" }}></div></div>
      <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">check_circle</span>
      </div>
      <div className="flex items-center gap-space-sm">
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-outline rounded-full" style={{ width: "60%" }}></div></div>
      <span className="material-symbols-outlined text-[16px] text-outline shrink-0">radio_button_unchecked</span>
      </div>
      </div>
      <div className="pt-space-md space-y-space-sm">
      <div className="flex items-center justify-between text-on-surface">
      <span className="font-body-md text-body-md font-semibold">Dispatch Discipline</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase text-secondary">Structural sync complete</span>
      </div>
      <div className="flex items-center justify-between text-on-surface-variant">
      <span className="font-body-md text-body-md">Peer Review Authority</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase">2 colleagues attested</span>
      </div>
      <div className="flex items-center justify-between text-on-surface-variant">
      <span className="font-body-md text-body-md">Hardware FPR Signing</span>
      <span className="font-label-xs-caps text-label-xs-caps uppercase">Awaiting Yubi tap</span>
      </div>
      </div>
      </div>
      {/*Hero Art / Abstract Elegant Element*/}
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden relative shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] flex-1 min-h-48">
      <img alt="A minimal monochrome photographed texture of a subtle concrete facade with a dramatic raking ray of light." className="w-full h-full object-cover absolute inset-0" data-alt="A minimal monochrome photographed texture of a subtle concrete facade with a dramatic raking ray of light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKmLgbqr-iilZaLteqKcxjZ-vhpZuJdInbBcA8ciq30T_UIpnl9-iPHyvT8oc-DOYbBPPCFmtb1FRNEnhlabAGPK94S0QZRGh6N7Lvh8r7CtBy4EkM2M-VuGOmv3xnt_DTlw09b_NzAApYp61a_FfuhX3reNHisXkORFPSf7FY8zGxbdRiLHTG21RT7aXiwEy7T3D5RMdaI2U2KzXcfFYvaVy9F_GgothM0XQovpXXW7yUziB9eLnmzyU" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
      <div className="absolute top-space-md left-space-md bg-surface-bright/90 backdrop-blur px-space-sm py-1 rounded-full font-label-xs-caps text-label-xs-caps uppercase text-on-surface">Manifest: Alpha-V10</div>
      <div className="absolute bottom-space-md left-space-md right-space-md text-surface-bright">
      <div className="font-headline-sm text-headline-sm italic font-serif leading-snug">“Symmetry is the mother of structure. Preserve aesthetic over entropy in peer transit.”</div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase mt-1 opacity-80">— Elena Rostova, Faculty Note</div>
      </div>
      </div>
      </div>
      </div>
      </div>
      {/*Toast overlay*/}
      {showToast && (
        <div className="fixed bottom-space-lg right-gutter z-50 transform transition-all duration-300 ease-in-out translate-y-0 opacity-100" id="saveToast">
          <div className="bg-primary text-on-primary rounded-2xl px-space-lg py-space-md shadow-[0_12px_32px_-4px_rgba(53,51,45,0.3)] flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[20px] text-surface-bright">check_circle</span>
            <div className="font-body-sm text-body-sm">
              <div className="font-label-md text-label-md font-semibold">Config Synced</div>
              <div className="opacity-75">Peer chain configs synced to standard nodes.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
