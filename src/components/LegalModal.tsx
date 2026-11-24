import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'about' | 'contact';

interface LegalModalProps {
  initialTab?: LegalTab;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  initialTab = 'privacy',
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [formSent, setFormSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    // Construct mailto link as fallback
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900">
                VidCuts Information &amp; Legal Center
              </h2>
              <p className="text-xs text-slate-600">
                Reeyansh Tech Solutions • Official Policies &amp; Contact Details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 overflow-x-auto gap-2">
          {[
            { id: 'privacy' as LegalTab, label: 'Privacy Policy', icon: Lock },
            { id: 'terms' as LegalTab, label: 'Terms & Conditions', icon: FileText },
            { id: 'about' as LegalTab, label: 'About Us', icon: Building },
            { id: 'contact' as LegalTab, label: 'Contact Us', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
          {/* ========================================================================= */}
          {/* TAB 1: PRIVACY POLICY */}
          {/* ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950">
                    100% Client-Side Privacy Guarantee
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    VidCuts processes all multimedia (videos, photos, audio tracks, legal documents, and QR codes) locally inside your browser memory using WebAssembly (FFmpeg WASM &amp; PDF engines). <strong>Zero bytes of your files are ever transmitted, saved, or inspected on our servers.</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Information We Do NOT Collect</h3>
                <p>
                  Because VidCuts operates as a client-side WebAssembly application:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>We do not upload or store your uploaded video, image, or PDF files.</li>
                  <li>We do not record your audio, video cut ranges, passwords, or document content.</li>
                  <li>We do not require account registration, passwords, or credit card numbers to use our suite.</li>
                  <li>All temporary memory allocations are wiped clean when you refresh or close your browser tab.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Local Storage &amp; Cookies</h3>
                <p>
                  VidCuts uses standard browser storage technologies (such as <code>localStorage</code> and <code>IndexedDB</code>) strictly on your device to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Store your local offline tool configurations and theme preferences.</li>
                  <li>Allow local temporary export of generated clips through the browser File System API.</li>
                </ul>
                <p className="text-xs">
                  We do not use tracking cookies to track your behavior across other websites.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Third-Party Services &amp; Advertising</h3>
                <p>
                  To keep VidCuts 100% free for everyone around the world, we may display unobtrusive advertisements served by verified advertising partners, such as <strong>Google AdSense</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Third-party vendors, including Google, use cookies to serve ads based on prior visits to this or other websites.</li>
                  <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</li>
                  <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-semibold">Google Ads Settings</a>.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Web Analytics</h3>
                <p>
                  We may collect aggregated, non-personally identifiable metrics (such as page view counts, browser type, and country of origin) to maintain server health and improve software performance. No personal file data or identifiers are ever logged.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">5. Contact Regarding Privacy</h3>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our legal and data protection team:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
                  <div><strong>Company:</strong> Reeyansh Tech Solutions</div>
                  <div><strong>Email:</strong> <a href="mailto:support@reeyanshtech.in" className="text-emerald-600 font-bold">support@reeyanshtech.in</a></div>
                  <div><strong>Website:</strong> <a href="https://www.reeyanshtech.in/" target="_blank" rel="noopener noreferrer" className="text-emerald-600">https://www.reeyanshtech.in/</a></div>
                  <div><strong>Last Updated:</strong> November 2026</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TERMS & CONDITIONS */}
          {/* ========================================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-base font-bold text-slate-900">Terms of Service Agreement</h3>
                <p className="text-xs text-slate-600">
                  By accessing and using <strong>VidCuts</strong> (accessible at <a href="https://www.vidcuts.online" className="text-emerald-600 font-semibold">www.vidcuts.online</a>), you agree to be bound by these Terms &amp; Conditions.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">1. License &amp; Permitted Use</h4>
                <p>
                  VidCuts provides free, browser-based multimedia tools for personal, educational, and commercial purposes. You are free to cut videos, edit photos, process PDF documents, and generate QR codes for any lawful purpose.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">2. Intellectual Property &amp; File Ownership</h4>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                  <strong>You retain 100% ownership, copyright, and control of all media, documents, and content you process.</strong> VidCuts and Reeyansh Tech Solutions make no claim of ownership over any files created or modified with our tools.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">3. Prohibited Conduct</h4>
                <p>When using VidCuts, you agree not to:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Use the suite to process, distribute, or create illegal, harmful, or copyright-infringing material.</li>
                  <li>Attempt to disrupt, reverse-engineer, or maliciously overload our client-side delivery infrastructure.</li>
                  <li>Circumvent any security or access controls implemented on the platform.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">4. Disclaimer of Warranties</h4>
                <p className="text-xs">
                  VidCuts is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we employ rigorous client-side WASM sandboxing, Reeyansh Tech Solutions does not guarantee that file processing will be uninterrupted, error-free, or compatible with corrupt or proprietary non-standard file codecs.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">5. Limitation of Liability</h4>
                <p className="text-xs">
                  In no event shall Reeyansh Tech Solutions or its developers be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools, including loss of data or hardware performance.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">6. Governing Law</h4>
                <p className="text-xs">
                  These Terms shall be governed by and construed in accordance with the laws of Telangana, India, without regard to conflict of law provisions.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ABOUT US */}
          {/* ========================================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                    Who We Are
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Empowering Creators with Sovereign, Serverless Multimedia Tools
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <strong>VidCuts</strong> was built to solve a modern internet problem: why should users have to upload sensitive personal photos, videos, or confidential legal documents to third-party cloud servers just to cut a 30-second clip, crop into a shape, or merge two PDFs?
                  </p>
                </div>

                <div className="md:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <img
                    src="./reeyansh-logo-small.png"
                    alt="Reeyansh Tech Solutions"
                    className="w-12 h-12 mx-auto object-contain"
                  />
                  <h4 className="text-sm font-extrabold text-slate-900">Reeyansh Tech Solutions</h4>
                  <p className="text-[11px] text-slate-600">
                    High-performance web applications &amp; media engineering lab.
                  </p>
                  <a
                    href="https://www.reeyanshtech.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Local WebAssembly</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    We compile C/C++ libraries (including FFmpeg) directly into WebAssembly so heavy media decoding executes on your CPU/GPU hardware.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Privacy by Design</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    No backend storage. No user accounts required. Your files remain exclusively in your computer&apos;s physical RAM.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Universal Access</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Designed to work seamlessly across Android, iPhone, Windows, Mac, and Linux on any modern web browser.
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Organization Background</h4>
                <p className="text-slate-600 leading-relaxed">
                  VidCuts is developed and maintained by <strong>Reeyansh Tech Solutions</strong>, headquartered in Hyderabad, Telangana, India. Our team focuses on engineering privacy-preserving developer tools, multimedia utilities, and next-generation web software.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CONTACT US */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Contact Information Column */}
                <div className="md:col-span-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Get In Touch</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Have questions, feedback, bug reports, or partnership opportunities? We&apos;d love to hear from you.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">General &amp; Support Email</span>
                        <a href="mailto:contact@reeyanshtech.in" className="text-emerald-600 font-mono font-semibold hover:underline">
                          contact@reeyanshtech.in
                        </a>
                        <br />
                        <a href="mailto:support@reeyanshtech.in" className="text-emerald-600 font-mono font-semibold hover:underline">
                          support@reeyanshtech.in
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">Parent Company</span>
                        <a
                          href="https://www.reeyanshtech.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:text-emerald-600 font-medium inline-flex items-center gap-1"
                        >
                          <span>Reeyansh Tech Solutions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">Location</span>
                        <span className="text-slate-600">Hyderabad, Telangana, India</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">Response Time</span>
                        <span className="text-slate-600">Typically within 24 to 48 business hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Message Form Column */}
                <div className="md:col-span-7 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">Send Us a Direct Message</h4>
                    <p className="text-[11px] text-slate-600">
                      Fill out this form to send a quick email to our engineering and support team.
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Email *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Bug Report">Bug Report / Tool Issue</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Privacy / Compliance">Privacy &amp; Compliance</option>
                        <option value="Business & Partnership">Business &amp; Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please write your questions, feedback, or issue details here..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-900 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message to Support</span>
                    </button>

                    {formSent && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Email client opened! Thank you for reaching out.</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>&copy; {new Date().getFullYear()} Reeyansh Tech Solutions • All Rights Reserved</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
