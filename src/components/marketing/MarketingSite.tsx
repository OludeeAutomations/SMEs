import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CalendarCheck,
  ChartNoAxesCombined,
  Check,
  CircleDollarSign,
  CloudCheck,
  FileCheck,
  FileText,
  House,
  Lightbulb,
  Menu,
  MoreHorizontal,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ScanLine,
  Sparkles,
  UsersRound,
  WalletCards,
  Workflow,
  X,
} from 'lucide-react-native';

const dashboardAsset = require('../../../assets/website/rekoda-home-hero-v3.png');
const dashboardImage = typeof dashboardAsset === 'string' ? dashboardAsset : dashboardAsset?.uri;

type StoreBadgeProps = {
  store: 'apple' | 'google';
};

function AppleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 45 55" className="store-mark store-mark-apple">
      <path
        fill="currentColor"
        d="M43.28027 18.47283c-1.89696 1.21948-6.14255 4.38109-6.18772 10.7043 0 7.49753 5.37473 10.93014 7.36203 11.60763-.36133.76781-2.07763 4.47141-4.33592 7.72336-2.21313 3.11644-4.51658 5.64572-7.6782 6.32321-3.7036.45166-5.5554-1.9873-9.34933-1.9873s-4.65208 1.94214-8.26535 2.07764c-3.61327.1355-5.4199-1.8518-7.81369-4.69725C2.94649 44.66802-.21511 36.04134.01072 28.90514c.1355-6.95554 3.74876-12.6916 9.48482-15.04023 3.2971-1.26464 6.18772-.94848 8.44602-.04516 3.07128 1.17431 4.06493 1.49047 5.87156 1.21948 2.16796-.31616 4.51659-1.89697 7.99435-2.07763 3.8391-.1355 8.53635 1.30981 11.47213 5.51023ZM26.11724 3.07128c-1.67113 1.49047-3.29711 3.61327-4.06492 6.32322-.271 1.08398-.36133 2.12279-.271 3.16161 2.75512.04517 5.14891-.90332 7.36204-2.89062 2.21313-2.21313 3.7036-5.23924 3.5681-9.66549-2.03246.1355-4.60691 1.08398-6.59422 3.07128Z"
      />
    </svg>
  );
}

function GooglePlayMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="store-mark">
      <path fill="#009BFA" d="M7.872 5.12c-.512.512-.832 1.216-.832 1.984v49.728c0 .768.32 1.6.832 2.176l27.392-27.264L7.872 5.12Z" />
      <path fill="#30BA66" d="M44.224 22.784 11.584 4.416c-1.152-.704-2.624-.384-3.712.704l27.392 26.624 8.96-8.96Z" />
      <path fill="#E13A3A" d="M7.872 58.88c.832.896 2.24 1.344 3.648.64l32.768-19.072-9.024-8.704L7.872 58.88Z" />
      <path fill="#FAC504" d="m55.616 29.312-11.392-6.528-8.96 8.96 9.024 8.704 11.392-6.336c1.472-.832 1.664-3.776-.064-4.8Z" />
    </svg>
  );
}

function StoreBadge({ store }: StoreBadgeProps) {
  const apple = store === 'apple';
  return (
    <a className="store-badge" href="#download" aria-label={apple ? 'Download on the App Store' : 'Get it on Google Play'}>
      {apple ? <AppleMark /> : <GooglePlayMark />}
      <span className="store-copy">
        <span className="store-overline">{apple ? 'Download on the' : 'GET IT ON'}</span>
        <span className="store-name">{apple ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  );
}

function AppBottomNavigation() {
  const tabs = [
    { label: 'Home', Icon: House, active: true },
    { label: 'Sales', Icon: ReceiptText },
    { label: 'AI', Icon: Bot },
    { label: 'Reports', Icon: BarChart3 },
    { label: 'More', Icon: MoreHorizontal },
  ];

  return (
    <div className="app-bottom-nav" aria-label="Rekọda app preview navigation">
      {tabs.map(({ label, Icon, active }) => (
        <div className={`app-tab${active ? ' is-active' : ''}`} key={label}>
          <Icon size={14} strokeWidth={active ? 2.4 : 2} color={active ? '#2563EB' : '#94A3B8'} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="phone-stage" aria-label="Rekọda running on an iPhone 16 Pro">
      <div className="phone-glow" />
      <aside className="phone-proof phone-proof-sales">
        <span className="proof-icon proof-icon-blue"><ReceiptText size={16} color="#2563EB" /></span>
        <span><strong>Sales &amp; receipts</strong><small>Record and share instantly</small></span>
      </aside>
      <div className="phone-sway">
        <div className="iphone-shell">
          <span className="device-button action" />
          <span className="device-button volume-up" />
          <span className="device-button volume-down" />
          <span className="device-button side" />
          <div className="iphone-bezel">
            <div className="iphone-screen">
              <img src={dashboardImage} alt="Rekọda business dashboard showing sales, profit, stock and quick actions" />
              <AppBottomNavigation />
            </div>
            <span className="dynamic-island"><i /></span>
          </div>
        </div>
      </div>
      <aside className="phone-proof phone-proof-stock">
        <span className="proof-icon proof-icon-orange"><PackageCheck size={16} color="#F59E0B" /></span>
        <span><strong>Low-stock alerts</strong><small>Restock before you run out</small></span>
      </aside>
    </div>
  );
}

const capabilities = [
  { label: 'Sales', Icon: CircleDollarSign },
  { label: 'Stock', Icon: Boxes },
  { label: 'Expenses', Icon: WalletCards },
  { label: 'Customers', Icon: UsersRound },
  { label: 'Invoices', Icon: FileText },
  { label: 'Reports', Icon: ChartNoAxesCombined },
];

const benefits = [
  'Sales, inventory and expenses',
  'Customers, invoices and receipts',
  'Reports and smart business insights',
  'Secure access across your devices',
  'Priority support when you need it',
];

function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Rekọda home">
        <span className="brand-mark">R</span><span>Rekọda</span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div className="desktop-actions">
        <a className="button button-secondary" href="#contact">Contact</a>
        <a className="button button-primary" href="#features">See features <ArrowDown size={16} /></a>
      </div>
      <button className="mobile-menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#features" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
      )}
    </header>
  );
}

function FeatureCard({ className = '', icon, number, title, body }: { className?: string; icon: React.ReactNode; number?: string; title: string; body: string }) {
  return (
    <article className={`feature-card ${className}`} data-reveal>
      <div className="feature-card-top"><span className="feature-icon">{icon}</span>{number && <span className="feature-number">{number}</span>}</div>
      <h3>{title}</h3><p>{body}</p>
    </article>
  );
}

export function MarketingSite() {
  useEffect(() => {
    document.title = 'Rekọda — Run your business with clarity';
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = 'Track sales, stock, expenses, customers and invoices in one clear business workspace.';

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="marketing-page" id="top">
      <MarketingHeader />

      <main>
        <section className="hero-section">
          <div className="hero-copy" data-reveal>
            <div className="eyebrow"><span />Built for businesses that are building</div>
            <h1>Your business,<br />finally in one<br />clear view.</h1>
            <p>Track sales, stock, expenses, customers and invoices without the spreadsheets—or the guesswork.</p>
            <div className="store-row"><StoreBadge store="apple" /><StoreBadge store="google" /></div>
            <small className="trial-note">Free 30-day trial starts inside the app</small>
          </div>
          <PhoneMockup />
        </section>

        <section className="capability-strip" aria-labelledby="capability-heading">
          <p id="capability-heading">ONE SIMPLE WORKSPACE FOR YOUR WHOLE BUSINESS</p>
          <div className="capability-list">
            {capabilities.map(({ label, Icon }) => <span key={label}><Icon size={19} color="#2563EB" />{label}</span>)}
          </div>
        </section>

        <section className="features-section section" id="features">
          <div className="section-heading split-heading" data-reveal>
            <div><span className="section-kicker">CLARITY, BUILT IN</span><h2>Less admin. More knowing what to do next.</h2></div>
            <p>Rekọda turns the daily work of running a business into useful, timely answers.</p>
          </div>
          <div className="feature-grid">
            <article className="insights-card" data-reveal>
              <div className="insights-copy">
                <span className="feature-icon feature-icon-blue"><Sparkles size={20} color="#fff" /></span>
                <h3>Know what changed—and why.</h3>
                <p>Smart summaries surface what needs your attention, from slow sales to low stock.</p>
              </div>
              <div className="pulse-panel">
                <div className="pulse-header"><strong>Business pulse</strong><span>ON TRACK</span></div>
                <h4>Your best sales day was Thursday.</h4>
                <div className="pulse-stats"><span><small>SALES</small><strong>+18%</strong></span><span><small>LOW STOCK</small><strong>4</strong></span><span><small>DUE</small><strong>₦82k</strong></span></div>
              </div>
            </article>
            <FeatureCard className="fast-sale-card" icon={<ScanLine size={21} color="#2563EB" />} number="01" title="Record a sale before the customer leaves." body="Capture payment, update stock and send a clean receipt in one flow." />
            <FeatureCard className="inventory-card" icon={<Boxes size={20} color="#071524" />} title="Inventory that stays current" body="Low-stock alerts keep your shelves—and your cash—moving." />
            <FeatureCard className="sync-card" icon={<CloudCheck size={20} color="#071524" />} title="Your records, always with you" body="Sign in on another device and continue exactly where you stopped." />
            <FeatureCard className="invoice-card" icon={<FileCheck size={20} color="#071524" />} title="Invoices that look the part" body="Create, share and follow up on professional invoices." />
          </div>
        </section>

        <section className="workflow-section section" id="how-it-works">
          <div className="workflow-copy" data-reveal>
            <span className="workflow-kicker"><Workflow size={17} /> ONE FLOW, NOT FIVE TOOLS</span>
            <h2>From today’s sale to tomorrow’s decision.</h2>
            <p>Record the work once. Rekọda keeps the rest connected, so every number tells the same story.</p>
            <a href="#features">Explore every feature <ArrowRight size={17} color="#C8F35B" /></a>
          </div>
          <div className="workflow-steps">
            {[
              { no: '01', title: 'Record', body: 'Add a sale, expense or stock change while it’s fresh.', Icon: ReceiptText },
              { no: '02', title: 'Rekọda connects it', body: 'Balances, inventory and customer records update together.', Icon: RefreshCw },
              { no: '03', title: 'Decide with clarity', body: 'See what changed, what needs attention and what comes next.', Icon: Lightbulb },
            ].map(({ no, title, body, Icon }) => (
              <article className="workflow-step" key={no} data-reveal>
                <span className="step-number">{no}</span><span className="step-copy"><strong>{title}</strong><small>{body}</small></span><Icon size={22} color="#6E86A0" />
              </article>
            ))}
          </div>
        </section>

        <section className="pricing-section section" id="pricing">
          <div className="pricing-copy" data-reveal>
            <span className="section-kicker">SIMPLE PRICING</span>
            <h2>Take 30 days to see your business more clearly.</h2>
            <p>Explore everything Rekọda can do. No card upfront, no complicated tiers, and no surprise charges.</p>
            <div className="timeline">
              <div><span>1</span><p><small>TODAY</small><strong>Begin your free trial</strong><em>Set up your business and begin recording.</em></p></div>
              <div><span className="muted-dot">30</span><p><small>DAY 30</small><strong>Choose to continue</strong><em>Keep everything for ₦5,000 per month.</em></p></div>
            </div>
          </div>
          <article className="pricing-card" data-reveal>
            <div className="pricing-card-head"><span><strong>Rekọda Pro</strong><small>For growing businesses</small></span><em>EVERYTHING INCLUDED</em></div>
            <div className="price"><strong>₦5,000</strong><span>/ month</span></div>
            <hr />
            <ul>{benefits.map((benefit) => <li key={benefit}><span><Check size={13} color="#059669" /></span>{benefit}</li>)}</ul>
            <div className="trial-card"><span><CalendarCheck size={15} color="#059669" /></span><p><strong>30-day free trial included</strong><small>Pay only if you choose to continue.</small></p></div>
            <small className="pricing-footnote">Cancel anytime. Your records stay exportable.</small>
          </article>
        </section>

        <section className="closing-section" id="download">
          <span className="closing-tag"><Sparkles size={15} color="#C8F35B" /> AVAILABLE ON IOS &amp; ANDROID</span>
          <h2>Run the business. Rekọda will help you read it.</h2>
          <p>Start with the work you already do today. The clarity follows.</p>
          <div className="store-row"><StoreBadge store="apple" /><StoreBadge store="google" /></div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-main">
          <div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark">R</span><span>Rekọda</span></a><p>A clearer way to run and understand your business.</p></div>
          <div className="footer-links">
            <div><strong>Product</strong><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#how-it-works">How it works</a></div>
            <div><strong>Company</strong><a href="#top">About</a><a href="mailto:hello@rekodapp.com">Contact</a><a href="mailto:support@rekodapp.com">Support</a></div>
            <div><strong>Legal</strong><a href="#contact">Privacy</a><a href="#contact">Terms</a><a href="#contact">Security</a></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 Rekọda. Built for the people building businesses.</span><div><a className="social-letter" href="#contact" aria-label="Instagram">ig</a><a className="social-letter" href="#contact" aria-label="LinkedIn">in</a><a className="social-letter" href="#contact" aria-label="X">x</a></div></div>
      </footer>
    </div>
  );
}
