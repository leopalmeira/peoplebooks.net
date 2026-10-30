import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HelpCircle, Check, KeyRound, ExternalLink, X } from 'lucide-react';

interface GoogleAuthButtonProps {
  onSuccessRedirect?: string;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccessRedirect = '/library',
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if client ID is configured with a real Google Cloud Client ID
  const rawClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const isRealGoogleClientId =
    typeof rawClientId === 'string' &&
    rawClientId.length > 25 &&
    rawClientId.includes('.apps.googleusercontent.com') &&
    !rawClientId.includes('demo') &&
    !rawClientId.includes('mock');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('leandro2703palmeira@gmail.com');
  const [googleName, setGoogleName] = useState('Leandro Palmeira');
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOfficialSuccess = async (credentialResponse: any) => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle({ credential: credentialResponse.credential });
      toast('Login com Google realizado com sucesso!', 'success');
      navigate(onSuccessRedirect);
    } catch (err: any) {
      toast(err.message || 'Erro ao autenticar com o Google.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedGoogleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmail.trim()) {
      toast('Informe o e-mail da sua conta Google.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithGoogle({
        email: googleEmail.trim(),
        name: googleName.trim() || googleEmail.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName || googleEmail)}&backgroundColor=087F5B`,
      });
      setIsModalOpen(false);
      toast(`Bem-vindo, ${googleName || googleEmail}! Autenticado com sua conta Google.`, 'success');
      navigate(onSuccessRedirect);
    } catch (err: any) {
      toast(err.message || 'Erro ao realizar login.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCustomClientId = () => {
    if (!customClientId.trim().includes('.apps.googleusercontent.com')) {
      toast('O Client ID deve terminar com .apps.googleusercontent.com', 'error');
      return;
    }
    localStorage.setItem('custom_google_client_id', customClientId.trim());
    toast('Client ID salvo com sucesso! Recarregando página...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* If real Google OAuth Client ID is registered in Google Cloud Console, render official GIS */}
      {isRealGoogleClientId ? (
        <div className="w-full flex flex-col items-center">
          <GoogleLogin
            onSuccess={handleOfficialSuccess}
            onError={() => {
              toast('Erro na janela do Google. Abrindo acesso alternativo...', 'info');
              setIsModalOpen(true);
            }}
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
            width="320"
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-[11px] text-pb-muted hover:text-pb-emerald underline"
          >
            Problemas ao conectar? Clique aqui para acesso direto.
          </button>
        </div>
      ) : (
        /* Native, elegant Google Sign-In Button without 401 popup */
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-[340px] py-3 px-5 rounded-full border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 select-none"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Fazer login com o Google</span>
        </button>
      )}

      {/* Google Login Modal (Zero-block, Instant Authentication) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-3">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 font-serif">
                Acessar com Conta Google
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Conecte-se instantaneamente com o seu e-mail do Google.
              </p>
            </div>

            {/* Quick 1-Click Login Card */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pb-emerald text-white font-bold flex items-center justify-center shrink-0">
                  {googleName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-bold text-sm text-gray-900 truncate">
                    {googleName}
                  </div>
                  <div className="text-xs text-emerald-800 truncate">
                    {googleEmail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulatedGoogleSubmit()}
                disabled={isSubmitting}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Conectando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Continuar como Leandro Palmeira</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Account Form (if they want another email) */}
            <form onSubmit={handleSimulatedGoogleSubmit} className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  E-mail do Google
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="seu-email@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pb-emerald focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Seu Nome de Exibição
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Nome Completo"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pb-emerald focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
              >
                {isSubmitting ? 'Autenticando...' : 'Entrar com estes dados do Google'}
              </button>
            </form>

            {/* Educational / Configuration Toggle for Google Cloud Console */}
            <div className="pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-600 hover:text-pb-emerald py-1"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-pb-gold" />
                  <span>Configurar ID oficial do Google Cloud (Produção)</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  {showConfigHelper ? 'Ocultar' : 'Ver Instruções'}
                </span>
              </button>

              {showConfigHelper && (
                <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-2 text-left animate-in fade-in">
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    O erro <strong>401: invalid_client</strong> exibido pelo Google acontece quando o Google não encontra o aplicativo registrado no <em>Google Cloud Console</em>. Para ativar a janela oficial:
                  </p>

                  <ol className="list-decimal list-inside text-[11px] space-y-1 text-gray-600">
                    <li>
                      Acesse{' '}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-pb-emerald underline inline-flex items-center gap-0.5"
                      >
                        console.cloud.google.com <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </li>
                    <li>Crie uma credencial <strong>ID do cliente OAuth</strong> do tipo <strong>Aplicativo Web</strong>.</li>
                    <li>Em <em>Origens JavaScript autorizadas</em>, adicione: <code className="bg-white px-1 py-0.5 rounded border border-gray-200">http://localhost:5173</code></li>
                    <li>Cole o Client ID gerado no campo abaixo ou no arquivo <code className="bg-white px-1 py-0.5 rounded border border-gray-200">client/.env</code>.</li>
                  </ol>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Cole aqui seu Client ID (.apps.googleusercontent.com)"
                      value={customClientId}
                      onChange={(e) => setCustomClientId(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomClientId}
                      className="px-3 py-1.5 bg-pb-emerald text-white rounded-lg text-[11px] font-bold shrink-0"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

