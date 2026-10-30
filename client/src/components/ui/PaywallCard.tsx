import React from 'react';
import { Lock, BookOpen, KeyRound, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaywallCardProps {
  volumeId: string;
  volumeTitle?: string;
  title?: string;
  description?: string;
  onActivateClick?: () => void;
  amazonUrl?: string;
}

export const PaywallCard: React.FC<PaywallCardProps> = ({
  volumeId,
  volumeTitle = 'Histórias que Inspiram',
  title = 'Acesso Reservado aos Leitores do Volume',
  description = 'Esta entrada do Diário Vivo e as galerias completas são exclusivas para leitores com acesso validado ao livro correspondente.',
  onActivateClick,
  amazonUrl = 'https://www.amazon.com/dp/B0EXAMPLE01',
}) => {
  return (
    <div className="relative rounded-2xl border border-pb-line overflow-hidden bg-gradient-to-b from-pb-white to-pb-bg p-8 text-center shadow-editorial">
      <div className="w-12 h-12 rounded-full bg-pb-light text-pb-deep mx-auto flex items-center justify-center mb-4 shadow-sm">
        <Lock className="w-6 h-6 text-pb-emerald" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full bg-pb-emerald/10 text-pb-emerald font-semibold text-xs uppercase tracking-wider mb-2">
        Comunidade do Volume {volumeId}
      </span>

      <h3 className="font-serif text-2xl font-bold text-pb-text mb-2 max-w-md mx-auto">
        {title}
      </h3>

      <p className="text-sm text-pb-muted max-w-lg mx-auto leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onActivateClick ? (
          <button
            onClick={onActivateClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pb-emerald text-white text-sm font-bold shadow-md hover:bg-pb-primary transition-all hover:-translate-y-0.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ativar Acesso do Volume {volumeId}</span>
          </button>
        ) : (
          <Link
            to={`/activate?volume=${volumeId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pb-emerald text-white text-sm font-bold shadow-md hover:bg-pb-primary transition-all hover:-translate-y-0.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ativar Acesso do Volume {volumeId}</span>
          </Link>
        )}

        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-pb-line bg-pb-white text-pb-text text-sm font-semibold hover:border-pb-emerald/50 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-pb-gold" />
          <span>Comprar Volume {volumeId} na Amazon</span>
          <ExternalLink className="w-3.5 h-3.5 text-pb-muted" />
        </a>
      </div>

      <p className="text-xs text-pb-muted/80 mt-4">
        Em ambiente de teste, use a chave demonstrativa <strong>PB-DEMO-{volumeId}</strong> para liberar o acesso instantaneamente.
      </p>
    </div>
  );
};

