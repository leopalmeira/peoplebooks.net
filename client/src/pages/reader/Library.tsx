import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Heart, DollarSign, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Volume, Participant, ContentPurchase } from '../../types/index.js';

export const Library: React.FC = () => {
  const { user, entitlements } = useAuth();
  const navigate = useNavigate();

  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [following, setFollowing] = useState<Participant[]>([]);
  const [purchases, setPurchases] = useState<ContentPurchase[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLibraryData() {
      if (!user) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        const [volsRes, followRes, purchRes, entRes] = await Promise.all([
          api.getVolumes(),
          api.getMyFollowing(),
          api.getMyPurchases(),
          api.getMyEntitlements(),
        ]);

        if (volsRes.success) setVolumes(volsRes.data);
        if (followRes.success) setFollowing(resOrEmpty(followRes.data));
        if (purchRes.success) setPurchases(resOrEmpty(purchRes.data));
        if (entRes.success) setPendingRequests(entRes.data.pendingRequests || []);
      } catch (err) {
        console.error('Error loading library:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLibraryData();
  }, [user]);

  function resOrEmpty(val: any) {
    return Array.isArray(val) ? val : [];
  }

  const activeVolumeIds = entitlements.filter((e) => e.status === 'active').map((e) => e.volumeId);

  return (
    <div className="min-h-screen bg-pb-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-pb-line">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              Espaço do Leitor
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text">
              Minha Biblioteca PeopleBooks
            </h1>
            <p className="text-xs text-pb-muted mt-1">
              Olá, <strong>{user?.name}</strong>! Gerencie seus volumes e acompanhe os diários que você segue.
            </p>
          </div>

          <Link
            to="/activate"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ativar Novo Volume</span>
          </Link>
        </div>

        {/* 1. Volumes Shelf */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-pb-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pb-emerald" />
              <span>Volumes & Comunidades</span>
            </h2>
            <span className="text-xs text-pb-muted font-medium">
              {activeVolumeIds.length} de {volumes.length} volumes ativados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {volumes.map((vol) => {
              const isUnlocked = activeVolumeIds.includes(vol.id) || user?.role === 'admin';
              return (
                <div
                  key={vol.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'bg-pb-white border-pb-emerald/40 shadow-editorial'
                      : 'bg-stone-50/80 border-pb-line opacity-90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest font-bold text-pb-gold">
                        Volume {vol.id}
                      </span>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Acesso Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                          Bloqueado
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-pb-text mb-1">
                      {vol.title}
                    </h3>
                    <p className="text-xs font-semibold text-pb-emerald mb-2">
                      {vol.subtitle}
                    </p>
                    <p className="text-xs text-pb-muted leading-relaxed line-clamp-3 mb-4">
                      {vol.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-pb-line flex items-center justify-between gap-2">
                    <Link
                      to={`/volumes/${vol.slug}`}
                      className="text-xs font-bold text-pb-deep hover:text-pb-emerald transition-colors"
                    >
                      Ver Histórias ({vol.storiesCount})
                    </Link>

                    {isUnlocked ? (
                      <Link
                        to={`/volumes/${vol.slug}`}
                        className="px-3.5 py-1.5 rounded-lg bg-pb-light text-pb-deep text-xs font-bold hover:bg-pb-emerald hover:text-white transition-colors"
                      >
                        Abrir Volume
                      </Link>
                    ) : (
                      <Link
                        to={`/activate?volume=${vol.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors"
                      >
                        Ativar
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Pending Verification Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-14">
            <h3 className="font-serif text-lg font-bold text-pb-text mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Solicitações de Ativação Pendentes de Análise</span>
            </h3>
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 divide-y divide-amber-200">
              {pendingRequests.map((req) => (
                <div key={req.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900">Volume {req.volumeId}</span> — Ref: {req.orderNumber}
                    <div className="text-[11px] text-amber-700">Enviado em: {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-200/80 text-amber-900 font-bold uppercase text-[10px]">
                    Em Análise Editorial
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Followed People */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-pb-text flex items-center gap-2">
              <Heart className="w-5 h-5 text-pb-emerald" />
              <span>Protagonistas que Acompanho</span>
            </h2>
            <Link to="/my-feed" className="text-xs font-bold text-pb-emerald hover:underline">
              Ir para o Diário Vivo (Feed)
            </Link>
          </div>

          {following.length === 0 ? (
            <div className="bg-pb-white rounded-2xl border border-pb-line p-8 text-center">
              <p className="text-xs text-pb-muted mb-4">
                Você ainda não segue nenhum protagonista. Ative o volume correspondente e clique em "Seguir Esta História".
              </p>
              <Link to="/people" className="text-xs font-bold text-pb-emerald hover:underline">
                Explorar Catálogo de Pessoas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {following.map((person) => (
                <Link
                  key={person.id}
                  to={`/people/${person.slug}`}
                  className="bg-pb-white rounded-2xl border border-pb-line p-4 flex items-center gap-4 hover:shadow-editorial hover:-translate-y-0.5 transition-all group"
                >
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-14 h-14 rounded-full object-cover shrink-0 border border-pb-line"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-serif text-base font-bold text-pb-text group-hover:text-pb-emerald transition-colors truncate">
                      {person.name}
                    </h4>
                    <p className="text-xs text-pb-muted truncate">{person.profession}</p>
                    <span className="text-[10px] text-pb-gold font-bold uppercase">Volume {person.primaryVolumeId}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 4. Purchased Content Vault */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-pb-text mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-pb-gold" />
            <span>Capítulos Exclusivos Adquiridos</span>
          </h2>

          {purchases.length === 0 ? (
            <div className="bg-pb-white rounded-2xl border border-pb-line p-8 text-center">
              <p className="text-xs text-pb-muted">
                Você ainda não adquiriu nenhum capítulo pago individual.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="bg-pb-white rounded-2xl border border-pb-line p-5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-serif text-base font-bold text-pb-text">
                      {p.item?.title || 'Capítulo Exclusivo'}
                    </h4>
                    <p className="text-xs text-pb-muted">
                      Por {p.author?.name || 'Participante'} • Pago: R$ {(p.amountPaidMinorUnits / 100).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-pb-emerald bg-pb-light px-3 py-1.5 rounded-lg">
                    Liberado no Cofre
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

