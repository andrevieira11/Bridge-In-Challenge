import Link from 'next/link'
import {
  Shield,
  Link2,
  BarChart3,
  BellRing,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Mail,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-teal" />
            </div>
            <span className="text-navy font-bold text-lg">BridgeIn</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal border border-teal/20 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>EU Directive 2019/1937</span>
            <span className="w-1 h-1 rounded-full bg-teal/40" />
            <span>Whistleblower Protection Act</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 text-balance">
            Whistleblowing infrastructure
            <span className="text-teal"> for modern companies.</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10">
            Give your employees a safe, anonymous way to report concerns.
            Meet your legal obligations without the inbox chaos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Set up your workspace
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 hover:text-white">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-teal text-sm font-semibold uppercase tracking-wider mb-3">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              The shared inbox isn&apos;t a compliance solution.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Most companies handle whistleblowing via email. It&apos;s messy, legally risky, and employees know it.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                iconBg: 'bg-red-50',
                iconColor: 'text-red-500',
                title: 'Reports get buried',
                body: 'Compliance emails sit in someone\'s inbox between meeting invites and newsletters. There\'s no tracking, no status, no audit trail.',
              },
              {
                icon: AlertTriangle,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-500',
                title: 'Employees don\'t trust it',
                body: 'When the "anonymous" channel is just an email to HR, employees know their identity isn\'t truly protected. Reports don\'t come in.',
              },
              {
                icon: Clock,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-500',
                title: 'You\'re exposed to fines',
                body: 'EU Directive 2019/1937 mandates a proper internal reporting channel. Non-compliance penalties start at €30,000 in several member states.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-teal text-sm font-semibold uppercase tracking-wider mb-3">The solution</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Simple for managers. Safe for employees.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Manager steps */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
                For managers & administrators
              </p>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Create your workspace',
                    body: 'Sign up with your work email and company name. Takes about two minutes.',
                  },
                  {
                    step: '02',
                    title: 'Share your unique link',
                    body: 'You get a tamper-proof magic link unique to your company. Send it via email, intranet, or handbook.',
                  },
                  {
                    step: '03',
                    title: 'Manage incoming reports',
                    body: 'Review reports in your dashboard, update their status, and receive email notifications the moment one arrives.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-navy text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-navy mb-1">{item.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee steps */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
                For employees
              </p>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Open the link — no login needed',
                    body: 'Employees click the link shared by their company. No account, no app, no login.',
                  },
                  {
                    step: '02',
                    title: 'Fill out the form',
                    body: 'Describe the issue, choose a category, and decide whether to stay anonymous or leave contact details.',
                  },
                  {
                    step: '03',
                    title: 'Submit and move on',
                    body: 'The report is delivered securely to the designated administrator. No trace left in the employee\'s account.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-teal text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-navy mb-1">{item.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Built for the job. Not bolted on.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every feature has a reason to exist.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: EyeOff,
                title: 'Anonymous by default',
                body: 'Submissions require no login. IP addresses are never logged. Employees choose if they want to be contacted.',
              },
              {
                icon: Link2,
                title: 'One link per company',
                body: 'Each workspace gets a unique, unguessable magic link. Reports are automatically routed to the right manager.',
              },
              {
                icon: BarChart3,
                title: 'Status tracking',
                body: 'Move reports through New → In Review → Resolved → Closed. Full history preserved for audit purposes.',
              },
              {
                icon: BellRing,
                title: 'Email notifications',
                body: 'Get notified the moment a report is submitted. No need to check the dashboard manually.',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center mb-4 border border-teal/10">
                    <Icon className="w-4 h-4 text-teal" />
                  </div>
                  <h3 className="font-semibold text-navy text-sm mb-2">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Compliance callout */}
      <section className="py-16 px-6 bg-navy">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal border border-teal/20 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <CheckCircle className="w-3.5 h-3.5" />
            EU Directive 2019/1937 — Whistleblower Protection
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Companies with 50+ employees are legally required to have an internal reporting channel.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xl mx-auto">
            The EU Whistleblowing Directive has been in force since December 2021.
            If you don&apos;t have a proper channel in place, you&apos;re exposed — and so are the individuals who didn&apos;t set one up.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">Ready to get compliant?</h2>
          <p className="text-gray-500 mb-8">
            Set up your company&apos;s reporting channel in under 5 minutes. No credit card.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create your workspace
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-navy rounded flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-teal" />
            </div>
            <span className="font-semibold text-navy">BridgeIn</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-navy transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-navy transition-colors">Sign up</Link>
          </div>
          <p className="text-xs">
            Built for EU Directive 2019/1937 compliance.
          </p>
        </div>
      </footer>
    </div>
  )
}
