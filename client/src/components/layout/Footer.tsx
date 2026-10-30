import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, HeartHandshake, Globe2, QrCode, Lock, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-pb-deep text-pb-light border-t border-pb-emerald/30 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Logo & Core Proposal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-pb-emerald/40">
          {/* Logo & Manifesto */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="inline-block mb-6 bg-white/95 p-3 rounded-2xl shadow-sm">
              <img
                src="/assets/peoplebooks_logo.png"
                alt="PeopleBooks — Real People. Real Stories. Real Connections."
                className="h-12 w-auto object-contain"
              />
            </Link>

            <h3 className="font-serif text-lg font-bold text-white mb-2">
              {t('footer_proposal_title')}
            </h3>
            <p className="text-pb-light/80 text-xs sm:text-sm leading-relaxed max-w-md mb-6 font-sans">
              {t('footer_proposal_desc')}
            </p>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-pb-light/90 space-y-1">
              <div className="font-semibold text-pb-gold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pb-emerald" />
                <span>{t('footer_trust_title')}</span>
              </div>
              <p className="text-[11px] text-pb-light/70 leading-normal">
                {t('footer_trust_desc')}
              </p>
            </div>
          </div>

          {/* How the tool works */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <h4 className="text-xs uppercase tracking-widest font-bold text-pb-gold mb-4">
              {t('footer_how_title')}
            </h4>
            <ul className="space-y-3 text-xs text-pb-light/80">
              <li className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-pb-emerald shrink-0 mt-0.5" />
                <span>{t('footer_how_step_1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-pb-gold shrink-0 mt-0.5" />
                <span>{t('footer_how_step_2')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-pb-emerald shrink-0 mt-0.5" />
                <span>{t('footer_how_step_3')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HeartHandshake className="w-4 h-4 text-pb-gold shrink-0 mt-0.5" />
                <span>{t('footer_how_step_4')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-pb-emerald shrink-0 mt-0.5" />
                <span>{t('footer_how_step_5')}</span>
              </li>
            </ul>
          </div>

          {/* Links & Compliance */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            <h4 className="text-xs uppercase tracking-widest font-bold text-pb-gold mb-4">
              {t('footer_nav_title')}
            </h4>
            <ul className="space-y-2.5 text-xs text-pb-light/80 mb-6">
              <li>
                <Link to="/people" className="hover:text-white transition-colors">
                  Catálogo de Protagonistas
                </Link>
              </li>
              <li>
                <Link to="/volumes" className="hover:text-white transition-colors">
                  Volumes Publicados
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Guia do Leitor & QR Code
                </Link>
              </li>
              <li>
                <Link to="/become-a-story" className="text-pb-gold hover:text-white transition-colors font-semibold">
                  Seja uma História no Próximo Livro
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Sobre a Curadoria Editorial
                </Link>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/10 text-[11px] text-pb-light/60 space-y-1">
              <p>Conformidade com a LGPD e Proteção Internacional de Dados Pessoais.</p>
              <p>Contatos pessoais permanecem protegidos sob custódia segura.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-pb-light/60">
          <p>© {new Date().getFullYear()} PeopleBooks.net. {t('footer_rights')}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              Multilingual Edition (EN • PT • ES)
            </span>
            <span className="font-semibold text-pb-gold">Green Luxury Editorial V4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
