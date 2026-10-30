import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Heart, Users, Globe2, Compass, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Book3D } from '../../components/book/Book3D.js';
import { api } from '../../services/api.js';
import { Participant, Volume } from '../../types/index.js';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [featuredPeople, setFeaturedPeople] = useState<Participant[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [peopleRes, volsRes] = await Promise.all([
          api.getPeople({ limit: '4' }),
          api.getVolumes(),
        ]);
        if (peopleRes.success) {
          setFeaturedPeople(
            peopleRes.data.people
              .filter((p: Participant) => p.isFeatured || p.primaryVolumeId === '01')
              .slice(0, 4)
          );
        }
        if (volsRes.success) setVolumes(volsRes.data);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { title: 'Empreendedorismo', en: 'Entrepreneurship', icon: Compass },
    { title: 'Arte & Cultura', en: 'Art & Culture', icon: Layers },
    { title: 'Literatura & Educação', en: 'Literature & Education', icon: BookOpen },
    { title: 'Sustentabilidade', en: 'Sustainability', icon: Globe2 },
    { title: 'Desenvolvimento Pessoal', en: 'Personal Growth', icon: Heart },
    { title: 'História & Raízes', en: 'History & Roots', icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Sober, Luxurious & Transparent Book Mockup) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EDF5F1] via-[#F4F9F6] to-pb-bg pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Literary Manifesto & Sober Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pb-emerald/10 text-pb-deep text-[11px] font-bold tracking-widest uppercase mb-5 border border-pb-emerald/15">
                <span className="w-1.5 h-1.5 rounded-full bg-pb-emerald"></span>
                <span>{t('hero_eyebrow')}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-pb-text leading-[1.12] mb-5">
                {t('hero_title_1')}{' '}
                <span className="italic font-serif font-normal text-pb-emerald block sm:inline">
                  {t('hero_title_2')}
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-pb-muted leading-relaxed max-w-2xl mb-8 font-sans font-normal">
                {t('hero_subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10 w-full sm:w-auto">
                <Link
                  to="/people"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <span>{t('hero_btn_explore')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/volumes"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-pb-line hover:border-pb-emerald/40 bg-pb-white text-pb-text text-sm font-semibold shadow-sm transition-all hover:bg-pb-bg"
                >
                  <BookOpen className="w-4 h-4 text-pb-gold" />
                  <span>{t('hero_btn_volumes')}</span>
                </Link>
              </div>

              {/* Verified Editorial Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-pb-line/80 w-full max-w-lg">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-pb-deep">24</div>
                  <div className="text-xs text-pb-muted font-medium">{t('hero_stat_people')}</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-pb-deep">03</div>
                  <div className="text-xs text-pb-muted font-medium">{t('hero_stat_volumes')}</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-pb-gold">100%</div>
                  <div className="text-xs text-pb-muted font-medium">{t('hero_stat_stories')}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Transparent 3D Book Cutout */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full flex flex-col items-center">
                {/* 3D Book - 100% transparent PNG with natural drop shadow */}
                <Book3D
                  coverUrl="/assets/cover.png"
                  title={t('hero_book_title')}
                  subtitle="Volume 01"
                  size="lg"
                />

                <div className="text-center mt-3">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-pb-gold block">
                    {t('hero_book_vol')}
                  </span>
                  <p className="font-serif text-base sm:text-lg font-bold text-pb-text mt-0.5">
                    {t('hero_book_title')}
                  </p>
                  <p className="text-xs text-pb-muted">
                    {t('hero_book_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED STORIES */}
      <section className="py-16 sm:py-20 bg-pb-white border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
                {t('sec_featured_title')}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-pb-text">
                {t('sec_featured_heading')}
              </h2>
              <p className="text-xs sm:text-sm text-pb-muted mt-1 max-w-xl">
                {t('sec_featured_sub')}
              </p>
            </div>

            <Link
              to="/people"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pb-emerald hover:text-pb-primary transition-colors"
            >
              <span>{t('sec_featured_view_all')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPeople.map((person) => (
              <Link
                key={person.id}
                to={`/people/${person.slug}`}
                className="group flex flex-col bg-pb-bg rounded-2xl border border-pb-line overflow-hidden hover:shadow-editorial hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-pb-white/90 backdrop-blur-sm text-pb-deep text-[11px] font-bold px-2.5 py-1 rounded-full border border-pb-line">
                    Vol. {person.primaryVolumeId} • #{person.number}
                  </div>
                  <div className="absolute top-3 right-3 bg-pb-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {person.tag}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-pb-muted mb-1">{person.city}, {person.country}</div>
                    <h3 className="font-serif text-xl font-bold text-pb-text group-hover:text-pb-emerald transition-colors mb-1.5">
                      {person.name}
                    </h3>
                    <p className="text-xs font-semibold text-pb-emerald mb-3">{person.profession}</p>
                    <p className="text-xs text-pb-muted line-clamp-3 italic leading-relaxed">
                      "{person.quote}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-pb-line/60 flex items-center justify-between text-xs font-semibold text-pb-deep">
                    <span>{t('btn_discover_story')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-pb-emerald transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EXPLORE BY INTEREST */}
      <section className="py-16 sm:py-20 bg-pb-bg border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              {t('sec_interests_title')}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-pb-text">
              {t('sec_interests_heading')}
            </h2>
            <p className="text-xs sm:text-sm text-pb-muted mt-2">
              {t('sec_interests_sub')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/people?tag=${encodeURIComponent(cat.title)}`}
                  className="p-5 rounded-2xl bg-pb-white border border-pb-line hover:border-pb-emerald/40 hover:shadow-editorial transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-pb-emerald bg-pb-light/60 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-pb-text group-hover:text-pb-emerald transition-colors leading-tight">
                    {language === 'en' ? cat.en : cat.title}
                  </h4>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. THE PEOPLE'S LIBRARY (VOLUMES) */}
      <section className="py-16 sm:py-20 bg-pb-white border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
                {t('sec_library_title')}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-pb-text">
                {t('sec_library_heading')}
              </h2>
              <p className="text-xs sm:text-sm text-pb-muted mt-1 max-w-xl">
                {t('sec_library_sub')}
              </p>
            </div>

            <Link
              to="/volumes"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pb-emerald hover:text-pb-primary transition-colors"
            >
              <span>{t('sec_library_view_all')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {volumes.map((vol) => (
              <div
                key={vol.id}
                className="bg-pb-bg rounded-2xl border border-pb-line p-6 flex flex-col justify-between hover:shadow-editorial hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest font-bold text-pb-gold">
                      Volume {vol.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pb-light text-pb-deep">
                      {t('sec_library_stories_count', { count: vol.storiesCount })}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
                    {vol.title}
                  </h3>
                  <p className="text-xs font-semibold text-pb-emerald mb-3">
                    {vol.subtitle}
                  </p>
                  <p className="text-xs text-pb-muted leading-relaxed mb-6">
                    {vol.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-pb-line/80 flex items-center justify-between gap-2">
                  <Link
                    to={`/volumes/${vol.slug}`}
                    className="text-xs font-bold text-pb-deep hover:text-pb-primary transition-colors"
                  >
                    {t('sec_library_view_details')}
                  </Link>
                  <a
                    href={vol.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-pb-emerald text-white hover:bg-pb-primary transition-colors"
                  >
                    Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (5 Sober Steps) */}
      <section className="py-16 sm:py-20 bg-pb-bg border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              {t('sec_how_title')}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-pb-text">
              {t('sec_how_heading')}
            </h2>
            <p className="text-xs sm:text-sm text-pb-muted mt-2">
              {t('sec_how_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { num: '01', title: t('step_1_title'), desc: t('step_1_desc') },
              { num: '02', title: t('step_2_title'), desc: t('step_2_desc') },
              { num: '03', title: t('step_3_title'), desc: t('step_3_desc') },
              { num: '04', title: t('step_4_title'), desc: t('step_4_desc') },
              { num: '05', title: t('step_5_title'), desc: t('step_5_desc') },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-pb-white rounded-2xl p-6 border border-pb-line relative flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="font-serif text-2xl font-bold text-pb-emerald/40 mb-3">
                    {step.num}
                  </div>
                  <h4 className="font-serif text-base font-bold text-pb-text mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-pb-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BECOME A STORY CTA */}
      <section className="py-20 sm:py-24 bg-pb-deep text-pb-light relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-3">
            {t('sec_cta_badge')}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            {t('sec_cta_title')}
          </h2>
          <p className="text-sm sm:text-base text-pb-light/80 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
            {t('sec_cta_sub')}
          </p>

          <Link
            to="/become-a-story"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-pb-gold hover:bg-pb-goldDark text-pb-white text-sm font-bold shadow-gold transition-all hover:scale-105"
          >
            <span>{t('sec_cta_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
