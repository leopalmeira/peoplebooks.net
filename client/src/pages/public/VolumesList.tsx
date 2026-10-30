import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { Volume } from '../../types/index.js';
import { Book3D } from '../../components/book/Book3D.js';
import { useAuth } from '../../context/AuthContext.js';

export const VolumesList: React.FC = () => {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasVolumeAccess } = useAuth();

  useEffect(() => {
    async function loadVolumes() {
      try {
        const res = await api.getVolumes();
        if (res.success) setVolumes(res.data);
      } catch (err) {
        console.error('Error fetching volumes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVolumes();
  }, []);

  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-2">
            Coleção Oficial de Livros Impressos
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text tracking-tight mb-4">
            A Biblioteca PeopleBooks
          </h1>
          <p className="text-base text-pb-muted leading-relaxed">
            Cada volume é uma antologia editorial independente de histórias humanas reais. Ao adquirir um livro físico, você desbloqueia o direito perpétuo de acompanhar os protagonistas daquele volume em nossa plataforma viva.
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-serif text-pb-muted">Carregando volumes editoriais...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {volumes.map((vol) => {
              const isUnlocked = hasVolumeAccess(vol.id);
              return (
                <div
                  key={vol.id}
                  className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-12 shadow-editorial flex flex-col lg:flex-row items-center gap-10"
                >
                  {/* Book 3D Cover */}
                  <div className="shrink-0 w-64 sm:w-72">
                    <Book3D
                      coverUrl={vol.coverImageUrl}
                      title={vol.title}
                      subtitle={`Volume ${vol.id}`}
                      size="md"
                    />
                  </div>

                  {/* Volume Editorial Metadata */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs uppercase tracking-widest font-bold text-pb-gold">
                          Volume {vol.id} • Edição Publicada
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pb-light text-pb-deep">
                          {vol.storiesCount} Biografias Selecionadas
                        </span>
                        {isUnlocked && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ativo na sua biblioteca
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text mb-2">
                        {vol.title}
                      </h2>
                      <p className="text-sm font-semibold text-pb-emerald mb-4">
                        {vol.subtitle}
                      </p>
                      <p className="text-sm text-pb-muted leading-relaxed mb-6">
                        {vol.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-pb-line flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/volumes/${vol.slug}`}
                          className="px-6 py-3 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                        >
                          <span>Ver Protagonistas do Volume</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/activate?volume=${vol.id}`}
                          className="px-5 py-3 rounded-xl border border-pb-line hover:bg-pb-bg text-pb-deep text-xs font-semibold transition-colors"
                        >
                          Ativar Acesso
                        </Link>
                      </div>

                      <a
                        href={vol.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pb-gold hover:text-pb-goldDark transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Adquirir na Amazon</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

