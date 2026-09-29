import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Megaphone, ShieldCheck, Wallet } from "lucide-react";
import Logo from "../components/ui/Logo";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "One influencer dashboard",
    description: "Manage your SPOTX partnership, profile, documents, and campaign activity in one place."
  },
  {
    icon: Wallet,
    title: "Clear campaign earnings",
    description: "Track campaign commissions and settlement status from pending through paid."
  },
  {
    icon: ShieldCheck,
    title: "Verified and secure",
    description: "Your identity, bank details, and partnership documents are reviewed securely by SPOTX."
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <Link to="/partner/login" className="text-sm font-semibold text-slate-700 hover:text-brand-black transition">
            Influencer Sign In
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-xs font-semibold tracking-wide uppercase mb-6">
          SPOTX Influencer Partner Panel
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-brand-black tracking-tight leading-tight">
          Grow with SPOTX through your influence
        </h1>
        <p className="text-slate-500 text-lg mt-6 max-w-2xl mx-auto">
          Promote SPOTX to your audience through your own content and channels, manage your partnership,
          and track your campaign earnings from one focused influencer panel.
        </p>
        <div className="flex justify-center mt-10">
          <Link
            to="/partner/register"
            className="inline-flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-charcoal transition"
          >
            Become an Influencer Partner
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="bg-light-grey border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center mb-4">
                <feature.icon size={20} />
              </div>
              <h2 className="font-heading font-bold text-brand-black mb-2">{feature.title}</h2>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Megaphone className="mx-auto text-brand-red mb-4" size={30} />
        <h2 className="font-heading text-2xl font-bold text-brand-black">A partnership built for creators</h2>
        <p className="text-slate-500 mt-3">
          No partner tiers or program selection.
          Just the tools influencers need to promote SPOTX and get paid.
        </p>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} SPOTX. Influencer Partner Panel.</p>
      </footer>
    </div>
  );
}
