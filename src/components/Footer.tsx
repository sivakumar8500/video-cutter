import React from 'react';
import { ShieldCheck, Zap, Scissors, Smartphone, Heart, Sparkles, ExternalLink, Film, Music, Image as ImageIcon, FileText, QrCode, Lock, Info, Mail } from 'lucide-react';
import type { ActiveTab } from './Header';

interface FooterProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (tab: ActiveTab, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(tab);
    }
  };

  const handleLegal = (tab: ActiveTab, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(tab);
    } else {
      window.location.hash = `#${tab}`;
    }
  };

  return (
    <footer aria-label="Site Footer" className="w-full border-t border-slate-200 bg-white mt-16 text-slate-600">
      <h2 className="sr-only">Footer Directory &amp; Navigation</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <a
                href="#home"
                onClick={(e) => handleNav('home', e)}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs shrink-0"
                title="VidCuts Home"
              >
                <img
                  src="./app-icon-small.png"
                  alt="VidCuts App Icon"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-xl drop-shadow"
                />
              </a>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <a
                    href="#home"
                    onClick={(e) => handleNav('home', e)}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    VidCuts
                  </a>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    v2.0
                  </span>
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span>A product of</span>
                  <a
                    href="https://www.reeyanshtech.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-900 hover:text-emerald-600 font-medium transition-colors group cursor-pointer"
                    title="Visit Reeyansh Tech Solutions Official Website (opens in a new tab)"
                  >
                    <img
                      src="./reeyansh-logo-small.png"
                      alt="Reeyansh Tech Solutions Logo"
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span>Reeyansh Tech Solutions</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              VidCuts is engineered by{' '}
              <a
                href="https://www.reeyanshtech.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline decoration-emerald-500/40 hover:decoration-emerald-600 transition-colors inline-flex items-center gap-1"
                title="Visit Reeyansh Tech Solutions Official Website"
              >
                Reeyansh Tech Solutions
                <ExternalLink className="w-3 h-3 inline-block" />
              </a>{' '}
              to give creators full multimedia sovereignty. Process 4K videos, images, 32 PDF workflows, and vector QR codes locally without external servers.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-900 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% In-Browser
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-900 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Zero Lossless Copy
              </span>
            </div>
          </div>

          {/* Crawlable Navigation: Creative Studio Tools */}
          <nav aria-label="Studio Tools" className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Studio Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#video-cutter"
                  onClick={(e) => handleNav('video-cutter', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Video Cutter &amp; Splitter Tool"
                >
                  <Film className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Video Cutter &amp; 9:16 Shorts</span>
                </a>
              </li>
              <li>
                <a
                  href="#media-tools"
                  onClick={(e) => handleNav('media-tools', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="URL Video Downloader, Audio Extractor &amp; Remover"
                >
                  <Music className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Media Tools &amp; Audio Extractor</span>
                </a>
              </li>
              <li>
                <a
                  href="#image-studio"
                  onClick={(e) => handleNav('image-studio', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Image Studio - Aspect Ratio Crop &amp; Shape Mask"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Image Studio &amp; Shape Crop</span>
                </a>
              </li>
              <li>
                <a
                  href="#pdf-studio"
                  onClick={(e) => handleNav('pdf-studio', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="32 Client-Side PDF Tools: Merge, Split, Compress &amp; Protect"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>32 Client-Side PDF Tools</span>
                </a>
              </li>
              <li>
                <a
                  href="#qr"
                  onClick={(e) => handleNav('qr', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Custom Vector QR Code Studio with Logo"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Vector QR Matrix Generator</span>
                </a>
              </li>
              <li>
                <a
                  href="#files"
                  onClick={(e) => handleNav('files', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Local Media &amp; Clips Manager"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Files &amp; Export Manager</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Crawlable Navigation: Core Capabilities & Guides */}
          <nav aria-label="Core Capabilities" className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Capabilities &amp; Sections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNav('home', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="VidCuts Home Suite Overview"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Suite Overview &amp; Motion Hero</span>
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleNav('home', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Feature Breakdown &amp; Performance"
                >
                  <Scissors className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Split by Pieces &amp; Duration</span>
                </a>
              </li>
              <li>
                <a
                  href="#editions"
                  onClick={(e) => handleNav('home', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Suite Editions &amp; Capability Comparison"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>16:9 to 9:16 Shorts Stack</span>
                </a>
              </li>
              <li>
                <a
                  href="#technical-paper"
                  onClick={(e) => handleNav('home', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Technical Specifications &amp; Research"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WASM Architecture Specs</span>
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNav('home', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Frequently Asked Questions"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Privacy &amp; Technical FAQ</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal, Trust & Company Details */}
          <nav aria-label="Legal and Company Information" className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => handleLegal('privacy', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium cursor-pointer"
                  title="Privacy Policy - 100% Client-Side Data Protection"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  onClick={(e) => handleLegal('terms', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium cursor-pointer"
                  title="Terms &amp; Conditions of Service"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Terms &amp; Conditions</span>
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleLegal('about', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium cursor-pointer"
                  title="About Us - Reeyansh Tech Solutions &amp; VidCuts Mission"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleLegal('contact', e)}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium cursor-pointer"
                  title="Contact Us - Technical Support &amp; Inquiries"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 leading-relaxed">
                Hyderabad, Telangana, India
                <br />
                <a
                  href="mailto:contact@reeyanshtech.in"
                  className="text-emerald-600 hover:underline"
                >
                  contact@reeyanshtech.in
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar: Copyright, Legal Navigation & Attribution */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://www.reeyanshtech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-900 hover:text-emerald-600 transition-colors group cursor-pointer"
              title="Visit Reeyansh Tech Solutions Official Website"
            >
              <img
                src="./reeyansh-logo-small.png"
                alt="Reeyansh Tech Solutions Logo"
                width={20}
                height={20}
                className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
              />
              <span>
                &copy; {new Date().getFullYear()} <strong className="text-slate-900 group-hover:text-emerald-600 font-semibold transition-colors">Reeyansh Tech Solutions</strong>.
              </span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Quick Compliance Links */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="hidden sm:inline text-slate-300">•</span>
              <a
                href="#privacy"
                onClick={(e) => handleLegal('privacy', e)}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="#terms"
                onClick={(e) => handleLegal('terms', e)}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Terms
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="#about"
                onClick={(e) => handleLegal('about', e)}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                About Us
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="#contact"
                onClick={(e) => handleLegal('contact', e)}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <a
              href="https://www.reeyanshtech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
              title="Visit Reeyansh Tech Solutions Official Website"
            >
              <span>Reeyansh Tech Solutions</span>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
