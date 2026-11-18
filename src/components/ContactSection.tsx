import { useState, FormEvent } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { INSTAGRAM_PROFILE } from '../data/profileData';
import { validateContactForm } from '../utils/arenaLogic';
import { soundEngine } from '../utils/soundEngine';
import { InstagramBadgeButton } from './InstagramBadgeButton';
import { ScrollReveal } from './ScrollReveal';

interface ContactSectionProps {
  onSendMessage: (name: string, email: string, message: string) => void;
}

export function ContactSection({ onSendMessage }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    soundEngine.unlock();

    const validation = validateContactForm(name, email, message);
    if (!validation.valid) {
      soundEngine.play('error');
      setErrors(validation.errors);
      setSubmittedNotice(null);
      return;
    }

    const sender = name.trim();
    setErrors({});
    onSendMessage(name, email, message);
    setSubmittedNotice(
      `Saved locally for "${sender}" inside The Guardian's Eye panel on this browser. No external email server is connected — message ${INSTAGRAM_PROFILE.handle} on Instagram for direct outreach.`
    );
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contact" className="relative overflow-hidden border-b border-cyan-500/20 px-4 py-20 sm:px-6 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#ff3355]/10 blur-[120px]"
      />
      <div className="relative z-10 mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center">
            <p className="font-body text-sm font-bold tracking-[0.22em] text-[#00ffff]">
              DIMENSIONAL TRANSMISSION
            </p>
            <h2
              className="font-display mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              📩 SEND A WHISPER TO THE GUARDIAN
            </h2>
            <p className="mt-3 text-base text-slate-300">
              Record a message in The Guardian&apos;s Eye vault or connect directly via official Instagram.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={80}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 space-y-5 rounded-2xl border border-[#ff3355]/30 bg-[#0d1018]/90 p-6 shadow-[0_0_36px_rgba(255,51,85,0.12)] backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Warrior Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ren Kurosaki"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/15 bg-[#080a0f] px-3.5 text-base text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none"
                />
                {errors.name && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#ff3355]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Frequency Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@neo-kyoto.jp"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/15 bg-[#080a0f] px-3.5 text-base text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none"
                />
                {errors.email && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-[#ff3355]">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Whisper Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Speak across the rift..."
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#080a0f] p-3.5 text-base text-white placeholder-slate-500 focus:border-[#00ffff] focus:outline-none"
              />
              {errors.message && (
                <p role="alert" className="mt-1.5 text-xs font-semibold text-[#ff3355]">
                  {errors.message}
                </p>
              )}
            </div>

            {submittedNotice && (
              <div
                role="status"
                data-testid="contact-honest-feedback"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3.5 text-xs leading-relaxed text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>{submittedNotice}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                onMouseEnter={() => soundEngine.play('hover')}
                className="font-display min-h-[48px] flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-[#ff3355] via-[#a855f7] to-[#00c8ff] px-6 py-3 text-sm font-black tracking-[0.2em] text-white shadow-[0_0_24px_rgba(255,51,85,0.35)] transition hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-[#00ffff]"
              >
                ⚡ SEND MESSAGE
              </button>

              <InstagramBadgeButton
                variant="glass"
                label={`DM ${INSTAGRAM_PROFILE.handle}`}
                className="min-h-[48px]"
              />
            </div>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <Info className="h-3.5 w-3.5 shrink-0 text-[#00ffff]" aria-hidden="true" />
              <span>
                Messages submitted here are stored locally in this browser&apos;s Guardian&apos;s Eye panel (no remote backend).
              </span>
            </p>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
