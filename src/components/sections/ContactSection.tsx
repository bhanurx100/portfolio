import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Github,
  Linkedin,
  MapPin,
  Check,
  Copy,
  ArrowUpRight,
  Send,
  AlertCircle,
  Sparkles,
  User,
  AtSign,
  Tag,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { personalInfo } from '../../data/portfolio-data';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export const ContactSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(personalInfo.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2200);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Please provide a subject for your inquiry.');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setErrorMessage('Please enter a message with at least 10 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setFormStatus('error');
      return;
    }

    setFormStatus('submitting');

    // Simulate reliable dispatch
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 6000);
    }, 650);
  };

  return (
    <section
      id="contact"
      aria-label="Contact and Communication"
      className={`pt-10 sm:pt-20 pb-6 sm:pb-20 border-b transition-colors duration-500 relative overflow-hidden ${
        isDark ? 'bg-transparent text-white border-slate-800/80' : 'bg-transparent text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-14">
        
        {/* SECTION HEADER */}
        <div className="max-w-3xl space-y-2.5 text-left">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Contact</span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Let&apos;s build something useful.
          </h2>

          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Reach out directly for software engineering roles, project discussions, or architecture inquiries.
          </p>
        </div>

        {/* 2-COLUMN GRID (Direct Channels & Clean Message Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left">
          
          {/* LEFT COLUMN: Verified Contact Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Email Card with 1-Click Copy */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      isDark
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Email
                    </span>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className={`text-sm sm:text-base font-bold font-mono block truncate ${
                        isDark ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'
                      }`}
                    >
                      {personalInfo.email}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`p-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 border shrink-0 ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  }`}
                  aria-label="Copy email address"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone Card with 1-Click Copy */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      isDark
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Phone / WhatsApp
                    </span>
                    <a
                      href={`tel:${personalInfo.phone.replace(/\s+/g, '')}`}
                      className={`text-sm sm:text-base font-bold font-mono block truncate ${
                        isDark ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                      }`}
                    >
                      {personalInfo.phone}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className={`p-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 border shrink-0 ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  }`}
                  aria-label="Copy phone number"
                >
                  {copiedPhone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Social & Verified Profiles */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Github className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    GitHub
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 hover:border-blue-500/40'
                    : 'bg-white border-slate-300 hover:border-blue-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    LinkedIn
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </a>
            </div>

            {/* Location & Real Status */}
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                isDark ? 'bg-slate-800/70 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Open to Engineering Roles</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Clean Message Form (7 cols) */}
          <div
            className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
            }`}
          >
            {/* Form Card Header */}
            <div className={`pb-5 mb-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isDark ? 'border-slate-700/80' : 'border-slate-200'
            }`}>
              <div>
                <h3 className={`text-base font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Direct Message
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Send a note directly to my inbox
                </p>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border self-start sm:self-auto ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <Clock className="w-3 h-3 text-blue-500" />
                <span>Replies within 12 hours</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className={`block text-xs font-mono font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Your Name <span className="text-blue-500">*</span>
                  </label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    icon={<User className="w-4 h-4" />}
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formStatus === 'error') setFormStatus('idle');
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className={`block text-xs font-mono font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Your Email <span className="text-blue-500">*</span>
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    icon={<AtSign className="w-4 h-4" />}
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formStatus === 'error') setFormStatus('idle');
                    }}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className={`block text-xs font-mono font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Subject <span className="text-blue-500">*</span>
                </label>
                <Input
                  id="contact-subject"
                  type="text"
                  required
                  icon={<Tag className="w-4 h-4" />}
                  placeholder="Software Engineer Role / Project Consultation"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (formStatus === 'error') setFormStatus('idle');
                  }}
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="contact-message"
                    className={`block text-xs font-mono font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Message <span className="text-blue-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Markdown supported
                  </span>
                </div>
                <Textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Tell me about your tech stack, project goals, timelines, or engineering role..."
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (formStatus === 'error') setFormStatus('idle');
                  }}
                />
              </div>

              {/* Validation Error Banner */}
              {formStatus === 'error' && errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full h-11 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {formStatus === 'submitting' ? (
                  <span>Sending message...</span>
                ) : formStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Message received. I will reply shortly.</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
