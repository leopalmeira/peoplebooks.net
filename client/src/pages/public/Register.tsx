import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'reader' | 'participant'>('reader');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      toast('Conta criada com sucesso!', 'success');
      navigate(role === 'participant' ? '/studio' : '/library');
    } catch (err: any) {
      toast(err.message || 'Erro ao registrar conta.', 'error');
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
            Crie sua Conta
          </h2>
          <p className="text-xs text-pb-muted mt-1 font-sans">
            Junte-se à comunidade de leitores e protagonistas do PeopleBooks.
          </p>
        </div>

        <div className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial">
          {/* Google Sign In (Zero-block, Instant Authentication) */}
          <div className="mb-6 flex flex-col items-center">
            <GoogleAuthButton onSuccessRedirect="/library" />

            <div className="flex items-center gap-3 w-full my-4">
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
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                />
                <User className="w-4 h-4 text-pb-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                />
                <Lock className="w-4 h-4 text-pb-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-1.5">
                Perfil de Uso
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('reader')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'reader'
                      ? 'bg-pb-light border-pb-emerald text-pb-deep'
                      : 'bg-pb-bg border-pb-line text-pb-muted'
                  }`}
                >
                  Sou Leitor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('participant')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'participant'
                      ? 'bg-pb-light border-pb-emerald text-pb-deep'
                      : 'bg-pb-bg border-pb-line text-pb-muted'
                  }`}
                >
                  Sou Protagonista
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              <span>{isSubmitting ? 'Criando Conta...' : 'Cadastrar no PeopleBooks'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-pb-line text-center text-xs text-pb-muted">
            Já possui conta?{' '}
            <Link to="/login" className="font-bold text-pb-emerald hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
