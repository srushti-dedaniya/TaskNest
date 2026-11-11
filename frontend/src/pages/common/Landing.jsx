import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CountUp } from '../../components/common/Motion.jsx'
import { fadeInUp, buttonTapMotion } from '../../utils/motion.js'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      <header className="w-full py-space-lg flex justify-center items-center">
        <div className="flex items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm text-primary">TaskNest</span>
          <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-widest">
            Identity Access
          </span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-gutter-mobile md:px-gutter-tablet py-space-xl">
        <div className="flex flex-col w-full">
          {/* Top Ambient Glow Decorator */}
          <div className="relative w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter-tablet">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[680px] h-[280px] bg-secondary-container/40 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Hero Narrative Header */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center text-center pt-space-md pb-space-xl"
            >
              <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container shadow-sm mb-space-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-[0.18em]">
                  An Artifact-Driven Internship Ecosystem
                </span>
              </div>
              <h1 className="font-display text-headline-lg md:text-display text-primary max-w-4xl tracking-tight leading-tight">
                Manage Work.{' '}
                <span className="italic font-headline-lg md:font-display text-secondary">
                  Track Growth.
                </span>{' '}
                Achieve More.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md">
                The high-performance portal harmonizing intern trajectory with engineering leadership through deliberate milestone calibration.
              </p>

              {/* Dual Call to Action */}
              <div className="flex flex-wrap items-center justify-center gap-space-md mt-space-lg">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-space-sm px- space-xl py-3.5 px-8 rounded-full bg-primary-container text-surface-bright font-title-md text-title-md hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg"
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-space-sm px-7 py-3.5 rounded-full bg-surface-container-high text-primary font-title-md text-title-md hover:bg-surface-variant transition-all duration-300"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">play_circle</span>
                  <span>Platform Walkthrough</span>
                </motion.button>
              </div>

              {/* Verified Metrics Pill Dock */}
              <div className="mt-space-xl flex flex-wrap items-center justify-center gap-y-3 gap-x-8 px-8 py-3 rounded-full bg-surface-container-low shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    <CountUp value="98.4%" />
                  </span>
                  <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">
                    On-time Deliverables
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    <CountUp value="1,420+" />
                  </span>
                  <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">
                    Milestones Tracked
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-secondary">
                    <CountUp value="4.9/5" />
                  </span>
                  <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">
                    Mentor Rating
                  </span>
                </div>
              </div>
            </motion.section>
      {/*Editorial Interactive Preview Deck*/}
      <section className="w-full mb-space-xl">
      <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-xl">
      {/*Monograph Window Bar*/}
      <div className="flex items-center justify-between pb-space-md mb-space-md bg-surface-container-low/60 -mx-space-md -mt-space-md px-space-md md:-mx-space-lg md:-mt-space-lg md:px-space-lg pt-space-sm rounded-t-xl">
      <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
      <span className="ml-2 font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Ecosystem Core // Dual Lens View</span>
      </div>
      <div className="flex items-center gap-space-sm">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-secondary font-label-xs-caps text-label-xs-caps uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    Live Calibration v4.2
                  </span>
      </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
      {/*Left Lens: Intern Journey*/}
      <div className="lg:col-span-6 bg-surface-container-low rounded-lg p-space-lg flex flex-col justify-between shadow-sm">
      <div>
      <div className="flex items-start justify-between mb-space-md">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-widest">Trajectory Archetype</span>
      <h3 className="font-headline-md text-headline-md text-primary mt-1">The Intern Journey</h3>
      </div>
      <span className="p-2 rounded-full bg-secondary-container text-on-secondary-container">
      <span className="material-symbols-outlined text-[20px]">explore</span>
      </span>
      </div>
      {/*Intern Persona Vignette*/}
      <div className="flex items-center gap-space-md p-space-sm bg-surface-container rounded-DEFAULT mb-space-md">
      <img className="w-12 h-12 rounded-full object-cover" data-alt="Close up architectural portrait of an engineering apprentice analyzing code blueprints in soft warm studio natural light with high key cream tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_IdSdvW65cd3Egl5BHAwP1bYZ-bkl2r1YOMSyliSDSm7ypUweFyT9_tNaW0O7-zmPaaE4zwGhWHqRkodDZL0RmPLhIOU2JpZWtQxHgAfESDT69AmvsV2XHzctIHpqTRXyMrg5cuPdn_oOS1c1zIPF5iDX2Z-3WwRjZAArvSvfb0iALlMrPNfJ6BborpMpxLpGiIqZMaRYxrWViqG5OjIlnYUl_h8w9mWxEXtiWWtD" />
      <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between">
      <p className="font-title-md text-title-md text-primary truncate">Aria Vance</p>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary font-semibold">LEVEL 03 CRAFT</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Distributed Consensus Engine • Sprint 06</p>
      </div>
      </div>
      {/*Automated XP & Radar Mini-Visualization*/}
      <div className="bg-surface-container-lowest rounded-DEFAULT p-space-md mb-space-md shadow-sm">
      <div className="flex justify-between items-end mb-2">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Trajectory XP &amp; Benchmark</span>
      <span className="font-title-md text-title-md text-primary">3,850 / 4,200 XP</span>
      </div>
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-3">
      <div className="h-full bg-secondary rounded-full" style={{ width: "88%" }}></div>
      </div>
      {/*Skill Radar Inline Chart*/}
      <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-3">
      <svg className="w-16 h-16 text-secondary" fill="none" viewBox="0 0 100 100">
      <polygon fill="none" points="50,10 90,38 75,85 25,85 10,38" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5"></polygon>
      <polygon fill="currentColor" fillOpacity="0.18" points="50,22 82,44 70,80 30,80 20,44" stroke="currentColor" strokeWidth="1.5"></polygon>
      </svg>
      <div>
      <p className="font-title-md text-body-sm font-semibold text-primary">Top 4% Peer Caliber</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Systems • Rust • Micro-orch</p>
      </div>
      </div>
      <span className="px-2.5 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-xs-caps text-label-xs-caps uppercase tracking-wider">+14% Velocity</span>
      </div>
      </div>
      {/*Active Quests*/}
      <div className="space-y-2">
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Current Quest Artifacts</p>
      <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-DEFAULT text-body-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
      <span className="truncate text-primary">E2E Raft Leader Election Harness</span>
      </div>
      <span className="text-secondary font-semibold font-label-xs-caps text-label-xs-caps shrink-0">MERGED</span>
      </div>
      <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-DEFAULT text-body-sm">
      <div className="flex items-center gap-2 truncate">
      <span className="material-symbols-outlined text-outline text-[18px]">pending</span>
      <span className="truncate text-primary">Latency Tail Quantile Profiling</span>
      </div>
      <span className="text-on-surface-variant font-label-xs-caps text-label-xs-caps shrink-0">IN REVIEW</span>
      </div>
      </div>
      </div>
      <div className="mt-space-lg pt-space-sm flex items-center justify-between">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Sync Protocol: Continuous</span>
      <a className="font-title-md text-body-sm text-secondary hover:text-primary transition-colors flex items-center gap-1" href="#">
                      Inspect Apprentice Spec <span className="material-symbols-outlined text-[16px]">north_east</span>
      </a>
      </div>
      </div>
      {/*Right Lens: Mentor Studio*/}
      <div className="lg:col-span-6 bg-surface-container-high rounded-lg p-space-lg flex flex-col justify-between shadow-sm">
      <div>
      <div className="flex items-start justify-between mb-space-md">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-widest">Leadership Governance</span>
      <h3 className="font-headline-md text-headline-md text-primary mt-1">The Mentor Studio</h3>
      </div>
      <span className="p-2 rounded-full bg-primary-container text-surface-bright">
      <span className="material-symbols-outlined text-[20px]">grading</span>
      </span>
      </div>
      {/*Cohort Health Index Gauge*/}
      <div className="bg-surface-container-lowest rounded-DEFAULT p-space-md mb-space-md shadow-sm">
      <div className="flex items-center justify-between mb-3">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Cohort Velocity Index</span>
      <p className="font-headline-sm text-headline-sm text-primary mt-0.5">94.8 <span className="text-body-sm text-secondary font-normal">/ 100 Optimal</span></p>
      </div>
      {/*Donut Meter Inline SVG*/}
      <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
      <circle className="text-surface-container-high" cx="18" cy="18" fill="none" r="15.5" stroke="currentColor" strokeWidth="3"></circle>
      <circle className="text-secondary" cx="18" cy="18" fill="none" r="15.5" stroke="currentColor" strokeDasharray="97.4, 100" strokeLinecap="round" strokeWidth="3"></circle>
      </svg>
      <span className="absolute font-label-xs-caps text-[10px] text-primary font-bold">95%</span>
      </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 text-center bg-surface-container-low rounded-md p-2">
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Blockers</p>
      <p className="font-title-md text-title-md text-primary mt-0.5">00</p>
      </div>
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">PR Velocity</p>
      <p className="font-title-md text-title-md text-primary mt-0.5">3.4h</p>
      </div>
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Rubric Score</p>
      <p className="font-title-md text-title-md text-secondary mt-0.5">Tier A+</p>
      </div>
      </div>
      </div>
      {/*Live PR Grading Module*/}
      <div className="space-y-2 mb-space-md">
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Pending Evaluation Queues</p>
      <div className="p-3 bg-surface-container-lowest rounded-DEFAULT shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
      <span className="font-body-sm text-body-sm font-semibold text-primary truncate">PR #204: Zero-copy Deserializer</span>
      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs-caps text-[10px] font-bold">AWAITING CRITIQUE</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">Branch target: `infra/serialization` • Rubric: Memory bounds &amp; safety proof</p>
      <div className="mt-2.5 flex items-center justify-between">
      <div className="flex -space-x-1.5">
      <span className="w-5 h-5 rounded-full bg-primary-container text-surface-bright text-[10px] flex items-center justify-center font-bold">DL</span>
      <span className="w-5 h-5 rounded-full bg-secondary text-surface text-[10px] flex items-center justify-center font-bold">MK</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary font-semibold">1-Click Approve with Rubric</span>
      </div>
      </div>
      </div>
      </div>
      <div className="mt-space-lg pt-space-sm flex items-center justify-between">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Audit Trail: Cryptographic</span>
      <a className="font-title-md text-body-sm text-primary hover:text-secondary transition-colors flex items-center gap-1" href="#">
                      Launch Evaluation Hub <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </a>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/*Feature Trio Cards*/}
      <section className="w-full mb-space-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg">
      <div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-widest">Architectural Pillars</span>
      <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Calibrated for Elite Outcomes.</h2>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 md:mt-0">
                Replacing subjective assessment with immutable craft milestones, structured mentorship, and undeniable production records.
              </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
      {/*Feature 1*/}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <div>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-space-md">
      <span className="material-symbols-outlined">tune</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-wider">Foundation 01</span>
      <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-space-sm">Precision Task Assignment</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    Granular difficulty weighting synchronized directly with GitHub commits. Milestones auto-adjust based on apprentice throughput.
                  </p>
      </div>
      <div className="pt-space-md bg-surface-container-low rounded-lg p-space-sm mt-space-sm">
      <div className="flex items-center justify-between text-body-sm">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Sync Latency</span>
      <span className="font-semibold text-primary">Instant (&lt;240ms)</span>
      </div>
      </div>
      </div>
      {/*Feature 2*/}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <div>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-space-md">
      <span className="material-symbols-outlined">rule</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-wider">Foundation 02</span>
      <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-space-sm">Objective Evaluation Rubric</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    Transparent score tiers with explicit code feedback loops. Mentors provide weighted assessments across architecture, hygiene, and logic.
                  </p>
      </div>
      <div className="pt-space-md bg-surface-container-low rounded-lg p-space-sm mt-space-sm">
      <div className="flex items-center justify-between text-body-sm">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Calibration Tiers</span>
      <span className="font-semibold text-secondary">A+ to C- Indexed</span>
      </div>
      </div>
      </div>
      {/*Feature 3*/}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <div>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mb-space-md">
      <span className="material-symbols-outlined">workspace_premium</span>
      </div>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-wider">Foundation 03</span>
      <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-space-sm">Dynamic Growth Index</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    Real-time talent velocity metrics culminate in verifiable cryptographic recommendation letters and immutable performance dossiers.
                  </p>
      </div>
      <div className="pt-space-md bg-surface-container-low rounded-lg p-space-sm mt-space-sm">
      <div className="flex items-center justify-between text-body-sm">
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase">Dossier Integrity</span>
      <span className="font-semibold text-primary">Cryptographically Signed</span>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/*Editorial Testimonial Vignette*/}
      <section className="w-full mb-space-xl">
      <div className="bg-primary-container text-surface-bright rounded-xl p-space-lg md:p-space-xl relative overflow-hidden shadow-xl">
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10 max-w-3xl">
      <span className="font-label-xs-caps text-label-xs-caps text-secondary-fixed uppercase tracking-widest">Executive Monograph</span>
      <blockquote className="font-headline-md md:font-headline-lg text-surface-bright mt-space-sm leading-relaxed">
                  “TaskNest converted our summer engineering cohort from an ambiguous mentoring burden into our highest-yielding technical recruitment pipeline. The clarity of milestones is without parallel.”
                </blockquote>
      <div className="mt-space-lg flex items-center gap-space-md">
      <img className="w-12 h-12 rounded-full object-cover" data-alt="Sophisticated black and white architectural portrait of a female VP of Engineering with contemplative expression against minimalist office wall" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzU-nd68Il8uDIt6IEIuAWhHWuEge_vp2PvsLsnYoccoJEae14cN0Be_5lzTa4ZMFcchW6SnkaRfLruAwU9Ve0V-ISxo-teZoNULJCbNpACC3VzRwpczCMmiEV5Km6Ef6spB1eIkqqd_Rm59JAF5C48PDmMFb51Qi2FO_Egl8GxQPvMiDcVh_AsDj6ii0Cdcu5n02juiu-QrEtJ2_Ob5fyKX-V8_kHgnuxebW33Ku0" />
      <div>
      <p className="font-title-md text-title-md text-surface-bright">Elena Rostova</p>
      <p className="font-body-sm text-body-sm text-on-primary-container">VP of Core Architecture • Monolith Systems</p>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/*Studio Editorial Footer Deck*/}
      <section className="w-full pt-space-lg pb-space-md">
      <div className="bg-surface-container rounded-xl p-space-lg md:p-space-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg pb-space-xl">
      <div className="md:col-span-5">
      <div className="flex items-center gap-2 mb-space-sm">
      <span className="font-headline-sm text-headline-sm text-primary">TaskNest</span>
      <span className="font-label-xs-caps text-label-xs-caps text-secondary uppercase tracking-widest">Studios</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                    An architectural framework for deliberate engineering mentorship, milestone validation, and high-trust apprentice governance.
                  </p>
      <div className="mt-space-md inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest">
      <span className="w-2 h-2 rounded-full bg-secondary"></span>
      <span className="font-label-xs-caps text-label-xs-caps text-on-surface uppercase tracking-wider">All Systems Nominal • Ledger Operational</span>
      </div>
      </div>
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-space-md">
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-primary uppercase tracking-wider mb-space-sm">Platform</p>
      <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
      <li><a className="hover:text-primary transition-colors" href="#">Intern Flow</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Mentor Studio</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Rubric Engine</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Security Specs</a></li>
      </ul>
      </div>
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-primary uppercase tracking-wider mb-space-sm">Protocols</p>
      <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
      <li><a className="hover:text-primary transition-colors" href="#">Artifact Ledger</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">GitHub Webhook</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">XP Algorithms</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Dossier Signer</a></li>
      </ul>
      </div>
      <div>
      <p className="font-label-xs-caps text-label-xs-caps text-primary uppercase tracking-wider mb-space-sm">Editions</p>
      <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
      <li><a className="hover:text-primary transition-colors" href="#">Enterprise</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Academic Labs</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Changelog</a></li>
      <li><a className="hover:text-primary transition-colors" href="#">Contact Press</a></li>
      </ul>
      </div>
      </div>
      </div>
      <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
      <p className="font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">
                  © 2025 TaskNest Architecture Group. Preserving craft via precision.
                </p>
      <div className="flex items-center gap-space-md font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-wider">
      <a className="hover:text-primary transition-colors" href="#">Privacy Monograph</a>
      <a className="hover:text-primary transition-colors" href="#">Governance Terms</a>
      <a className="hover:text-primary transition-colors" href="#">Telemetry</a>
      </div>
      </div>
      </div>
      </section>
      </div>
      </div></main><footer className="w-full py-space-md text-center font-label-xs-caps text-label-xs-caps text-on-surface-variant uppercase tracking-widest">Secure Workspace • Editorial Monograph Protocol</footer>
    </div>
  )
}
