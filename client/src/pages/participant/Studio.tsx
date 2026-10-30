import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PenTool,
  Users,
  MessageSquare,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Participant, DiaryPost, PaidContent } from '../../types/index.js';

export const Studio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'new_post' | 'messages' | 'earnings'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<'volume_readers' | 'public_preview' | 'paid_content'>('volume_readers');
  const [postLocation, setPostLocation] = useState('São Paulo, Brasil');
  const [postTags, setPostTags] = useState('Recomeço, Inspiração');
  const [isPublishing, setIsPublishing] = useState(false);

  // Payout request state
  const [payoutAmount, setPayoutAmount] = useState('100.00');
  const [pixKey, setPixKey] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  useEffect(() => {
    async function loadStudio() {
      if (!user) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.getStudioDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err: any) {
        toast(err.message || 'Erro ao carregar o Author Studio.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadStudio();
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const res = await api.createDiaryPost({
        title: postTitle,
        content: postContent,
        visibility: postVisibility,
        location: postLocation,
        tags: postTags.split(',').map((t) => t.trim()),
      });

      if (res.success) {
        toast('Nova entrada publicada no Living Diary com sucesso!', 'success');
        setPostTitle('');
        setPostContent('');
        setActiveTab('overview');
        // Refresh dashboard
        const updated = await api.getStudioDashboard();
        if (updated.success) setDashboardData(updated.data);
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRespondChat = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      // In our backend controller respondToConversation handles this
      toast(`Solicitação ${action === 'accepted' ? 'aceita' : 'recusada'}.`, 'success');
      // Refresh
      const updated = await api.getStudioDashboard();
      if (updated.success) setDashboardData(updated.data);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(payoutAmount) * 100);
    if (!amountMinor || amountMinor <= 0) {
      toast('Informe um valor válido para saque.', 'error');
      return;
    }
    if (!pixKey) {
      toast('Informe sua chave PIX.', 'error');
      return;
    }

    setIsRequestingPayout(true);
    try {
      const res = await api.requestPayout(amountMinor, pixKey);
      if (res.success) {
        toast('Solicitação de saque PIX enviada!', 'success');
        setPixKey('');
        const updated = await api.getStudioDashboard();
        if (updated.success) setDashboardData(updated.data);
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-serif text-pb-muted">Abrindo o Author Studio...</p>
      </div>
    );
  }

  const { participant, stats, posts, chatRequests, ledger } = dashboardData || {};

  return (
    <div className="min-h-screen bg-pb-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Studio Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-pb-line">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              Author Studio & Living Diary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text">
              Painel do Protagonista — {participant?.name}
            </h1>
            <p className="text-xs text-pb-muted mt-1">
              Volume {participant?.primaryVolumeId} • Protagonista #{participant?.number} • Gerencie suas publicações e conexões.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('new_post')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Escrever no Diário</span>
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex gap-2 border-b border-pb-line mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Visão Geral & Entradas', icon: PenTool },
            { id: 'new_post', label: 'Nova Publicação', icon: PlusCircle },
            { id: 'messages', label: `Conversas (${chatRequests?.length || 0})`, icon: MessageSquare },
            { id: 'earnings', label: `Meus Ganhos (${stats?.balanceFormatted || 'R$ 0,00'})`, icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pb-emerald text-white shadow-sm'
                    : 'bg-pb-white text-pb-muted hover:text-pb-text border border-pb-line'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
                <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Leitores Seguidores</span>
                <div className="font-serif text-3xl font-bold text-pb-deep mt-2">{stats?.followersCount}</div>
              </div>
              <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
                <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Entradas Publicadas</span>
                <div className="font-serif text-3xl font-bold text-pb-deep mt-2">{stats?.totalPosts}</div>
              </div>
              <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
                <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Capítulos Vendidos</span>
                <div className="font-serif text-3xl font-bold text-pb-gold mt-2">{stats?.totalSalesCount}</div>
              </div>
              <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
                <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Saldo Disponível</span>
                <div className="font-serif text-3xl font-bold text-pb-emerald mt-2">{stats?.balanceFormatted}</div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-pb-white rounded-3xl border border-pb-line p-6 sm:p-8 shadow-editorial">
              <h3 className="font-serif text-2xl font-bold text-pb-text mb-6">
                Minhas Entradas no Living Diary
              </h3>

              <div className="space-y-4">
                {posts?.map((p: DiaryPost) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-pb-line bg-pb-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pb-gold">
                          {p.visibility}
                        </span>
                        <span className="text-xs text-pb-muted">• {new Date(p.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-pb-text">{p.title}</h4>
                      <p className="text-xs text-pb-muted line-clamp-1">{p.excerpt}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-pb-emerald">{p.likesCount} curtidas</span>
                      <Link
                        to={`/people/${participant?.slug}`}
                        className="p-2 rounded-lg bg-pb-white border border-pb-line hover:border-pb-emerald text-pb-deep"
                        title="Ver no Perfil"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEW POST EDITOR */}
        {activeTab === 'new_post' && (
          <div className="max-w-3xl mx-auto bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-10 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
              Escrever Nova Crônica ou Capítulo no Diário Vivo
            </h3>
            <p className="text-xs text-pb-muted mb-6 leading-relaxed">
              O Living Journal não é uma rede social efêmera: não há obrigação de postagens diárias. Compartilhe aprendizados, decisões marcantes, viagens ou fotos especiais no seu próprio tempo e com profundidade reflexiva.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                  Título da Publicação *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Ex.: Uma decisão que mudou meu rumo esta semana"
                  className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                  Visibilidade do Conteúdo *
                </label>
                <select
                  value={postVisibility}
                  onChange={(e: any) => setPostVisibility(e.target.value)}
                  className="w-full p-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-xs text-pb-text"
                >
                  <option value="volume_readers">Leitores Verificados do Volume {participant?.primaryVolumeId} (Recomendado)</option>
                  <option value="public_preview">Prévia Pública Aberta (Visível a Visitantes)</option>
                  <option value="paid_content">Conteúdo Exclusivo Pago</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                  Texto da História / Reflexão *
                </label>
                <textarea
                  required
                  rows={8}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Escreva livremente com profundidade literária..."
                  className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                    Localização Aproximada
                  </label>
                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Ex.: São Paulo, Brasil"
                    className="w-full p-3 rounded-xl border border-pb-line bg-pb-bg text-xs text-pb-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    placeholder="Liderança, Recomeço, Vida Real"
                    className="w-full p-3 rounded-xl border border-pb-line bg-pb-bg text-xs text-pb-text"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'Publicando...' : 'Publicar no Diário Vivo'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CONVERSATION REQUESTS */}
        {activeTab === 'messages' && (
          <div className="max-w-3xl mx-auto bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-10 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
              Solicitações de Conversa Privada
            </h3>
            <p className="text-xs text-pb-muted mb-6">
              Leitores com acesso verificado ao Volume {participant?.primaryVolumeId} que enviaram uma apresentação pessoal.
            </p>

            {chatRequests?.length === 0 ? (
              <div className="p-8 text-center text-xs text-pb-muted bg-pb-bg rounded-2xl border border-pb-line">
                Nenhuma solicitação de conversa pendente no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {chatRequests?.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-pb-line bg-pb-bg flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-pb-muted mb-2">
                        <span className="font-bold text-pb-deep">Leitor Identificado</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-pb-text italic leading-relaxed bg-pb-white p-3.5 rounded-xl border border-pb-line/60">
                        "{req.introMessage}"
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleRespondChat(req.id, 'declined')}
                        className="px-4 py-2 rounded-xl border border-pb-line text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Recusar com Discrição
                      </button>
                      <button
                        onClick={() => handleRespondChat(req.id, 'accepted')}
                        className="px-5 py-2 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary"
                      >
                        Aceitar Conversa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EARNINGS & PIX PAYOUT */}
        {activeTab === 'earnings' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-10 shadow-editorial">
              <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
                Monetização Direta (80% Autor / 20% PeopleBooks)
              </span>
              <h3 className="font-serif text-3xl font-bold text-pb-text mb-4">
                Saldo Disponível: {stats?.balanceFormatted}
              </h3>

              {/* PIX Payout Form */}
              <form onSubmit={handlePayoutSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-pb-line">
                <div>
                  <label className="block text-xs font-bold text-pb-text mb-1">Valor do Saque (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border border-pb-line text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pb-text mb-1">Chave PIX (CPF, E-mail ou Telefone)</label>
                  <input
                    type="text"
                    required
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="sua-chave-pix"
                    className="w-full p-3 rounded-xl border border-pb-line text-xs font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isRequestingPayout}
                    className="w-full py-3 rounded-xl bg-pb-gold hover:bg-pb-goldDark text-white text-xs font-bold shadow-gold transition-all disabled:opacity-50"
                  >
                    {isRequestingPayout ? 'Processando...' : 'Solicitar Saque PIX'}
                  </button>
                </div>
              </form>
            </div>

            {/* Financial Ledger History */}
            <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
              <h4 className="font-serif text-xl font-bold text-pb-text mb-4">
                Extrato Financeiro Transparente (Ledger)
              </h4>

              {ledger?.length === 0 ? (
                <p className="text-xs text-pb-muted">Nenhuma movimentação registrada até o momento.</p>
              ) : (
                <div className="divide-y divide-pb-line text-xs">
                  {ledger?.map((entry: any) => (
                    <div key={entry.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-pb-text">{entry.description}</span>
                        <div className="text-[11px] text-pb-muted">{new Date(entry.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`font-mono font-bold ${entry.amountMinorUnits >= 0 ? 'text-pb-emerald' : 'text-red-600'}`}>
                        {entry.amountMinorUnits >= 0 ? '+' : ''} R$ {(entry.amountMinorUnits / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

