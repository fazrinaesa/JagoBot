import React from "react";
import { cn } from "../lib/utils";
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * Badge — pill status dengan dot opsional
 * ───────────────────────────────────────────────────────────── */
export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "violet"
  | "neutral";

const badgeStyles: Record<BadgeVariant, string> = {
  success:
    "bg-accent-green/10 text-accent-green-dark border border-accent-green/20 dark:bg-accent-green/10 dark:text-accent-green-light dark:border-accent-green/20",
  warning:
    "bg-accent-orange/10 text-accent-orange-dark border border-accent-orange/20 dark:bg-accent-orange/10 dark:text-accent-orange-light dark:border-accent-orange/20",
  danger:
    "bg-accent-pink/10 text-accent-pink-dark border border-accent-pink/20 dark:bg-accent-pink/10 dark:text-accent-pink-light dark:border-accent-pink/20",
  info: "bg-accent-blue/10 text-accent-blue-dark border border-accent-blue/20 dark:bg-accent-blue/10 dark:text-accent-blue-light dark:border-accent-blue/20",
  primary:
    "bg-accent-violet/10 text-accent-violet-dark border border-accent-violet/20 dark:bg-accent-violet/10 dark:text-accent-violet-light dark:border-accent-violet/20",
  violet:
    "bg-accent-violet/10 text-accent-violet-dark border border-accent-violet/20 dark:bg-accent-violet/10 dark:text-accent-violet-light dark:border-accent-violet/20",
  neutral:
    "bg-neutral-100/80 text-neutral-600 border border-neutral-200/80 dark:bg-neutral-800/50 dark:text-neutral-300 dark:border-neutral-700/50",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulseDot?: boolean;
}

export const Badge = ({
  variant = "neutral",
  dot = false,
  pulseDot = false,
  className,
  children,
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 tracking-wide",
      badgeStyles[variant],
      className
    )}
    {...props}
  >
    {dot && (
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", pulseDot && "animate-pulse")} />
    )}
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────
 * Button + helper class (untuk <Link> yang bergaya tombol)
 * ───────────────────────────────────────────────────────────── */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 focus-ring";

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue text-white shadow-soft hover:bg-accent-blue-dark hover:shadow-md active:scale-[0.98] dark:shadow-none",
  secondary:
    "border border-neutral-200 bg-white text-neutral-700 shadow-soft hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white",
  ghost:
    "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
  danger:
    "bg-accent-pink text-white shadow-soft hover:bg-accent-pink-dark active:scale-[0.98] dark:shadow-none",
  success:
    "bg-accent-green text-white shadow-soft hover:bg-accent-green-dark active:scale-[0.98] dark:shadow-none",
  dark:
    "bg-neutral-900 text-white shadow-soft hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100",
};

const btnSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export const btn = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) => cn(btnBase, btnVariants[variant], btnSizes[size], className);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) => <button className={btn(variant, size, className)} {...props} />;

/* ─────────────────────────────────────────────────────────────
 * Card — permukaan utama dengan drop shadow halus
 * ───────────────────────────────────────────────────────────── */
type CardAccentColor =
  | "blue"
  | "violet"
  | "green"
  | "pink"
  | "orange"
  | "teal"
  | "rose"
  | "neutral";

const accentBaseStyle: Record<CardAccentColor, string> = {
  blue: "border-accent-blue/20 shadow-soft",
  violet: "border-accent-violet/20 shadow-soft",
  green: "border-accent-green/20 shadow-soft",
  pink: "border-accent-pink/20 shadow-soft",
  orange: "border-accent-orange/20 shadow-soft",
  teal: "border-accent-teal/20 shadow-soft",
  rose: "border-accent-rose/20 shadow-soft",
  neutral: "border-border-subtle shadow-soft",
};

/* Hover = shadow berwarna sesuai aksen kartu (tanpa outline) */
const accentHoverStyles: Record<CardAccentColor, string> = {
  blue: "hover:shadow-hover-blue",
  violet: "hover:shadow-hover-violet",
  green: "hover:shadow-hover-green",
  pink: "hover:shadow-hover-pink",
  orange: "hover:shadow-hover-orange",
  teal: "hover:shadow-hover-teal",
  rose: "hover:shadow-hover-rose",
  neutral: "hover:shadow-hover-neutral",
};

/* Outline hanya saat kartu dipilih/aktif — warnanya mengikuti aksen kartu */
const accentActiveStyles: Record<CardAccentColor, string> = {
  blue: "border-accent-blue/60 ring-2 ring-accent-blue/45",
  violet: "border-accent-violet/60 ring-2 ring-accent-violet/45",
  green: "border-accent-green/60 ring-2 ring-accent-green/45",
  pink: "border-accent-pink/60 ring-2 ring-accent-pink/45",
  orange: "border-accent-orange/60 ring-2 ring-accent-orange/45",
  teal: "border-accent-teal/60 ring-2 ring-accent-teal/45",
  rose: "border-accent-rose/60 ring-2 ring-accent-rose/45",
  neutral: "border-neutral-300 ring-2 ring-neutral-300/70",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  accentColor?: CardAccentColor;
  elevated?: boolean;
  solidBg?: boolean;
  selected?: boolean;
}

export const Card = ({
  hover = false,
  accentColor = "neutral",
  elevated = false,
  solidBg = true,
  selected = false,
  className,
  ...props
}: CardProps) => (
  <div
    className={cn(
      "rounded-2xl transition-all duration-300 ease-in-out",
      solidBg ? "bg-white dark:bg-neutral-900/70" : "bg-white/70 dark:bg-neutral-900/40",
      accentBaseStyle[accentColor],
      elevated && "shadow-md",
      hover && "card-hover",
      hover && accentHoverStyles[accentColor],
      selected && accentActiveStyles[accentColor],
      className
    )}
    {...props}
  />
);

/* ─────────────────────────────────────────────────────────────
 * PageHeader — judul halaman + deskripsi + aksi
 * ───────────────────────────────────────────────────────────── */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => (
  <div className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-center", className)}>
    <div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
 * Input, Textarea, Select — field konsisten
 * ───────────────────────────────────────────────────────────── */
const fieldBase =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none transition-all duration-200 focus:border-accent-blue/60 focus:bg-white focus:ring-4 focus:ring-accent-blue/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700/80 dark:bg-neutral-800/60 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-accent-blue/60 dark:focus:bg-neutral-800";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[100px] resize-none", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, "cursor-pointer pr-9", className)} {...props} />
));
Select.displayName = "Select";

/* ─────────────────────────────────────────────────────────────
 * FieldLabel — label kecil di atas field
 * ───────────────────────────────────────────────────────────── */
export const FieldLabel = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <label className={cn("text-xs font-semibold text-neutral-500 dark:text-neutral-400", className)}>
    {children}
  </label>
);

/* ─────────────────────────────────────────────────────────────
 * Toggle — switch on/off
 * ───────────────────────────────────────────────────────────── */
interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle = ({ checked, onChange, disabled, className }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-accent-blue" : "bg-neutral-200 dark:bg-neutral-700",
      className
    )}
  >
    <span
      className={cn(
        "inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-300",
        checked ? "translate-x-[24px]" : "translate-x-[3px]"
      )}
    />
  </button>
);

/* ─────────────────────────────────────────────────────────────
 * SegmentedControl — pill switcher (mis. Bulan / Minggu)
 * ───────────────────────────────────────────────────────────── */
interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = ({ options, value, onChange, className }: SegmentedControlProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-0.5 rounded-xl border border-border-subtle bg-neutral-100/80 p-1 dark:border-neutral-700/60 dark:bg-neutral-800",
      className
    )}
  >
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        aria-pressed={value === opt.value}
        className={cn(
          "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-ring",
          value === opt.value
            ? "bg-white text-neutral-900 shadow-soft dark:bg-neutral-700 dark:text-white"
            : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
 * Modal — dialog dengan overlay blur + shadow pop
 * ───────────────────────────────────────────────────────────── */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  maxWidth = "max-w-md",
}: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-3xl bg-white shadow-pop animate-pop-in dark:bg-neutral-900",
          maxWidth
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3.5">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/15 dark:text-accent-blue-light">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {title}
              </h3>
              {description && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Tutup"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
 * StatCard — kartu metrik dengan ikon & delta
 * ───────────────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  delta?: string;
  isPositive?: boolean;
  deltaLabel?: string;
  accentColor?: CardAccentColor;
  className?: string;
}

const statIconColor: Record<CardAccentColor, string> = {
  blue: "bg-accent-blue/10 text-accent-blue ring-accent-blue/20 dark:bg-accent-blue/15 dark:text-accent-blue-light dark:ring-accent-blue/30",
  violet: "bg-accent-violet/10 text-accent-violet ring-accent-violet/20 dark:bg-accent-violet/15 dark:text-accent-violet-light dark:ring-accent-violet/30",
  green: "bg-accent-green/10 text-accent-green ring-accent-green/20 dark:bg-accent-green/15 dark:text-accent-green-light dark:ring-accent-green/30",
  pink: "bg-accent-pink/10 text-accent-pink ring-accent-pink/20 dark:bg-accent-pink/15 dark:text-accent-pink-light dark:ring-accent-pink/30",
  orange: "bg-accent-orange/10 text-accent-orange ring-accent-orange/20 dark:bg-accent-orange/15 dark:text-accent-orange-light dark:ring-accent-orange/30",
  teal: "bg-accent-teal/10 text-accent-teal ring-accent-teal/20 dark:bg-accent-teal/15 dark:text-accent-teal-light dark:ring-accent-teal/30",
  rose: "bg-accent-rose/10 text-accent-rose ring-accent-rose/20 dark:bg-accent-rose/15 dark:text-accent-rose-light dark:ring-accent-rose/30",
  neutral: "bg-neutral-100 text-neutral-500 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700",
};

const statGlow: Record<CardAccentColor, string> = {
  blue: "bg-accent-blue/15",
  violet: "bg-accent-violet/15",
  green: "bg-accent-green/15",
  pink: "bg-accent-pink/15",
  orange: "bg-accent-orange/15",
  teal: "bg-accent-teal/15",
  rose: "bg-accent-rose/15",
  neutral: "bg-neutral-200/70 dark:bg-neutral-800/70",
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  delta,
  isPositive = true,
  accentColor = "blue",
  className,
}: StatCardProps) => (
  <Card accentColor={accentColor} hover className={cn("group relative overflow-hidden p-5", className)}>
    {/* Glow dekoratif di sudut kartu */}
    <div
      className={cn(
        "pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
        statGlow[accentColor]
      )}
    />

    <div className="relative flex items-start justify-between gap-3">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105",
          statIconColor[accentColor]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      {delta && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold tabular-nums",
            isPositive
              ? "bg-accent-green/10 text-accent-green-dark dark:bg-accent-green/15 dark:text-accent-green-light"
              : "bg-accent-pink/10 text-accent-pink-dark dark:bg-accent-pink/15 dark:text-accent-pink-light"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
          )}
          {delta}
        </span>
      )}
    </div>

    {/* Label uppercase di atas, angka besar di bawah */}
    <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
      {title}
    </p>
    <p className="relative mt-1 font-display text-[28px] font-bold leading-none tracking-tight text-neutral-900 tabular-nums dark:text-white">
      {value}
    </p>
  </Card>
);

/* ─────────────────────────────────────────────────────────────
 * LoadingState & EmptyState
 * ───────────────────────────────────────────────────────────── */
export const LoadingState = ({ label = "Memuat data..." }: { label?: string }) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-accent-blue dark:border-neutral-700 dark:border-t-accent-blue-light" />
    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
  </div>
);

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
    {Icon && (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{title}</p>
    {description && (
      <p className="max-w-sm text-xs text-neutral-400 dark:text-neutral-500">{description}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
 * Divider tipis
 * ───────────────────────────────────────────────────────────── */
export const Divider = ({ className }: { className?: string }) => (
  <div className={cn("h-px w-full bg-border-subtle dark:bg-neutral-800", className)} />
);
