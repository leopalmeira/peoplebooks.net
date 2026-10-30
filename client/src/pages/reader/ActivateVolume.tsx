import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, BookOpen, ExternalLink } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Volume } from '../../types/index.js';

export const ActivateVolume: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshMe, hasVolumeAccess } = useAuth();
  const { toast } = useToast();

  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [selectedVolume, setSelectedVolume] = useState(searchParams.get('volume') || '01');
  const [method, setMethod] = useState<'mock' | 'manual'>('mock');
  const [orderReference, setOrderReference] = useState(`PB-DEMO-${searchParams.get('volume') || '01'}`);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    async function loadVolumes() {
      try {
        const res = await api.getVolumes();
        if (res.success) setVolumes(res.data);
      } catch (err) {
        console.error('Error fetching volumes:', err);
      }
    }
    loadVolumes();
  }, []);

  useEffect(() => {
    if (method === 'mock') {
      setOrderReference(`PB-DEMO-${selectedVolume}`);
    } else {
      setOrderReference('');
    }
  }, [selectedVolume, method]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Você precisa estar conectado para ativar um volume.', 'info');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.verifyVolume({
        volumeId: selectedVolume,
        verificationMethod: method,
        orderReference,
      });

      if (res.success) {
        await refreshMe();
        setSuccessResult(res);
        toast(res.message || 'Volume verificado com sucesso!', 'success');
      } else {
        toast(res.message || 'Não foi possível verificar a compra.', 'error');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyActive = hasVolumeAccess(selectedVolume);

  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pb-emerald/10 text-pb-deep text-xs font-bold uppercase tracking-wider mb-3">
            <KeyRound className="w-3.5 h-3.5 text-pb-emerald" />
            <span>Validação de Acesso Exclusivo</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text tracking-tight mb-2">
            Ativar Volume na Minha Biblioteca
          </h1>
          <p className="text-sm text-pb-muted leading-relaxed">
            Informe a chave do seu livro ou envie seu comprovante de pedido da Amazon para desbloquear diários e conversas.
          </p>
        </div>

        {isAlreadyActive && !successResult && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>O <strong>Volume {selectedVolume}</strong> já está ativo na sua conta!</span>
            </div>
            <Link to="/library" className="font-bold underline hover:text-emerald-950">
              Ver na Biblioteca
            </Link>
          </div>
        )}

        {successResult ? (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-10 text-center shadow-editorial">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-pb-text mb-2">
              {successResult.data?.status === 'active'
                ? `Volume ${selectedVolume} Ativado com Sucesso!`
                : 'Solicitação de Verificação Enviada!'}
            </h2>
            <p className="text-sm text-pb-muted leading-relaxed max-w-md mx-auto mb-8">
              {successResult.message}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/library"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors"
              >
                Ir para Minha Biblioteca
              </Link>
              <Link
                to={`/volumes/volume-${selectedVolume}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-pb-line text-pb-deep text-xs font-bold hover:bg-pb-bg transition-colors"
              >
                Abrir Volume {selectedVolume}
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-10 shadow-editorial">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Volume Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                  Selecione o Volume que deseja ativar
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {volumes.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVolume(v.id)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        selectedVolume === v.id
                          ? 'border-pb-emerald bg-pb-light text-pb-deep font-bold shadow-sm ring-1 ring-pb-emerald'
                          : 'border-pb-line bg-pb-bg text-pb-text hover:border-pb-emerald/40'
                      }`}
                    >
                      <div className="text-[11px] uppercase font-bold text-pb-gold">Volume {v.id}</div>
                      <div className="text-xs truncate font-serif">{v.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                  Método de Verificação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('mock')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      method === 'mock'
                        ? 'bg-pb-deep text-white border-pb-deep'
                        : 'bg-pb-bg text-pb-muted border-pb-line'
                    }`}
                  >
                    Chave Demonstrativa (Dev)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('manual')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      method === 'manual'
                        ? 'bg-pb-deep text-white border-pb-deep'
                        : 'bg-pb-bg text-pb-muted border-pb-line'
                    }`}
                  >
                    Comprovante Manual (Auditoria)
                  </button>
                </div>
              </div>

              {/* Order Reference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                  {method === 'mock' ? 'Código Demonstrativo de Teste' : 'Número do Pedido na Amazon'} *
                </label>
                <input
                  type="text"
                  required
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder={method === 'mock' ? `PB-DEMO-${selectedVolume}` : 'Ex.: 701-1234567-8901234'}
                  className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text font-mono"
                />
                <p className="text-[11px] text-pb-muted mt-1.5">
                  {method === 'mock'
                    ? `Use PB-DEMO-${selectedVolume} para simular a validação imediata em ambiente de desenvolvimento.`
                    : 'A equipe editorial analisará o número do pedido junto aos relatórios consolidados da Amazon.'}
                </p>
              </div>

              {method === 'manual' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Observações ou link do comprovante (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                    placeholder="Cole aqui detalhes adicionais ou o e-mail cadastrado na compra da Amazon..."
                    className="w-full p-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-xs text-pb-text"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-editorial transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Verificando...' : `Confirmar Ativação do Volume ${selectedVolume}`}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

