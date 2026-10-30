import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowRight, BookOpen, Globe2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';
import { Participant } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const PeopleCatalog: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [people, setPeople] = useState<Participant[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentVolume = searchParams.get('volume') || 'all';
  const currentCountry = searchParams.get('country') || 'all';
  const currentTag = searchParams.get('tag') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = searchParams.get('page') || '1';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function fetchPeople() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {
          page: currentPage,
          limit: '12',
        };
        if (currentVolume !== 'all') params.volume = currentVolume;
        if (currentCountry !== 'all') params.country = currentCountry;
        if (currentTag !== 'all') params.tag = currentTag;
        if (currentSearch) params.search = currentSearch;

        const res = await api.getPeople(params);
        if (res.success) {
          setPeople(res.data.people);
          setTotalPages(res.data.meta.totalPages);
          setTotalCount(res.data.meta.total);
          setAvailableCountries(res.data.availableFilters.countries);
          setAvailableTags(res.data.availableFilters.tags);
        }
      } catch (err) {
        console.error('Error fetching people:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeople();
  }, [currentVolume, currentCountry, currentTag, currentSearch, currentPage]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all' || !val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    next.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-pb-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pb-emerald/10 text-pb-deep text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pb-emerald"></span>
            <span>Galeria de Vidas • Volume 01, 02 e 03</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text tracking-tight mb-4">
            {t('catalog_title')}
          </h1>
          <p className="text-sm sm:text-base text-pb-muted leading-relaxed">
            Cada perfil digital corresponde a duas páginas de literatura real em nossos livros impressos. Explore histórias de vidas extraordinárias e acompanhe seus desdobramentos vivos.
          </p>
          <div className="mt-3 text-xs text-pb-gold font-mono bg-amber-50 inline-block px-3 py-1 rounded-md border border-amber-200">
            Ambiente de Demonstração: 24 perfis demonstrativos com dados biográficos completos
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-pb-white rounded-2xl border border-pb-line p-5 mb-10 shadow-editorial">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('catalog_search_placeholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text placeholder-pb-muted"
              />
              <Search className="w-4 h-4 text-pb-muted absolute left-3.5 top-3.5" />
            </form>

            {/* Volume Filter */}
            <div className="md:col-span-2">
              <select
                value={currentVolume}
                onChange={(e) => updateParam('volume', e.target.value)}
                className="w-full py-3 px-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
              >
                <option value="all">{t('filter_all_volumes')}</option>
                <option value="01">Volume 01</option>
                <option value="02">Volume 02</option>
                <option value="03">Volume 03</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="md:col-span-2">
              <select
                value={currentCountry}
                onChange={(e) => updateParam('country', e.target.value)}
                className="w-full py-3 px-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
              >
                <option value="all">{t('filter_all_countries')}</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Tag/Interest Filter */}
            <div className="md:col-span-2">
              <select
                value={currentTag}
                onChange={(e) => updateParam('tag', e.target.value)}
                className="w-full py-3 px-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
              >
                <option value="all">{t('filter_all_tags')}</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full py-3 px-2 rounded-xl border border-pb-line hover:bg-pb-bg text-pb-muted hover:text-pb-text text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Limpar todos os filtros"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-pb-muted font-medium">
          <span>Exibindo <strong>{people.length}</strong> de <strong>{totalCount}</strong> participantes encontrados</span>
          <span>Página {currentPage} de {totalPages || 1}</span>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-pb-muted font-serif">Abrindo os volumes e carregando histórias...</p>
          </div>
        ) : people.length === 0 ? (
          /* Empty State */
          <div className="bg-pb-white rounded-2xl border border-pb-line p-16 text-center shadow-sm max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-pb-muted mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-pb-text mb-2">Nenhum participante encontrado</h3>
            <p className="text-sm text-pb-muted mb-6">
              Nenhuma história correspondeu aos filtros aplicados. Tente remover os termos de busca ou filtros selecionados.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors"
            >
              Restaurar Catálogo Completo
            </button>
          </div>
        ) : (
          /* 4-column People Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {people.map((person) => (
              <Link
                key={person.id}
                to={`/people/${person.slug}`}
                className="group flex flex-col bg-pb-white rounded-2xl border border-pb-line overflow-hidden hover:shadow-editorial hover:-translate-y-1 transition-all duration-300"
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
                    <span className="text-pb-muted font-normal text-[11px]">
                      {person.languages.join(' • ')}
                    </span>
                    <span className="flex items-center gap-1 text-pb-emerald font-bold">
                      {t('btn_discover_story')}
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => updateParam('page', String(pg))}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  String(pg) === currentPage
                    ? 'bg-pb-emerald text-white shadow-md'
                    : 'bg-pb-white text-pb-text border border-pb-line hover:border-pb-emerald/40'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

