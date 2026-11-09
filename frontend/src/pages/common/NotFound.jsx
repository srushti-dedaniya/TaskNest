import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col">
      <header className="h-20 w-full px-margin flex items-center justify-between shadow-[0_1px_8px_rgba(53,51,45,0.04)] sticky top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl"><div className="flex items-center gap-space-md"><span className="font-headline-md text-headline-md tracking-tight text-primary font-medium">TaskNest</span><span className="px-space-sm py-space-xs rounded-full bg-surface-container-high text-on-surface font-label-xs-caps text-label-xs-caps uppercase">404 Transmission Error</span></div><div className="flex items-center gap-space-sm"><Link to="/intern/dashboard" className="px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all inline-flex items-center gap-space-xs" ><span className="material-symbols-outlined text-[18px]">dashboard</span>Panel</Link><button className="relative p-space-sm rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"><span className="material-symbols-outlined text-[20px]">notifications</span></button></div></header>
      <main className="flex-1 w-full flex flex-col items-center justify-center py-space-xl px-gutter">
      <section className="w-full max-w-[1100px] mx-auto flex flex-col gap-space-lg">
      <article className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
      <div className="lg:col-span-7 flex flex-col gap-space-lg">
      <div className="flex flex-col">
      <div className="flex items-center gap-space-sm mb-1">
      <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-xs-caps text-label-xs-caps uppercase">Kernel Trace</span>
      <span className="font-label-xs-caps text-label-xs-caps text-outline uppercase tracking-widest">Errno: 0x0F04</span>
      </div>
      <h1 className="font-display text-headline-lg xl:text-display text-primary tracking-tight">Traversed a Null Pointer.</h1>
      </div>
      <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.05)] border border-dashed border-surface-container-highest">
      <div className="font-mono text-body-sm text-primary leading-loose whitespace-pre-wrap">
      <span className="text-on-error-container">FATAL</span>: page_fault — dereferenced invalid user pointer<br />
      <span className="text-secondary">[0.000012]</span> kmm #44: no mapping at 0x0F04 for request<br />
      <span className="text-secondary">[0.000024]</span> Schedule decommission: intuition module was not found<br />
      <span className="text-outline-variant">[0.000031]</span> cpuid: e7 rebooted/blocked — check the sweep recorder<br />
      <span className="text-secondary">[0.000040]</span> host: core + build failed with leakage memory-state:<br />
      <span className="text-outline-variant">&gt;—</span> panic moderated at: kruntime.min/staff a0.32<br />
      <span className="text-outline-variant">&gt;—</span> treated the number wrong, output dump truncated<br />
      <span className="text-on-error-container">ABI</span>: running integers in the leger override with 0x0F04 lec<br />
      </div>
      </div>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  The resource has been meta-translated into an absent manifesto. Verify dispatch paths and media references, then head back to the ledger.
                </p>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-space-md">
      <div className="bg-primary text-on-primary rounded-3xl p-space-lg shadow-[0_4px_20px_-2px_rgba(53,51,45,0.08)] relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 p-space-md"><span className="material-symbols-outlined text-[120px]">psychology</span></div>
      <div className="relative">
      <span className="font-label-xs-caps text-label-xs-caps uppercase tracking-widest opacity-75">Mentorship Note</span>
      <h3 className="font-headline-sm text-headline-sm italic font-serif mt-space-sm">“Even kernel panics are a designed moment. Frame the fall as the start of the memory journey.”</h3>
      </div>
      </div>
      <div className="grid grid-cols-1 gap-space-md">
      <Link to="/admin/tasks" className="flex items-center justify-between gap-space-sm bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_2px_8px_rgba(53,51,45,0.04)] hover:bg-surface-container-low transition-all group" >
      <div className="flex items-center gap-space-md">
      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-secondary text-[20px]">checklist</span></div>
      <div className="flex flex-col min-w-0"><span className="font-title-md text-title-md text-on-surface">Open Task Registry</span><span className="font-body-sm text-body-sm text-on-surface-variant truncate">Verify state machine registration</span></div>
      </div>
      <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
      </Link>
      <Link to="/admin/interns" className="flex items-center justify-between gap-space-sm bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_2px_8px_rgba(53,51,45,0.04)] hover:bg-surface-container-low transition-all group" >
      <div className="flex items-center gap-space-md">
      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-secondary text-[20px]">group</span></div>
      <div className="flex flex-col min-w-0"><span className="font-title-md text-title-md text-on-surface">Open Peer Ledger</span><span className="font-body-sm text-body-sm text-on-surface-variant truncate">Rebuild from peer RHS-verified assets</span></div>
      </div>
      <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
      </Link>
      <a className="flex items-center justify-between gap-space-sm bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_2px_8px_rgba(53,51,45,0.04)] hover:bg-surface-container-low transition-all group" href="#">
      <div className="flex items-center gap-space-md">
      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-secondary text-[20px]">help</span></div>
      <div className="flex flex-col min-w-0"><span className="font-title-md text-title-md text-on-surface">Contact Faculty Systems Union</span><span className="font-body-sm text-body-sm text-on-surface-variant truncate">Ping peer-admin dispatch ops</span></div>
      </div>
      <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
      </a>
      </div>
      </div>
      </article>
      {/*Concept quote bottom*/}
      <div className="bg-surface-container-low rounded-3xl p-space-lg text-on-surface-variant text-center">
      <blockquote className="font-headline-sm text-headline-sm italic font-serif text-primary">“Nothing is truly lost — every pointer was born to be rewritten.”</blockquote>
      <p className="font-label-xs-caps text-label-xs-caps uppercase mt-1.5 tracking-widest opacity-75">— Peer Node Dispatch Doctrine, §4.</p>
      </div>
      </section>
      </main>
      <footer className="w-full h-16 px-margin flex items-center justify-between border-t border-surface-container-high bg-surface/60 backdrop-blur-xl mt-auto">
      <div className="flex items-center gap-space-sm font-label-xs-caps text-label-xs-caps uppercase text-outline"><span className="w-1.5 h-1.5 rounded-full bg-outline inline-block"></span>CPU: Stable • Memory Buffered: OK</div>
      <div className="font-label-xs-caps text-label-xs-caps uppercase text-outline">© 2026 TaskNest Kernel Space</div>
      </footer>

    </div>
  )
}
