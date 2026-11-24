import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Building,
  Mail,
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe,
  Clock,
  MapPin,
  Send,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Scissors,
  Image as ImageIcon,
  QrCode,
  Music,
} from 'lucide-react';
import type { ActiveTab } from '../Header';

export type LegalPageType = 'privacy' | 'terms' | 'about' | 'contact';

interface LegalPageViewProps {
  page: LegalPageType;
  onNavigate: (tab: ActiveTab) => void;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({ page, onNavigate }) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    const mailtoUrl = `mailto:contact@reeyanshtech.in?subject=${encodeURIComponent(
      `[VidCuts Contact] ${contactSubject} - ${contactName}`
    )}&body=${encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\nSubject: ${contactSubject}\n\nMessage:\n${contactMessage}\n\nSent via VidCuts Web Suite (www.vidcuts.online)`
    )}`;

    window.open(mailtoUrl, '_blank');
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setContactMessage('');
    }, 4000);
  };

  const navTabs: { id: LegalPageType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'about', label: 'About Us', icon: Building },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ];

  const pageTitles: Record<LegalPageType, { title: string; subtitle: string; badge: string }> = {
    privacy: {
      badge: 'Privacy & Data Protection',
      title: 'Privacy Policy',
      subtitle: '100% In-Browser Media Processing Guarantee & Zero Server Storage Policy',
    },
    terms: {
      badge: 'Service Agreement',
      title: 'Terms & Conditions',
      subtitle: 'Usage guidelines, file ownership rights, and platform terms of service',
    },
    about: {
      badge: 'Company & Mission',
      title: 'About VidCuts & Reeyansh Tech',
      subtitle: 'Pioneering private, serverless, client-side multimedia software for creators',
    },
    contact: {
      badge: 'Reach Our Team',
      title: 'Contact Us',
      subtitle: 'Get in touch for technical assistance, feedback, bug reports, and inquiries',
    },
  };

  const currentMeta = pageTitles[page];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-2 sm:py-6">
      {/* Top Breadcrumb & Back Action */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Company &amp; Legal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">{currentMeta.title}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Client-Side Zero-Storage</span>
        </div>
      </nav>

      {/* Page Hero Header: Clean Green & White Theme */}
      <header className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {currentMeta.badge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {currentMeta.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Quick Tabs Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = page === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Card */}
      <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-slate-700 leading-relaxed">
        {/* ========================================================================= */}
        {/* PAGE 1: PRIVACY POLICY */}
        {/* ========================================================================= */}
        {page === 'privacy' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-sm">
            {/* Highlight Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-emerald-950">
                  100% In-Browser Privacy Guarantee
                </h2>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  VidCuts processes all media (videos, images, audio, PDF documents, and QR codes) locally inside your browser memory using WebAssembly. <strong>No bytes of your files are ever uploaded, transmitted, inspected, or retained on any external server.</strong>
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Information We Do NOT Collect
              </h3>
              <p>
                Unlike traditional online video converters or cloud document tools that require you to upload your confidential files to remote servers, VidCuts executes entirely on your device via client-side WebAssembly (FFmpeg WASM, pdf-lib, and HTML5 Canvas).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>We do <strong>not</strong> upload, preview, or store your uploaded video, image, or PDF files.</li>
                <li>We do <strong>not</strong> record your audio, cut timestamps, passwords, or document text.</li>
                <li>We do <strong>not</strong> require user registration, passwords, phone numbers, or credit cards.</li>
                <li>All temporary memory allocations are instantly cleared when you close or refresh your browser tab.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Local Storage &amp; Browser Technologies
              </h3>
              <p>
                VidCuts employs standard web browser technologies (including <code>localStorage</code>, <code>IndexedDB</code>, and the <code>File System Access API</code>) solely on your physical device to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>Save your preferred settings (such as split modes, aspect ratios, or custom naming prefixes).</li>
                <li>Enable local batch file downloads directly to your device storage folder.</li>
              </ul>
              <p className="text-xs text-slate-500">
                These preferences never leave your browser and are not shared with any analytics or tracking providers.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Third-Party Advertising &amp; Google AdSense
              </h3>
              <p>
                To sustain free access to high-performance media tools without subscription walls, VidCuts displays advertisements served by third-party advertising networks, including <strong>Google AdSense</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other sites on the Internet.</li>
                <li>Google&apos;s use of advertising cookies enables it and its partners to serve targeted ads based on your visits across the web.</li>
                <li>
                  Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                  >
                    Google Ads Settings
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                  >
                    AboutAds.info
                  </a>.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Web Performance Analytics
              </h3>
              <p>
                We may collect aggregated, non-personally identifiable diagnostic metrics (such as page visits, browser family, and country level location) to verify server uptime and maintain delivery performance. No personal file data, audio content, or identifiers are logged.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. Privacy Inquiries &amp; Data Protection Officer
              </h3>
              <p>
                For any questions or compliance inquiries regarding this Privacy Policy, please reach out directly:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-1.5 font-mono text-slate-800">
                <div><strong>Organization:</strong> Reeyansh Tech Solutions</div>
                <div><strong>Email:</strong> <a href="mailto:support@reeyanshtech.in" className="text-emerald-600 font-bold hover:underline">support@reeyanshtech.in</a></div>
                <div><strong>Location:</strong> Hyderabad, Telangana, India</div>
                <div><strong>Effective Date:</strong> November 2026</div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: TERMS & CONDITIONS */}
        {/* ========================================================================= */}
        {page === 'terms' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-sm">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h2 className="text-base font-bold text-slate-900">Terms of Service Agreement</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                By accessing and using <strong>VidCuts</strong> (accessible at <a href="https://www.vidcuts.online" className="text-emerald-600 font-semibold hover:underline">www.vidcuts.online</a>), you accept and agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our services.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. License &amp; Permitted Use
              </h3>
              <p>
                VidCuts grants you a free, non-exclusive, revocable license to access and use our browser-based multimedia suite for personal, educational, creative, and commercial projects. You may cut videos, crop photos, merge and convert PDFs, and generate QR codes without licensing fees.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Intellectual Property &amp; File Ownership
              </h3>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium">
                <strong>You retain 100% intellectual property ownership, copyright, and control of all files processed with VidCuts.</strong> We make zero claim to any video, audio, image, document, or QR code data produced through our client-side software.
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Prohibited Uses
              </h3>
              <p>You agree not to use VidCuts to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>Process or distribute illegal, sexually abusive, threatening, or copyright-infringing content.</li>
                <li>Attempt to attack, overwhelm, reverse engineer, or exploit the platform delivery CDN.</li>
                <li>Bypass or attempt to bypass any security restrictions or service protections.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Disclaimer of Warranties
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                VidCuts is provided strictly on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. Although we use state-of-the-art WebAssembly compilers and sandboxed processing, Reeyansh Tech Solutions does not warrant that tool performance will be completely uninterrupted or compatible with damaged, corrupt, or non-standard proprietary codecs.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. Limitation of Liability
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                In no event shall Reeyansh Tech Solutions, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use the suite, including loss of data or hardware performance issues.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                6. Governing Law &amp; Jurisdiction
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                These Terms shall be governed by and construed in accordance with the laws of Telangana, India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.
              </p>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: ABOUT US */}
        {/* ========================================================================= */}
        {page === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                  About VidCuts
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Empowering Creators with Sovereign, Serverless Multimedia Tools
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  VidCuts was engineered by <strong>Reeyansh Tech Solutions</strong> to solve a persistent dilemma in modern digital tools: why should everyday creators, students, and businesses be forced to upload sensitive personal photos, videos, or confidential documents to third-party cloud servers just to perform basic cuts, crops, or PDF operations?
                </p>
              </div>

              <div className="md:col-span-4 p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3 shadow-xs">
                <img
                  src="./reeyansh-logo-small.png"
                  alt="Reeyansh Tech Solutions Logo"
                  title="Reeyansh Tech Solutions Logo"
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 mx-auto object-contain"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Reeyansh Tech Solutions</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    High-performance software &amp; web technology lab
                  </p>
                </div>
                <a
                  href="https://www.reeyanshtech.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Visit Reeyansh Tech</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Local WebAssembly</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We compile industry-standard C/C++ audio and video libraries (including FFmpeg) directly into WebAssembly so heavy decoding runs directly on your device CPU/GPU.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Zero Cloud Storage</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero upload queues. Zero server vulnerabilities. Zero account restrictions. Your content stays strictly inside your device RAM from start to finish.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Cross-Platform Reach</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engineered to work seamlessly across Android smartphones, iPhones, iPads, Windows, Mac, and Linux laptops with zero installation required.
                </p>
              </div>
            </div>

            {/* Detailed Company Section */}
            <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-base font-bold text-slate-900">About Reeyansh Tech Solutions</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Headquartered in Hyderabad, Telangana, India, Reeyansh Tech Solutions builds modern web products that prioritize user data sovereignty, instantaneous client-side performance, and accessible creator workflows. VidCuts represents our flagship free-to-use suite bringing desktop-grade video, image, document, and matrix capabilities directly to the browser.
              </p>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: CONTACT US */}
        {/* ========================================================================= */}
        {page === 'contact' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Contact Details Column */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Direct Contact Information</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Have questions, suggestions, bug reports, or partnership opportunities? Reach out to our technical team:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-900 block text-sm">Support &amp; Inquiries Email</span>
                      <a href="mailto:contact@reeyanshtech.in" className="text-emerald-600 font-mono font-bold hover:underline block">
                        contact@reeyanshtech.in
                      </a>
                      <a href="mailto:support@reeyanshtech.in" className="text-emerald-600 font-mono font-bold hover:underline block">
                        support@reeyanshtech.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <Building className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-900 block text-sm">Engineering Company</span>
                      <a
                        href="https://www.reeyanshtech.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-800 hover:text-emerald-600 font-semibold inline-flex items-center gap-1.5"
                      >
                        <span>Reeyansh Tech Solutions</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-900 block text-sm">Corporate Office</span>
                      <span className="text-slate-600">Hyderabad, Telangana, India</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-900 block text-sm">Response Time</span>
                      <span className="text-slate-600">Typically within 24 to 48 business hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Contact Form Column */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-slate-50/90 border border-slate-200 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Send a Direct Message</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Complete this form to quickly send an email directly to our engineering desk.
                  </p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Email Address *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Topic</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 cursor-pointer shadow-2xs"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bug Report">Bug Report / Processing Error</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Privacy / Compliance">Privacy &amp; Data Compliance</option>
                      <option value="Business & Partnership">Business &amp; Advertising Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please provide details of your inquiry, feedback, or technical issue..."
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 resize-none shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Support</span>
                  </button>

                  {formSent && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Thank you! Your default email client has been prepared with your inquiry.</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Quick Access to Creative Tools Bar */}
      <section className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Explore VidCuts Free Client-Side Tools</h3>
            <p className="text-xs text-slate-600">Start editing media locally with zero file uploads</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            View All Features &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('video-cutter')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-xs font-bold cursor-pointer shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Video Cutter</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('media-tools')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-xs font-bold cursor-pointer shadow-2xs"
          >
            <Music className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Media Tools</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('image-tools')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-xs font-bold cursor-pointer shadow-2xs"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Image Editor</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('pdf-tools')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-xs font-bold cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>32 PDF Tools</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('qr-code-generator')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-xs font-bold cursor-pointer shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>QR Code</span>
          </button>
        </div>
      </section>
    </div>
  );
};
