import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  BookOpen,
  Filter
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'verifications' | 'applications' | 'users' | 'integrations'>('verifications');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      if (!user || user.role !== 'admin') {
        toast('Acesso restrito à curadoria e administradores.', 'error');
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.getAdminOverview();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        toast(err.message || 'Erro ao carregar painel administrativo.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadAdmin();
  }, [user]);

  const handleReviewVerification = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await api.reviewVerification(id, action);
      if (res.success) {
        toast(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`, 'success');
        // Refresh
        const updated = await api.getAdminOverview();
        if (updated.success) setData(updated.data);
      }
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pb-bg py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-serif text-pb-muted">Carregando painel de curadoria...</p>
      </div>
    );
  }

  const { stats, pendingVerificationsList, applications, recentUsers } = data || {};

  return (
    <div className="min-h-screen bg-pb-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-pb-line">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pb-deep text-pb-light text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-pb-emerald" />
            <span>Módulo de Curadoria & Governança</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text">
            Painel Administrativo PeopleBooks
          </h1>
          <p className="text-xs text-pb-muted mt-1">
            Controle de ativações de volumes, revisão editorial de candidaturas e integridade das regras de negócio.
          </p>
        </div>

        {/* 1. Global Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
            <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Usuários Registrados</span>
            <div className="font-serif text-3xl font-bold text-pb-deep mt-2">{stats?.totalUsers}</div>
          </div>
          <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
            <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Ativações Válidas</span>
            <div className="font-serif text-3xl font-bold text-pb-emerald mt-2">{stats?.activeEntitlements}</div>
          </div>
          <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
            <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Verificações Pendentes</span>
            <div className="font-serif text-3xl font-bold text-amber-600 mt-2">{stats?.pendingVerifications}</div>
          </div>
          <div className="bg-pb-white rounded-2xl border border-pb-line p-5 shadow-sm">
            <span className="text-xs text-pb-muted uppercase tracking-wider font-semibold">Comissões PeopleBooks</span>
            <div className="font-serif text-3xl font-bold text-pb-gold mt-2">{stats?.totalPlatformCommissionsFormatted}</div>
          </div>
        </div>

        {/* 2. Tabs */}
        <div className="flex gap-2 border-b border-pb-line mb-8">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verifications'
                ? 'bg-pb-emerald text-white'
                : 'bg-pb-white text-pb-muted border border-pb-line'
            }`}
          >
            Verificações de Volume ({pendingVerificationsList?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'applications'
                ? 'bg-pb-emerald text-white'
                : 'bg-pb-white text-pb-muted border border-pb-line'
            }`}
          >
            Candidaturas ({applications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-pb-emerald text-white'
                : 'bg-pb-white text-pb-muted border border-pb-line'
            }`}
          >
            Usuários Recentes
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'integrations'
                ? 'bg-pb-emerald text-white'
                : 'bg-pb-white text-pb-muted border border-pb-line'
            }`}
          >
            Status das Integrações (KDP / Pagamentos)
          </button>
        </div>

        {/* TAB 1: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
              Solicitações de Ativação de Volume Pendentes
            </h3>
            <p className="text-xs text-pb-muted mb-6">
              Revise o código do comprovante do leitor para liberar o acesso perpétuo ao respectivo volume.
            </p>

            {pendingVerificationsList?.length === 0 ? (
              <div className="p-8 text-center text-xs text-pb-muted bg-pb-bg rounded-2xl border border-pb-line">
                Nenhuma solicitação pendente no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerificationsList?.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-pb-line bg-pb-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-pb-deep">Volume {req.volumeId}</span>
                        <span className="text-[11px] text-pb-muted">• Pedido: <code className="font-mono bg-white px-2 py-0.5 rounded border border-pb-line">{req.orderNumber}</code></span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {req.provider}
                        </span>
                      </div>
                      <p className="text-xs text-pb-muted">Enviado em: {new Date(req.createdAt).toLocaleString()}</p>
                      {req.notes && <p className="text-xs text-pb-text italic mt-1">Notas: {req.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewVerification(req.id, 'reject')}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleReviewVerification(req.id, 'approve')}
                        className="px-5 py-2 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold transition-colors"
                      >
                        Aprovar Acesso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
              Candidaturas de Novos Protagonistas
            </h3>
            <p className="text-xs text-pb-muted mb-6">
              Inscrições enviadas pelo formulário "Seja Protagonista" para futuros volumes impressos.
            </p>

            {applications?.length === 0 ? (
              <div className="p-8 text-center text-xs text-pb-muted bg-pb-bg rounded-2xl border border-pb-line">
                Nenhuma candidatura recebida até o momento.
              </div>
            ) : (
              <div className="space-y-6">
                {applications?.map((app: any) => (
                  <div key={app.id} className="p-6 rounded-2xl border border-pb-line bg-pb-bg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-lg font-bold text-pb-text">{app.publicName}</h4>
                        <p className="text-xs text-pb-muted">
                          {app.profession} • {app.city}, {app.country} ({app.email})
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800">
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-pb-text/90 leading-relaxed bg-pb-white p-4 rounded-xl border border-pb-line/60">
                      <strong>Resumo da História:</strong>
                      <p className="mt-1">{app.storySummary}</p>
                    </div>

                    {app.motivation && (
                      <div className="text-xs text-pb-muted">
                        <strong>Motivação:</strong> {app.motivation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS */}
        {activeTab === 'users' && (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-6">
              Usuários Recentes
            </h3>

            <div className="divide-y divide-pb-line">
              {recentUsers?.map((u: any) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-pb-text">{u.name}</span>
                    <span className="text-pb-muted ml-2">({u.email})</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-pb-light text-pb-deep">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRATIONS STATUS (Section 9 Requirement) */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
              <h3 className="font-serif text-2xl font-bold text-pb-text mb-4">
                Painel de Status das Integrações Externas
              </h3>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-amber-900">
                      Amazon KDP Individual Buyer Verification: DESABILITADA (Conforme Regra Inegociável)
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed mt-1">
                      A Amazon KDP não disponibiliza publicamente APIs para validação unitária de compradores por número de pedido de terceiros. Por compliance de segurança, a plataforma <strong>não inventa endpoints fictícios da Amazon</strong> e mantém as validações no fluxo auditável de <code>ManualVerificationProvider</code> ou chave de desenvolvimento <code>MockVerificationProvider</code>.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-emerald-900">
                      Provedor Mock de Desenvolvimento: ATIVO
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                      Permite testes rápidos com a chave de volume <code>PB-DEMO-XX</code>. Possui trava no código que impede ativação em ambiente de produção (<code>NODE_ENV === 'production'</code>).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-base font-bold text-emerald-900">
                      Cálculo de Comissões e Ledger Financeiro: ATIVO (80% / 20%)
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                      80% das receitas de capítulos pagos são computadas em centavos inteiros (minor units) e creditadas no saldo do participante, com 20% retidos pela PeopleBooks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

