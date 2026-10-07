import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "./Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="page-bg-auth relative flex min-h-screen items-center justify-center overflow-hidden p-6 font-sans transition-colors duration-500 dark:bg-surface-dark">
      {/* Garis aksen atas */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-blue/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mb-7 inline-flex justify-center focus-ring rounded-2xl">
            <Logo iconSize={46} />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>

        <div className="rounded-3xl border border-border-subtle bg-white/80 p-8 shadow-card backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
          {children}
        </div>

        {footer && <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-300">{footer}</div>}
      </motion.div>
    </div>
  );
};
