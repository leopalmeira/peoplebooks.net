import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut, ChevronDown, Shield, Bookmark, Newspaper, PenTool, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-pb-white/95 backdrop-blur-md border-b border-pb-line">
      {/* Dev Mode Bar */}
      <div className="bg-pb-deep text-pb-light text-[11px] sm:text-xs py-1.5 px-4 font-sans flex items-center justify-between border-b border-pb-emerald/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pb-emerald animate-pulse shrink-0"></span>
          <span className="font-semibold text-pb-gold uppercase tracking-wider text-[10px] sm:text-xs">
            {t('nav_demo_env')}
          </span>
          <span className="hidden sm:inline text-pb-light/60">•</span>
          <span className="hidden sm:inline text-pb-light/80">
            {t('nav_current_role')}: <strong className="text-white uppercase">{user ? user.role : t('nav_visitor_role')}</strong>
            {user && ` (${user.name})`}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDevMenuOpen(!devMenuOpen)}
            className="flex items-center gap-1 text-[11px] bg-pb-emerald/30 hover:bg-pb-emerald/50 px-2.5 py-0.5 rounded text-white transition-colors"
          >
            <span>{t('nav_simulate_user')}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {devMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-pb-white text-pb-text rounded-xl shadow-editorial border border-pb-line p-2 text-xs font-sans z-50 animate-in fade-in">
              <div className="font-semibold text-pb-muted px-2 py-1 uppercase tracking-wider text-[10px]">
                {t('nav_switch_test_accounts')}
              </div>
              <button
                onClick={() => { quickSwitch('reader'); setDevMenuOpen(false); }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-pb-light/60 flex flex-col transition-colors"
              >
                <span className="font-semibold text-pb-deep">{t('nav_role_reader')}</span>
                <span className="text-[11px] text-pb-muted">Volume 01</span>
              </button>
              <button
                onClick={() => { quickSwitch('participant'); setDevMenuOpen(false); }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-pb-light/60 flex flex-col transition-colors"
              >
                <span className="font-semibold text-pb-deep">{t('nav_role_author')}</span>
                <span className="text-[11px] text-pb-muted">Author Studio & Journal</span>
              </button>
              <button
                onClick={() => { quickSwitch('admin'); setDevMenuOpen(false); }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-pb-light/60 flex flex-col transition-colors"
              >
                <span className="font-semibold text-pb-deep">{t('nav_role_admin')}</span>
                <span className="text-[11px] text-pb-muted">Admin / Curatorship</span>
              </button>
              <div className="border-t border-pb-line my-1"></div>
              <button
                onClick={() => { quickSwitch('visitor'); setDevMenuOpen(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-700 transition-colors"
              >
                {t('nav_role_visitor')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-4">
        {/* Brand Official Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/assets/peoplebooks_logo.png"
            alt="PeopleBooks — Real People. Real Stories. Real Connections."
            className="h-10 sm:h-12 w-auto object-contain transition-transform hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-pb-text/80">
          <Link
            to="/people"
            className={`transition-colors hover:text-pb-primary ${
              isActive('/people') ? 'text-pb-emerald font-semibold' : ''
            }`}
          >
            {t('nav_stories')}
          </Link>
          <Link
            to="/volumes"
            className={`transition-colors hover:text-pb-primary ${
              isActive('/volumes') ? 'text-pb-emerald font-semibold' : ''
            }`}
          >
            {t('nav_volumes')}
          </Link>
          <Link
            to="/how-it-works"
            className={`transition-colors hover:text-pb-primary ${
              isActive('/how-it-works') ? 'text-pb-emerald font-semibold' : ''
            }`}
          >
            {t('nav_how_it_works')}
          </Link>
          <Link
            to="/become-a-story"
            className={`font-semibold transition-colors hover:text-pb-primary ${
              isActive('/become-a-story') ? 'text-pb-emerald underline underline-offset-4' : 'text-pb-deep'
            }`}
          >
            {t('nav_become_a_story')}
          </Link>
        </nav>

        {/* Right Actions Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          {/* 3-Language Segmented Switcher (EN default, PT, ES) */}
          <div className="flex items-center rounded-lg border border-pb-line bg-pb-bg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-pb-emerald text-white shadow-xs'
                  : 'text-pb-muted hover:text-pb-text'
              }`}
              title="English (Default)"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('pt-BR')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'pt-BR'
                  ? 'bg-pb-emerald text-white shadow-xs'
                  : 'text-pb-muted hover:text-pb-text'
              }`}
              title="Português"
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'es'
                  ? 'bg-pb-emerald text-white shadow-xs'
                  : 'text-pb-muted hover:text-pb-text'
              }`}
              title="Español"
            >
              ES
            </button>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-pb-line hover:border-pb-emerald/40 bg-pb-white transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-pb-light text-pb-deep font-bold text-xs flex items-center justify-center">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold max-w-[110px] truncate text-pb-text">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-pb-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-pb-white rounded-2xl shadow-editorial border border-pb-line p-2 text-sm z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-pb-line/60 mb-1">
                    <p className="font-semibold text-pb-text truncate">{user.name}</p>
                    <p className="text-xs text-pb-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pb-light text-pb-deep">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/library"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-pb-text hover:bg-pb-light/60 transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-pb-primary" />
                    <span>{t('nav_library')}</span>
                  </Link>

                  <Link
                    to="/my-feed"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-pb-text hover:bg-pb-light/60 transition-colors"
                  >
                    <Newspaper className="w-4 h-4 text-pb-primary" />
                    <span>{t('nav_feed')}</span>
                  </Link>

                  {(user.role === 'participant' || user.role === 'admin') && (
                    <Link
                      to="/studio"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-pb-text hover:bg-pb-light/60 transition-colors"
                    >
                      <PenTool className="w-4 h-4 text-pb-gold" />
                      <span className="font-medium text-pb-deep">{t('nav_studio')}</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-pb-text hover:bg-pb-light/60 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-pb-emerald" />
                      <span className="font-medium text-pb-deep">{t('nav_admin')}</span>
                    </Link>
                  )}

                  <div className="border-t border-pb-line/60 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-pb-line text-pb-text hover:bg-pb-bg transition-colors"
              >
                {t('nav_login')}
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-pb-emerald text-pb-white hover:bg-pb-primary transition-all shadow-sm"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls (3-Language Switcher + Hamburger) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center rounded-lg border border-pb-line bg-pb-bg p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'en' ? 'bg-pb-emerald text-white' : 'text-pb-muted'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('pt-BR')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'pt-BR' ? 'bg-pb-emerald text-white' : 'text-pb-muted'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'es' ? 'bg-pb-emerald text-white' : 'text-pb-muted'
              }`}
            >
              ES
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-pb-line text-pb-text hover:bg-pb-bg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-pb-line bg-pb-white px-4 py-6 space-y-4 animate-in slide-in-from-top">
          <nav className="flex flex-col space-y-3 font-medium text-sm">
            <Link
              to="/people"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-pb-bg"
            >
              {t('nav_stories')}
            </Link>
            <Link
              to="/volumes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-pb-bg"
            >
              {t('nav_volumes')}
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-pb-bg"
            >
              {t('nav_how_it_works')}
            </Link>
            <Link
              to="/become-a-story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-pb-bg font-semibold text-pb-emerald"
            >
              {t('nav_become_a_story')}
            </Link>
          </nav>

          <div className="pt-4 border-t border-pb-line">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-pb-bg rounded-xl">
                  <p className="font-bold text-xs text-pb-text">{user.name}</p>
                  <p className="text-[11px] text-pb-muted">{user.email}</p>
                </div>
                <Link
                  to="/library"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm"
                >
                  <Bookmark className="w-4 h-4 text-pb-primary" />
                  <span>{t('nav_library')}</span>
                </Link>
                <Link
                  to="/my-feed"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm"
                >
                  <Newspaper className="w-4 h-4 text-pb-primary" />
                  <span>{t('nav_feed')}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-pb-deep font-semibold"
                  >
                    <Shield className="w-4 h-4 text-pb-emerald" />
                    <span>{t('nav_admin')}</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav_logout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-xl border border-pb-line"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-xl bg-pb-emerald text-white"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
