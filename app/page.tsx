'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type Phase = 'prompt' | 'loading' | 'created' | 'done'

// ─── Shared primitives ────────────────────────────────────────────────────────

function ClaudeAsterisk({ spin = false, className = 'w-7 h-7' }: { spin?: boolean; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Claude"
      width={28}
      height={28}
      className={`${className} ${spin ? 'animate-spin' : 'animate-pulse'}`}
    />
  )
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
      {children}
    </button>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  showTooltip,
  onSaveFromTooltip,
}: {
  showTooltip: boolean
  onSaveFromTooltip: () => void
}) {
  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-200 flex flex-col bg-white h-full overflow-visible z-20 relative">
      {/* Top controls */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="5.5" />
              <path d="M14 14l3 3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mx-3 text-[13px]">
        <button className="flex-1 py-2 text-center font-semibold border-b-2 border-gray-900">Chat</button>
        <button className="flex-1 py-2 text-center text-gray-400">Cowork</button>
        <button className="flex-1 py-2 text-center text-gray-400 flex items-center justify-center gap-1">
          <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="4,1 4,13 12,7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Code
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-2 flex flex-col gap-0.5">
        {['+ New chat', 'Projects', 'Artifacts', 'Customize'].map((label) => (
          <button
            key={label}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 rounded-lg hover:bg-gray-100 text-left w-full"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Pinned */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Pinned</p>
        <p className="text-[12px] text-gray-300 px-1 flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><path d="M9.5 0L6.5 5H2l4 4-1.5 7 5-4 5 4-1.5-7 4-4H9.5L9.5 0z" /></svg>
          Drag to pin
        </p>
      </div>

      {/* Recents */}
      <div className="px-3 pt-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">Recents</p>

        {/* Sidebar item with floating tooltip */}
        <div className="relative">
          <button className="w-full text-left px-3 py-2 text-[13px] rounded-lg bg-gray-100 text-gray-800 font-medium truncate">
            Brand ad performance analysis
          </button>

          {/* Floating tooltip — appears to the right, overlapping the chat area */}
          {showTooltip && (
            <div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 animate-in"
              style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
            >
              <div className="relative bg-white border border-[#e8d5c4] rounded-xl shadow-md px-3.5 py-2.5 flex items-center gap-2.5 whitespace-nowrap">
                {/* Arrow pointing left */}
                <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-[#e8d5c4] rotate-45" />
                <span className="text-[12px] text-gray-600 font-medium">Save your report format?</span>
                <button
                  onClick={onSaveFromTooltip}
                  className="text-[12px] font-semibold text-[#c45a20] hover:text-[#a8481a] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Review panel ─────────────────────────────────────────────────────────────

const SKILL_CONTENT = `When generating brand performance reports, always follow this structure:

**Opening summary**
Compare all brands side by side — impressions, revenue, and CTR. Keep it dense and data-forward.

**Standout callouts**
- Name the top revenue performer and why
- Flag any brand with high CTR but low reach (punching above its weight)
- Use em-dashes for nuanced comparisons, bold brand names

**Key insight**
Close with one crisp insight and a single actionable recommendation. No padding.

**Tone**
Concise, analytical, no filler. The reader is data-literate.`

function ReviewPanel({
  onClose,
  onSave,
  saved,
}: {
  onClose: () => void
  onSave: () => void
  saved: boolean
}) {
  const [msg, setMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="w-[420px] shrink-0 border-l border-gray-200 flex flex-col bg-[#faf9f7] h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white">
        <div>
          <p className="text-[13px] font-semibold text-gray-900">Brand Report Formatter</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Skill instruction</p>
        </div>
        <div className="flex items-center gap-2">
          {!saved ? (
            <button
              onClick={onSave}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors active:scale-95"
            >
              Save skill
            </button>
          ) : (
            <span className="text-[12px] text-green-600 font-semibold flex items-center gap-1">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Skill content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="12" height="12" rx="2" />
              <path d="M4 4h6M4 7h6M4 10h4" strokeLinecap="round" />
            </svg>
            instruction.md
          </div>
        </div>

        {/* Rendered instruction content */}
        <div className="text-[13px] leading-[1.75] text-gray-700 whitespace-pre-line">
          {SKILL_CONTENT.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="font-semibold text-gray-900 mt-4 mb-1 first:mt-0">{line.slice(2, -2)}</p>
            }
            if (line.startsWith('- ')) {
              return (
                <div key={i} className="flex gap-2 text-gray-600 ml-1">
                  <span className="text-gray-300 mt-px select-none">•</span>
                  <span>{line.slice(2)}</span>
                </div>
              )
            }
            if (line === '') return <div key={i} className="h-1" />
            return <p key={i} className="text-gray-600">{line}</p>
          })}
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-end gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-300 transition-colors">
          <textarea
            ref={textareaRef}
            value={msg}
            onChange={(e) => { setMsg(e.target.value); autoResize() }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setMsg('') }
            }}
            placeholder="Ask to refine this skill…"
            rows={1}
            className="flex-1 text-[13px] resize-none outline-none text-gray-800 placeholder-gray-400 bg-transparent leading-[1.5] max-h-[120px]"
            style={{ height: '20px' }}
          />
          <button
            className={`p-1.5 rounded-lg shrink-0 transition-all mb-0.5 ${
              msg.trim()
                ? 'bg-gray-900 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-300 cursor-default'
            }`}
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">Changes will update the instruction file</p>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-[13px] px-4 py-3 rounded-xl shadow-xl transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 16 16" className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Skill saved — applies to all future reports.
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [showToast, setShowToast] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    if (phase !== 'loading') return
    const dotTimer = setInterval(() => setDotCount((d) => (d % 3) + 1), 450)
    const doneTimer = setTimeout(() => {
      clearInterval(dotTimer)
      setPhase('created')
    }, 2400)
    return () => { clearInterval(dotTimer); clearTimeout(doneTimer) }
  }, [phase])

  function handleSave() {
    setPhase('done')
    setReviewOpen(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  // Show tooltip when instruction created but not yet saved and review panel isn't open
  const showSidebarTooltip = (phase === 'created') && !reviewOpen

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-6px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      <Sidebar showTooltip={showSidebarTooltip} onSaveFromTooltip={handleSave} />

      <main className="flex-1 flex overflow-hidden min-w-0">
        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-gray-900">Brand ad performance analysis</span>
              <svg viewBox="0 0 14 14" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
              <svg viewBox="0 0 18 18" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 11v3a1 1 0 001 1h10a1 1 0 001-1v-3M9 2v9M6 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Scrollable chat area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-[660px] mx-auto px-6 py-8">

              {/* Message body */}
              <div className="text-[15px] leading-[1.8] text-gray-800 space-y-4">
                <p>
                  Brands B and C are close behind with similar impression counts (~95–98) and revenue ($6,40 each), though C edges out B slightly on CTR (2.2% vs 2.0%).
                </p>
                <p>
                  <strong>Brand D</strong> stands out for a different reason — despite having the lowest impressions by far (35), its CTR of 2.9% is nearly on par with Brand A. This suggests strong creative or targeting efficiency that&apos;s being underutilized due to low reach.
                </p>
                <p>
                  <strong>Key insight:</strong> Brand D is punching above its weight on CTR. It may be worth increasing its impression budget to see if the efficiency holds at scale — it could close the revenue gap with B and C.
                </p>
              </div>

              <hr className="my-5 border-gray-100" />

              {/* Feedback icons */}
              <div className="flex items-center gap-0.5 -ml-1.5">
                <IconBtn>
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <rect x="2" y="2" width="9" height="11" rx="1.5" />
                    <path d="M5 5h3M5 8h3M5 11h2" strokeLinecap="round" />
                    <rect x="7" y="4" width="7" height="9" rx="1" />
                  </svg>
                </IconBtn>
                <IconBtn>
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M5 10V5.5L7 2.5h1l.5 3H12l-1 5H8v3H6.5L5 10z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 9v5h2V9H3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconBtn>
                <IconBtn>
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M11 6V10.5L9 13.5H8l-.5-3H4l1-5H8V2h1.5L11 6z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 7V2h-2v5h2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconBtn>
                <IconBtn>
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M12 3v3.5h-3.5M4 13v-3.5H7.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 6.5A5 5 0 0112 6.5M12 9.5A5 5 0 014 9.5" strokeLinecap="round" />
                  </svg>
                </IconBtn>
              </div>

              {/* ── Skill creation flow ── */}
              <div className="mt-3 min-h-[28px]">

                {phase === 'prompt' && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-500">
                    <span>Want all future reports like this?</span>
                    <button
                      onClick={() => setPhase('loading')}
                      className="font-semibold text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md px-2.5 py-0.5 transition-colors hover:bg-gray-50"
                    >
                      Yes &amp; Copy
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 rounded-md px-2 py-0.5 transition-colors">
                      No
                    </button>
                  </div>
                )}

                {phase === 'loading' && (
                  <div className="flex items-center gap-2.5">
                    <ClaudeAsterisk spin className="w-5 h-5" />
                    <span className="text-[13px] font-medium text-gray-600 animate-pulse">
                      Working magic{'.'.repeat(dotCount)}
                    </span>
                  </div>
                )}

                {(phase === 'created' || phase === 'done') && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-500">
                    <span>The instruction was created.</span>
                    <button
                      onClick={() => setReviewOpen(true)}
                      className="font-semibold text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md px-2.5 py-0.5 transition-colors hover:bg-gray-50"
                    >
                      Review
                    </button>
                    {phase === 'created' ? (
                      <button
                        onClick={handleSave}
                        className="font-semibold text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md px-2.5 py-0.5 transition-colors hover:bg-gray-50"
                      >
                        Save it
                      </button>
                    ) : (
                      <span className="text-green-600 font-medium">Saved ✓</span>
                    )}
                  </div>
                )}
              </div>

              {/* Claude idle asterisk */}
              <div className="mt-8">
                <ClaudeAsterisk className="w-7 h-7" />
              </div>

            </div>
          </div>

          {/* Main chat input */}
          <div className="shrink-0 px-6 pb-5 pt-3 bg-white">
            <div className="max-w-[660px] mx-auto">
              <div className="flex items-end gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm focus-within:border-gray-300 transition-colors">
                <textarea
                  placeholder="Reply to Claude…"
                  rows={1}
                  className="flex-1 text-[14px] resize-none outline-none text-gray-800 placeholder-gray-400 bg-transparent leading-[1.5] max-h-[160px]"
                  style={{ height: '22px' }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
                  }}
                />
                <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
                  {/* Attach */}
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M13.5 7.5l-6 6a4 4 0 01-5.66-5.66l6-6a2.5 2.5 0 013.54 3.54l-6 6a1 1 0 01-1.42-1.42l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {/* Send */}
                  <button className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-300 text-center mt-2">Sonnet 4.6</p>
            </div>
          </div>
        </div>

        {/* Review panel — slides in from right */}
        {reviewOpen && (
          <ReviewPanel
            onClose={() => setReviewOpen(false)}
            onSave={handleSave}
            saved={phase === 'done'}
          />
        )}
      </main>

      <Toast show={showToast} />
    </div>
  )
}
