import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, BookOpen, Send } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

export const BecomeAStory: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    publicName: '',
    legalName: '',
    email: '',
    country: 'Brasil',
    city: '',
    languages: 'Português',
    profession: '',
    isAdult: true,
    storySummary: '',
    interests: '',
    motivation: '',
    conversationAvailability: 'high',
    consentAgreed: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAgreed) {
      toast('É necessário concordar com os termos de consentimento editorial.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitApplication({
        ...formData,
        languages: formData.languages.split(',').map((l) => l.trim()),
      });
      if (res.success) {
        setSubmitted(true);
        toast('Candidatura enviada com sucesso para a curadoria PeopleBooks!', 'success');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pb-gold/15 text-pb-goldDark text-xs font-bold tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pb-goldDark"></span>
            <span>Chamada Editorial para Novos Volumes</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text tracking-tight mb-4">
            Sua História Merece Ser Contada.
          </h1>
          <p className="text-sm sm:text-base text-pb-muted leading-relaxed">
            O PeopleBooks seleciona histórias de vidas reais para publicação em volumes impressos distribuídos na Amazon. Cada autor ocupa 2 páginas nobres com fotografia, biografia e QR Code individual permanente.
          </p>
        </div>

        {submitted ? (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-10 sm:p-14 text-center shadow-editorial">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-pb-text mb-3">
              Candidatura Registrada com Sucesso!
            </h2>
            <p className="text-sm text-pb-muted leading-relaxed max-w-lg mx-auto mb-8">
              Nossa equipe de curadoria editorial analisará suas respostas com carinho e discrição. Entraremos em contato pelo e-mail <strong>{formData.email}</strong> para os próximos passos da entrevista e inclusão no próximo volume impresso.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  publicName: '',
                  legalName: '',
                  email: '',
                  country: 'Brasil',
                  city: '',
                  languages: 'Português',
                  profession: '',
                  isAdult: true,
                  storySummary: '',
                  interests: '',
                  motivation: '',
                  conversationAvailability: 'high',
                  consentAgreed: false,
                });
              }}
              className="px-6 py-3 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors"
            >
              Enviar Outra Inscrição
            </button>
          </div>
        ) : (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-12 shadow-editorial">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Nome Público (Como aparecerá no livro) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.publicName}
                    onChange={(e) => setFormData({ ...formData, publicName: e.target.value })}
                    placeholder="Ex.: Juliana Moreira"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Nome Completo Legal (Uso administrativo) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="Nome civil completo"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>
              </div>

              {/* Row 2: Contact & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    E-mail Principal *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu.email@exemplo.com"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    País de Residência *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ex.: Brasil"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Cidade Aproximada *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex.: São Paulo"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>
              </div>

              {/* Row 3: Profession & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Profissão ou Ocupação Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Ex.: Empreendedora Social & Escritora"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                    Idiomas que Domina (separados por vírgula) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="Português, English, Español"
                    className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text"
                  />
                </div>
              </div>

              {/* Story Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                  Resumo da Sua História (O que torna sua trajetória marcante?) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.storySummary}
                  onChange={(e) => setFormData({ ...formData, storySummary: e.target.value })}
                  placeholder="Conte sobre suas origens, os maiores desafios superados, as lições aprendidas e o impacto que sua história pode causar nos leitores..."
                  className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text leading-relaxed"
                />
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pb-text mb-2">
                  Por que você deseja fazer parte do PeopleBooks? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="O que o atraiu para o conceito de livro vivo e conexão voluntária entre pessoas reais?"
                  className="w-full p-3.5 rounded-xl border border-pb-line focus:outline-none focus:border-pb-emerald bg-pb-bg text-sm text-pb-text leading-relaxed"
                />
              </div>

              {/* Consent Versioned Box */}
              <div className="p-5 rounded-2xl bg-pb-bg border border-pb-line space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={formData.consentAgreed}
                    onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-pb-emerald focus:ring-pb-emerald"
                  />
                  <label htmlFor="consent" className="text-xs text-pb-text/80 leading-relaxed">
                    <strong>Declaração de Maioridade e Consentimento Editorial (Versão 2026.1):</strong> Confirmo que sou maior de 18 anos, que as informações fornecidas são verídicas e autorizo a análise editorial dos meus dados para eventual publicação no livro impresso e no perfil digital da plataforma PeopleBooks.net.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-sm font-bold shadow-editorial transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Registrando Candidatura...' : 'Enviar Candidatura para Avaliação Editorial'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

