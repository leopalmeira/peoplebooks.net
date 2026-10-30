import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../../services/api.js';
import { Volume, Participant } from '../../types/index.js';
import { Book3D } from '../../components/book/Book3D.js';
import { useAuth } from '../../context/AuthContext.js';

export const VolumeDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [volume, setVolume] = useState<Volume | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isEntitled, setIsEntitled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadVolume() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await api.getVolumeBySlug(slug);
        if (res.success && res.data) {
          setVolume(res.data.volume);
          setParticipants(res.data.participants);
          setIsEntitled(res.data.isEntitled);
        }
      } catch (err) {
        console.error('Error fetching volume detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVolume();
  }, [slug, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-serif text-pb-muted">Carregando detalhes do volume...</p>
      </div>
    );
  }

  if (!volume) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-pb-text mb-2">Volume não encontrado</h2>
        <Link to="/volumes" className="px-5 py-2.5 rounded-xl bg-pb-emerald text-white text-xs font-bold">
          Voltar aos Volumes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-12 shadow-editorial mb-14 flex flex-col lg:flex-row items-center gap-10">
          <div className="shrink-0 w-64 sm:w-80">
            <Book3D
              coverUrl={volume.coverImageUrl}
              title={volume.title}
              subtitle={`Volume ${volume.id}`}
              size="md"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-widest font-bold text-pb-gold">
                  Volume {volume.id} • Coleção Oficial
                </span>
                {isEntitled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Você possui acesso ativo a este volume
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                    <Lock className="w-3.5 h-3.5" />
                    Conteúdos exclusivos bloqueados
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text mb-2">
                {volume.title}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-pb-emerald mb-4">
                {volume.subtitle}
              </p>
              <p className="text-sm text-pb-muted leading-relaxed mb-6">
                {volume.description}
              </p>
            </div>

            <div className="pt-6 border-t border-pb-line flex flex-wrap items-center gap-4">
              <a
                href={volume.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Adquirir Livro Impresso na Amazon</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {!isEntitled && (
                <Link
                  to={`/activate?volume=${volume.id}`}
                  className="px-6 py-3.5 rounded-xl bg-pb-gold hover:bg-pb-goldDark text-white text-xs font-bold shadow-gold transition-all"
                >
                  Ativar meu Acesso a este Volume
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Participants in this volume */}
        <div>
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              Protagonistas deste Volume
            </span>
            <h2 className="font-serif text-3xl font-bold text-pb-text">
              8 Vidas Publicadas no Volume {volume.id}
            </h2>
            <p className="text-sm text-pb-muted mt-1">
              Cada participante possui duas páginas exclusivas no miolo do livro impresso com um QR Code individual permanente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {participants.map((person) => (
              <Link
                key={person.id}
                to={`/people/${person.slug}`}
                className="group flex flex-col bg-pb-white rounded-2xl border border-pb-line overflow-hidden hover:shadow-editorial hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-pb-white/90 backdrop-blur-sm text-pb-deep text-[11px] font-bold px-2.5 py-1 rounded-full border border-pb-line">
                    #{person.number}
                  </div>
                  <div className="absolute top-3 right-3 bg-pb-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {person.tag}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-pb-muted mb-1">{person.city}, {person.country}</div>
                    <h3 className="font-serif text-xl font-bold text-pb-text group-hover:text-pb-emerald transition-colors mb-1">
                      {person.name}
                    </h3>
                    <p className="text-xs font-semibold text-pb-emerald mb-3">{person.profession}</p>
                    <p className="text-xs text-pb-muted line-clamp-3 italic leading-relaxed">
                      "{person.quote}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-pb-line/60 flex items-center justify-between text-xs font-bold text-pb-deep">
                    <span>Conhecer História</span>
                    <ArrowRight className="w-3.5 h-3.5 text-pb-emerald transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

