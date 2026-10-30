import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle, quickSwitch } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast('Login realizado com sucesso!', 'success');
      navigate('/library');
    } catch (err: any) {
      toast(err.message || 'Credenciais inválidas.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'reader' | 'participant' | 'admin') => {
    setIsSubmitting(true);
    try {
      await quickSwitch(role);
      toast(`Conectado como ${role.toUpperCase()} demonstrativo!`, 'success');
      navigate(role === 'participant' ? '/studio' : role === 'admin' ? '/admin' : '/library');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pb-bg py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/assets/peoplebooks_logo.png"
              alt="PeopleBooks"
              className="h-12 w-auto mx-auto object-contain"
            />
          </Link>
          <h2 className="font-serif text-2xl font-bold text-pb-text mt-3">
            Acesse sua Conta
          </h2>
          <p className="text-xs text-pb-muted mt-1 font-sans">
            Entre para gerenciar seus volumes e acompanhar histórias vivas.
          </p>
        </div>

        <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
          {/* Google Login Component (Zero-block, Instant Authentication) */}
          <div className="mb-6 flex flex-col items-center">
            <GoogleAuthButton onSuccessRedirect="/library" />

            <div className="flex items-center gap-3 w-full my-5">
              <div className="h-px bg-pb-line flex-1"></div>
              <span className="text-[11px] uppercase tracking-wider text-pb-muted font-bold">
                ou com e-mail
              </span>
              <div className="h-px bg-pb-line flex-1"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                />
                <Mail className="w-4 h-4 text-pb-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                />
                <Lock className="w-4 h-4 text-pb-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              <span>{isSubmitting ? 'Verificando...' : 'Entrar no PeopleBooks'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-pb-line">
            <span className="text-[10px] uppercase tracking-wider font-bold text-pb-muted block mb-2 text-center">
              Acesso Rápido de Demonstração (Sem senha)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('reader')}
                className="py-1.5 px-2 text-[10px] font-bold rounded-lg border border-pb-line bg-pb-bg text-pb-deep hover:bg-pb-light transition-colors"
              >
                Leitor
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('participant')}
                className="py-1.5 px-2 text-[10px] font-bold rounded-lg border border-pb-line bg-pb-bg text-pb-deep hover:bg-pb-light transition-colors"
              >
                Autora
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-1.5 px-2 text-[10px] font-bold rounded-lg border border-pb-line bg-pb-bg text-pb-deep hover:bg-pb-light transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-pb-muted">
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-bold text-pb-emerald hover:underline">
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
