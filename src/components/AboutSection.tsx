import { useState } from 'react';
import { Award, Code2, Sparkles, UserCheck } from 'lucide-react';
import {
  INSTAGRAM_PROFILE,
  PERSONAL_ACHIEVEMENTS,
  PERSONAL_DETAILS,
  SKILLS_AND_INTERESTS,
} from '../data/profileData';
import { InstagramBadgeButton, InstagramIcon } from './InstagramBadgeButton';
import { ScrollReveal } from './ScrollReveal';

export function AboutSection() {
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <section
      id="about"
      aria-label="About Sams Sanian Ahamod"
      className="relative overflow-hidden border-b border-cyan-500/20 px-4 py-20 sm:px-6 lg:py-24"
    >
      {/* Subtle Crimson & Purple Ambient Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff3355]/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/5 h-96 w-96 rounded-full bg-[#a855f7]/12 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="font-body text-sm font-bold tracking-[0.22em] text-[#00ffff]">
                PERSONAL PROFILE · CREATOR DOSSIER
              </p>
              <h2
                className="font-display mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                ABOUT <span className="text-[#ff3355]">SAMS SANIAN AHAMOD</span>
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-300">
                The vision, creative direction, and interactive craftsmanship behind The Crimson Void universe.
              </p>
            </div>

            <InstagramBadgeButton variant="glass" label={`INSTAGRAM ${INSTAGRAM_PROFILE.handle}`} />
          </div>
        </ScrollReveal>

        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {/* Left Identity Card */}
          <ScrollReveal className="lg:col-span-5" delayMs={60}>
            <article className="flex h-full flex-col justify-between rounded-2xl border border-[#ff3355]/35 bg-[#0d1018]/85 p-6 shadow-[0_0_36px_rgba(255,51,85,0.12)] backdrop-blur-xl sm:p-7">
              <div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#00ffff]/50 bg-[#080a0f] shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                    {!portraitFailed ? (
                      <img
                        src="/src/assets/images/fighter_sams_1794996295931.jpg"
                        alt="Sams Sanian Ahamod profile emblem"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setPortraitFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff3355]/30 to-[#0a0c0f] font-display text-lg font-black text-white">
                        SSA
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-xs font-bold tracking-[0.2em] text-[#ffcc00]">
                      CREATOR &amp; GUARDIAN
                    </p>
                    <h3 className="font-display mt-1 truncate text-xl font-black text-white">
                      SAMS SANIAN AHAMOD
                    </h3>
                    <a
                      href={INSTAGRAM_PROFILE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00ffff] transition hover:text-[#ff88dd]"
                    >
                      <InstagramIcon className="h-3.5 w-3.5" />
                      <span>{INSTAGRAM_PROFILE.handle}</span>
                    </a>
                  </div>
                </div>

                {/* Honest Introduction + Editable Bio Placeholder */}
                <div className="mt-6 space-y-3 text-base leading-relaxed text-slate-200">
                  <p>
                    Welcome to the official digital arena of <strong className="text-white">Sams Sanian Ahamod</strong> — a futuristic anime-inspired world combining storytelling, interactive real-time combat, procedural sound, and collectible armor craft.
                  </p>
                  <p className="rounded-xl border border-white/10 bg-[#080a0f]/80 p-3.5 text-sm text-slate-300">
                    <span className="font-display mr-2 text-[11px] font-bold tracking-wider text-[#00ffff]">
                      BIO SLOT:
                    </span>
                    [Replace this placeholder with your personal background, creative journey, or mission statement.]
                  </p>
                </div>

                {/* Profile Information Rows */}
                <dl className="mt-6 divide-y divide-white/10 border-t border-white/10">
                  {PERSONAL_DETAILS.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <dt className="font-semibold text-slate-400">{item.label}</dt>
                      <dd
                        className={`text-right font-semibold ${
                          item.isPlaceholder ? 'italic text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff88dd] underline-offset-4 transition hover:text-[#00ffff] hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <UserCheck className="h-4 w-4 text-[#00ffff]" aria-hidden="true" />
                    Official Account Only
                  </span>
                  <InstagramBadgeButton variant="compact" label="Visit Instagram" />
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Right Skills, Interests & Achievements Grid */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* Skills & Interests Card */}
            <ScrollReveal delayMs={140}>
              <article className="rounded-2xl border border-[#00ffff]/25 bg-[#0d1018]/85 p-6 shadow-[0_0_32px_rgba(0,255,255,0.08)] backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xs font-bold tracking-[0.2em] text-[#00ffff]">
                      CRAFT &amp; DISCIPLINES
                    </p>
                    <h3 className="font-display mt-1 text-xl font-black text-white">
                      SKILLS &amp; INTERESTS
                    </h3>
                  </div>
                  <Code2 className="h-6 w-6 text-[#00ffff]" aria-hidden="true" />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {SKILLS_AND_INTERESTS.map((skill) => (
                    <div
                      key={skill.title}
                      className="group rounded-xl border border-white/10 bg-[#080a0f]/85 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#00ffff]/45"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-white group-hover:text-[#00ffff]">
                          {skill.title}
                        </h4>
                        <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" aria-hidden="true" />
                      </div>
                      <p
                        className={`mt-2 text-sm leading-relaxed ${
                          skill.isPlaceholder ? 'italic text-slate-400' : 'text-slate-300'
                        }`}
                      >
                        {skill.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </ScrollReveal>

            {/* Personal Achievements Card */}
            <ScrollReveal delayMs={220}>
              <article className="rounded-2xl border border-[#a855f7]/30 bg-[#0d1018]/85 p-6 shadow-[0_0_32px_rgba(168,85,247,0.1)] backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xs font-bold tracking-[0.2em] text-[#ff00aa]">
                      MILESTONES &amp; RECORD
                    </p>
                    <h3 className="font-display mt-1 text-xl font-black text-white">
                      PERSONAL ACHIEVEMENTS
                    </h3>
                  </div>
                  <Award className="h-6 w-6 text-[#ffcc00]" aria-hidden="true" />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {PERSONAL_ACHIEVEMENTS.map((ach, idx) => (
                    <div
                      key={ach.title}
                      className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#080a0f]/85 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#ff3355]/50"
                    >
                      <div>
                        <span className="font-display text-xs font-bold text-[#ffcc00] tabular-nums">
                          0{idx + 1} · {ach.subtitle}
                        </span>
                        <h4 className="font-display mt-2 text-sm font-black text-white">
                          {ach.title}
                        </h4>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            ach.isPlaceholder ? 'italic text-slate-400' : 'text-slate-300'
                          }`}
                        >
                          {ach.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
