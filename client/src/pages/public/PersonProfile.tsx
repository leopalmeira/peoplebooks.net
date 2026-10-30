import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  QrCode,
  Heart,
  MessageSquare,
  ExternalLink,
  Lock,
  Calendar,
  MapPin,
  Globe2,
  CheckCircle2,
  DollarSign,
  Clock,
  BookMarked,
  Feather,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Participant, Volume, DiaryPost, PaidContent } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useToast } from '../../context/ToastContext.js';
import { SpreadViewer } from '../../components/book/SpreadViewer.js';
import { QrCodeModal } from '../../components/book/QrCodeModal.js';
import { PaywallCard } from '../../components/ui/PaywallCard.js';

export const PersonProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [person, setPerson] = useState<Participant | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [isEntitled, setIsEntitled] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);
  const [diaryPosts, setDiaryPosts] = useState<DiaryPost[]>([]);
  const [totalDiaryPosts, setTotalDiaryPosts] = useState(0);
  const [paidContents, setPaidContents] = useState<PaidContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab selection for seamless mobile & desktop experience
  const [profileTab, setProfileTab] = useState<'story' | 'journal' | 'book_pages' | 'vault'>('story');

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await api.getPersonBySlug(slug);
        if (res.success && res.data) {
          setPerson(res.data.person);
          setVolume(res.data.volume);
          setIsEntitled(res.data.isEntitled);
          setIsFollowing(res.data.isFollowing);
          setConversationStatus(res.data.conversationStatus);
          setDiaryPosts(res.data.diaryPosts);
          setTotalDiaryPosts(res.data.totalDiaryPosts);
          setPaidContents(res.data.paidContents);
        }
      } catch (err: any) {
        toast(err.message || 'Erro ao carregar biografia.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [slug, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast('Faça login para acompanhar participantes.', 'info');
      navigate('/login');
      return;
    }

    if (!person) return;

    if (!isEntitled) {
      toast(`Para seguir ${person.name}, ative primeiro o Volume ${person.primaryVolumeId}.`, 'error');
      return;
    }

    try {
      const res = await api.toggleFollow(person.id);
      if (res.success) {
        setIsFollowing(res.data.isFollowing);
        toast(
          res.data.isFollowing
            ? `Você agora acompanha a história de ${person.name}!`
            : `Você deixou de acompanhar ${person.name}.`,
          'success'
        );
      }
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleSendChatRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!person || !introMessage.trim()) return;

    setIsSubmittingChat(true);
    try {
      const res = await api.requestChat(person.id, introMessage);
      if (res.success) {
        setConversationStatus('pending');
        setChatModalOpen(false);
        toast(res.message || 'Solicitação de conversa enviada com sucesso!', 'success');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsSubmittingChat(false);
    }
  };

  const handleBuyContent = async (item: PaidContent) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isEntitled) {
      toast(`O conteúdo pago exige acesso ativo ao Volume ${item.volumeId}.`, 'error');
      return;
    }

    try {
      const res = await api.purchaseContent(item.id);
      if (res.success) {
        toast('Obra adquirida e liberada com sucesso no seu cofre digital!', 'success');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-serif text-pb-muted">Abrindo a biografia e conectando o diário vivo...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-pb-text mb-2">Protagonista não encontrado</h2>
        <p className="text-sm text-pb-muted mb-6">O perfil solicitado não está disponível nesta edição.</p>
        <Link to="/people" className="px-5 py-2.5 rounded-xl bg-pb-emerald text-white text-xs font-bold">
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pb-bg pb-24">
      {/* 1. EDITORIAL HEADER & BIOGRAPHICAL INTRO */}
      <section className="bg-gradient-to-b from-[#EBF5EF] via-[#F4F9F6] to-pb-bg pt-8 sm:pt-12 pb-10 sm:pb-14 border-b border-pb-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Volume Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 text-xs">
            <div className="flex items-center gap-2 font-medium text-pb-muted">
              <Link to="/people" className="hover:text-pb-emerald transition-colors">Protagonistas</Link>
              <span>/</span>
              <span className="text-pb-text font-bold truncate max-w-[200px] sm:max-w-none">{person.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-pb-white text-pb-deep border border-pb-line shadow-sm">
                Volume {person.primaryVolumeId} • Protagonista #{person.number}
              </span>
              <button
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-pb-gold text-white shadow-sm hover:bg-pb-goldDark transition-all"
                title="Ver QR Code Impresso no Livro"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code do Livro</span>
              </button>
            </div>
          </div>

          {/* Hero Profile Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: High-Res Portrait & Responsive Touch Actions */}
            <div className="lg:col-span-5 flex flex-col items-center sm:items-start w-full">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-editorial border-2 border-pb-white bg-stone-200">
                <img
                  src={person.avatarUrl}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-pb-white/95 backdrop-blur-md p-3 rounded-2xl border border-pb-line/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-pb-gold tracking-wider block">Idiomas de Diálogo</span>
                    <p className="text-xs font-semibold text-pb-text">{person.languages.join(' • ')}</p>
                  </div>
                  <Globe2 className="w-4 h-4 text-pb-emerald" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm sm:max-w-md mt-5">
                <button
                  onClick={handleToggleFollow}
                  className={`w-full sm:flex-1 py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isFollowing
                      ? 'bg-pb-white border border-pb-emerald text-pb-emerald hover:bg-pb-light/30'
                      : 'bg-pb-emerald hover:bg-pb-primary text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pb-emerald' : ''}`} />
                  <span>{isFollowing ? 'Acompanhando' : 'Acompanhar História'}</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      toast('Faça login para solicitar uma conversa.', 'info');
                      navigate('/login');
                      return;
                    }
                    if (!isEntitled) {
                      toast(`É necessário ativar o Volume ${person.primaryVolumeId} para solicitar conversa.`, 'error');
                      return;
                    }
                    setChatModalOpen(true);
                  }}
                  className={`w-full sm:flex-1 py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    conversationStatus === 'accepted'
                      ? 'bg-pb-emerald/10 border-pb-emerald text-pb-deep'
                      : conversationStatus === 'pending'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-pb-white border-pb-line hover:border-pb-emerald/50 text-pb-text shadow-sm'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-pb-emerald" />
                  <span>
                    {conversationStatus === 'accepted'
                      ? 'Conversa Liberada'
                      : conversationStatus === 'pending'
                      ? 'Aguardando Aceite'
                      : 'Solicitar Conversa'}
                  </span>
                </button>
              </div>

              {/* Volume Entitlement Status */}
              <div className="w-full max-w-sm sm:max-w-md mt-4">
                {isEntitled ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('profile_access_verified', { vol: person.primaryVolumeId })}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                      {t('profile_access_locked', { vol: person.primaryVolumeId })}
                    </span>
                    <Link
                      to={`/activate?volume=${person.primaryVolumeId}`}
                      className="font-bold underline text-amber-900 hover:text-amber-950"
                    >
                      {t('profile_activate_now')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Biographical Heading & Life Creed */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              <div className="flex items-center gap-2 text-xs font-semibold text-pb-emerald uppercase tracking-wider mb-2">
                <span>{person.tag}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-pb-muted font-normal lowercase">
                  <MapPin className="w-3.5 h-3.5" />
                  {person.city}, {person.country}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-medium text-pb-text tracking-tight mb-2">
                {person.name}
              </h1>

              <p className="text-sm sm:text-base font-semibold text-pb-emerald mb-6">
                {person.profession}
              </p>

              {/* Personal Creed Box */}
              <blockquote className="p-5 sm:p-6 rounded-2xl bg-pb-white border-l-4 border-pb-gold border-y border-r border-pb-line shadow-sm mb-8 italic text-base sm:text-lg text-pb-text leading-relaxed font-serif">
                "{person.quote}"
              </blockquote>

              {/* Story Intro */}
              <div className="space-y-4 text-sm sm:text-base text-pb-text/90 leading-relaxed font-sans">
                <p>{person.bio}</p>
                <p>{person.fullStory}</p>
              </div>

              {/* Interests Tags */}
              {person.interests && person.interests.length > 0 && (
                <div className="pt-6 mt-6 border-t border-pb-line">
                  <span className="text-[11px] uppercase font-bold text-pb-gold tracking-widest block mb-2">
                    Interesses & Causas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {person.interests.map((it, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-pb-white border border-pb-line text-pb-deep"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROFILE NAVIGATION TABS (Magazine Structure) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-2 border-b border-pb-line pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'story', label: t('profile_tab_story'), icon: Feather },
            { id: 'journal', label: `${t('profile_tab_journal')} (${totalDiaryPosts})`, icon: Clock },
            { id: 'book_pages', label: t('profile_tab_pages'), icon: BookMarked },
            { id: 'vault', label: `${t('profile_tab_vault')} (${paidContents.length})`, icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  profileTab === tab.id
                    ? 'bg-pb-deep text-white shadow-sm'
                    : 'bg-pb-white text-pb-muted hover:text-pb-text border border-pb-line'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: STORY / BIOGRAPHY */}
        {profileTab === 'story' && (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-6 sm:p-10 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-4">
              A Trajetória de {person.name}
            </h3>
            <div className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed text-pb-text/90 space-y-4">
              <p>{person.fullStory}</p>
              <p>
                Como participante selecionado para o <strong>Volume {person.primaryVolumeId}</strong> do PeopleBooks, sua biografia impressa sintetiza uma trajetória de integridade, perseverança e vocação humana.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-pb-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-pb-muted">
                Deseja ler as crônicas e reflexões contínuas de {person.name}?
              </span>
              <button
                onClick={() => setProfileTab('journal')}
                className="text-xs font-bold text-pb-emerald hover:text-pb-primary flex items-center gap-1"
              >
                <span>Acessar Crônicas & Memórias Vivas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: THE LIVING JOURNAL (Crônicas sem obrigação diária) */}
        {profileTab === 'journal' && (
          <div className="space-y-6">
            {/* Philosophical Note on the Journal */}
            <div className="p-5 sm:p-6 bg-pb-white rounded-2xl border border-pb-line shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pb-light text-pb-deep shrink-0 flex items-center justify-center font-serif font-bold text-lg">
                PB
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-pb-text">
                  {t('profile_journal_title')}
                </h4>
                <p className="text-xs text-pb-muted leading-relaxed mt-0.5">
                  {t('profile_journal_desc')}
                </p>
              </div>
            </div>

            {/* Posts List */}
            {diaryPosts.map((post) => (
              <article
                key={post.id}
                className="bg-pb-white rounded-3xl border border-pb-line p-6 sm:p-8 shadow-sm hover:shadow-editorial transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-pb-gold uppercase tracking-wider">
                    {post.visibility === 'public_preview' ? 'Crônica Pública' : `Capítulo Exclusivo do Volume ${post.volumeId}`}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-pb-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span>{post.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-pb-text mb-3">
                  {post.title}
                </h3>

                <div className="text-sm text-pb-text/90 leading-relaxed whitespace-pre-line mb-6 font-sans">
                  {post.content}
                </div>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {post.mediaUrls.map((img, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden aspect-video bg-stone-100 border border-pb-line">
                        <img src={img} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-pb-line/60 flex items-center justify-between text-xs text-pb-muted">
                  <div className="flex items-center gap-2">
                    {post.tags.map((tg, idx) => (
                      <span key={idx} className="bg-pb-bg px-2.5 py-1 rounded-md text-pb-text font-medium">
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => api.likeDiaryPost(post.id).then(() => toast('Entrada curtida com sucesso!', 'success'))}
                    className="flex items-center gap-1.5 text-pb-emerald hover:text-pb-primary font-semibold transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likesCount} curtidas</span>
                  </button>
                </div>
              </article>
            ))}

            {/* Paywall Card for Non-entitled Visitors */}
            {!isEntitled && (
              <PaywallCard
                volumeId={person.primaryVolumeId}
                title={t('profile_paywall_title', { name: person.name })}
                description={t('profile_paywall_desc', { vol: person.primaryVolumeId })}
                onActivateClick={() => navigate(`/activate?volume=${person.primaryVolumeId}`)}
                amazonUrl={volume?.amazonUrl}
              />
            )}
          </div>
        )}

        {/* TAB 3: PRINTED BOOK SPREAD */}
        {profileTab === 'book_pages' && (
          <div className="space-y-6">
            <div className="bg-pb-white rounded-3xl border border-pb-line p-6 sm:p-10 shadow-editorial">
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-widest font-bold text-pb-gold block mb-1">
                  Official Printed Book
                </span>
                <h3 className="font-serif text-2xl font-bold text-pb-text">
                  {t('profile_spread_title', { vol: person.primaryVolumeId })}
                </h3>
                <p className="text-xs sm:text-sm text-pb-muted mt-1">
                  {t('profile_spread_desc', { name: person.name })}
                </p>
              </div>

              <SpreadViewer
                spreadImageUrl={person.spreadImageUrl || '/assets/juliana_spread_hd.png'}
                personName={person.name}
                volumeNumber={person.primaryVolumeId}
              />

              <div className="mt-8 pt-6 border-t border-pb-line flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-pb-text">
                    {t('profile_featured_in')}
                  </h4>
                  <p className="text-xs text-pb-muted">
                    Volume {person.primaryVolumeId}
                  </p>
                </div>

                <a
                  href={volume?.amazonUrl || 'https://www.amazon.com/dp/B0EXAMPLE01'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('profile_buy_printed')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAID EXCLUSIVE VAULT */}
        {profileTab === 'vault' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="font-serif text-2xl font-bold text-pb-text">
                Capítulos Especiais & Obras de {person.name}
              </h3>
              <p className="text-xs sm:text-sm text-pb-muted mt-1">
                Conteúdos individuais criados pelo participante. 80% do valor vai diretamente para o autor.
              </p>
            </div>

            {paidContents.length === 0 ? (
              <div className="bg-pb-white rounded-2xl border border-pb-line p-10 text-center">
                <p className="text-xs text-pb-muted">Este autor ainda não disponibilizou obras pagas adicionais.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paidContents.map((item) => (
                  <div
                    key={item.id}
                    className="bg-pb-white rounded-2xl border border-pb-line p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pb-emerald">
                          {item.contentType === 'chapter' ? 'Capítulo Especial' : 'Galeria de Fotografias'}
                        </span>
                        <span className="text-base font-serif font-bold text-pb-gold">
                          R$ {(item.priceMinorUnits / 100).toFixed(2)}
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-pb-text mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-pb-muted leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-pb-line flex items-center justify-between">
                      <span className="text-[11px] text-pb-muted">
                        Acesso perpétuo ao cofre
                      </span>
                      <button
                        onClick={() => handleBuyContent(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Adquirir Acesso</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QrCodeModal
        slug={person.slug}
        name={person.name}
        number={person.number}
        volumeId={person.primaryVolumeId}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      {/* Chat Request Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-pb-white max-w-lg w-full rounded-2xl overflow-hidden shadow-editorial border border-pb-line flex flex-col">
            <div className="p-4 px-6 bg-pb-deep text-pb-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pb-gold" />
                <h3 className="font-serif text-base font-bold text-white">Solicitar Conversa Literária</h3>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendChatRequest} className="p-6">
              <h4 className="font-serif text-lg font-bold text-pb-text mb-2">
                Apresente-se para {person.name}
              </h4>
              <p className="text-xs text-pb-muted leading-relaxed mb-4">
                As conversas no PeopleBooks ocorrem com respeito mútuo. Escreva uma mensagem explicando o que chamou sua atenção na história do livro.
              </p>

              <textarea
                required
                rows={4}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder="Exemplo: Olá Juliana, li seu capítulo no Volume 01 e me identifiquei muito com sua coragem no recomeço. Gostaria de trocar uma mensagem..."
                className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text mb-4"
              />

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-6">
                <strong>Importante:</strong> O participante tem total autonomia para aceitar ou recusar conversas. Seus dados de contato (telefone/e-mail) permanecem protegidos.
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setChatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-pb-line text-xs font-semibold text-pb-muted hover:text-pb-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChat}
                  className="px-6 py-2.5 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingChat ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
