type Tone = "default" | "light"

type ProyectaMarkProps = {
  size?: number
  className?: string
  glow?: boolean
}

type ProyectaBrandLockupProps = {
  className?: string
  markSize?: number
  tone?: Tone
  subtitle?: string
  tagline?: string
  compact?: boolean
}

type ProyectaTokenSealProps = {
  className?: string
  size?: number
  tone?: Tone
  showLabel?: boolean
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ")
}

export function ProyectaMark({ size = 56, className = "", glow = true }: ProyectaMarkProps) {
  return (
    <span
      className={joinClasses("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {glow ? <span className="absolute inset-0 rounded-[26px] bg-fuchsia-500/25 blur-xl" /> : null}
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#e040a8_8%,#c026d3_52%,#7a1e6e_100%)] shadow-[0_18px_38px_-18px_rgba(168,28,175,0.95)]">
        <span className="absolute inset-[1px] rounded-[21px] bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.28),rgba(255,255,255,0.05)_42%,transparent_66%)]" />
        <svg viewBox="0 0 64 64" className="relative h-[62%] w-[62%]" fill="none">
          <path
            d="M32 20.5c-3-2.9-7.2-4.5-12-4.5c-4.8 0-8.5 3.7-8.5 8.4v18.8c0 1.2 1 2.2 2.2 2.2h13.8c1.8 0 3.3.7 4.5 2.1"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 20.5c3-2.9 7.2-4.5 12-4.5c4.8 0 8.5 3.7 8.5 8.4v18.8c0 1.2-1 2.2-2.2 2.2H36.5c-1.8 0-3.3.7-4.5 2.1"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M32 21v26.8" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  )
}

export function ProyectaBrandLockup({
  className = "",
  markSize = 56,
  tone = "default",
  subtitle = "Apoyo mutuo y comunitario para la ciencia",
  tagline = "Sostengamos juntos la investigación: una red de apoyo mutuo, descentralizada y libre",
  compact = false,
}: ProyectaBrandLockupProps) {
  const isLight = tone === "light"

  return (
    <div className={joinClasses("flex min-w-0 items-center gap-3", className)}>
      <ProyectaMark size={markSize} className={compact ? "self-start" : ""} />
      <div className="min-w-0">
        <div
          className={joinClasses(
            "nova-title font-extrabold tracking-tight",
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
            isLight ? "text-white" : "text-slate-900",
          )}
        >
          PROYEC<span className="text-fuchsia-600">TA</span>
        </div>
        {subtitle ? (
          <div
            className={joinClasses(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              isLight ? "text-white/72" : "text-slate-400",
            )}
          >
            {subtitle}
          </div>
        ) : null}
        {tagline ? (
          <div
            className={joinClasses(
              "max-w-xl text-[11px] font-medium tracking-[0.04em]",
              isLight ? "text-white/78" : "text-slate-400/90",
            )}
          >
            {tagline}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ProyectaTokenSeal({
  className = "",
  size = 74,
  tone = "default",
  showLabel = true,
}: ProyectaTokenSealProps) {
  const isLight = tone === "light"

  return (
    <div className={joinClasses("inline-flex items-center gap-3", className)}>
      <span
        className={joinClasses(
          "relative inline-flex shrink-0 items-center justify-center rounded-full border",
          isLight ? "border-white/18 bg-white/10" : "border-fuchsia-100 bg-fuchsia-50/70",
        )}
        style={{ width: size, height: size }}
      >
        <span
          className={joinClasses(
            "absolute inset-[8px] rounded-full",
            isLight
              ? "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_65%,transparent)]"
              : "bg-[radial-gradient(circle_at_30%_30%,rgba(192,38,211,0.14),rgba(192,38,211,0.03)_65%,transparent)]",
          )}
        />
        <ProyectaMark size={Math.round(size * 0.52)} glow={false} />
      </span>

      {showLabel ? (
        <div>
          <p
            className={joinClasses(
              "text-[11px] font-bold uppercase tracking-[0.24em]",
              isLight ? "text-white/68" : "text-fuchsia-600",
            )}
          >
            CRÉDITOS
          </p>
          <p className={joinClasses("nova-title text-lg font-extrabold", isLight ? "text-white" : "text-slate-900")}>
            Emblema oficial
          </p>
        </div>
      ) : null}
    </div>
  )
}
