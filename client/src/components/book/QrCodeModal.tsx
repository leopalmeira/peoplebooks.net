import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, ExternalLink, X, Check, ShieldCheck } from 'lucide-react';

interface QrCodeModalProps {
  slug: string;
  name: string;
  number: string;
  volumeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  slug,
  name,
  number,
  volumeId,
  isOpen,
  onClose,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const permanentUrl = `https://peoplebooks.net/people/${slug}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(permanentUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#064E3B', // pb-deep emerald
          light: '#FFFFFF',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('Error generating QR Code:', err));
    }
  }, [isOpen, permanentUrl]);

  if (!isOpen) return null;

  const handleDownload = (format: 'png' | 'svg') => {
    if (format === 'png') {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `peoplebooks-qr-${slug}.png`;
      a.click();
    } else {
      QRCode.toString(permanentUrl, { type: 'svg', color: { dark: '#064E3B', light: '#FFFFFF' } })
        .then((svgString) => {
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `peoplebooks-qr-${slug}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(permanentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-pb-white max-w-md w-full rounded-2xl overflow-hidden shadow-editorial border border-pb-line flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 bg-pb-deep text-pb-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-pb-gold" />
            <h3 className="font-serif text-lg font-bold text-white">QR Code Editorial</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="text-xs uppercase tracking-widest text-pb-gold font-bold mb-1">
            Volume {volumeId} • Protagonista #{number}
          </div>
          <h4 className="font-serif text-xl font-bold text-pb-text mb-4">
            {name}
          </h4>

          {/* QR Container */}
          <div className="p-4 bg-pb-bg rounded-2xl border border-pb-line mb-4 shadow-inner">
            {dataUrl ? (
              <img src={dataUrl} alt={`QR Code para ${name}`} className="w-56 h-56 rounded-lg" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-pb-muted text-xs">
                Gerando QR Code...
              </div>
            )}
          </div>

          {/* Permanent URL box */}
          <div className="w-full bg-pb-bg border border-pb-line rounded-lg p-2.5 px-3 flex items-center justify-between gap-2 mb-5">
            <span className="text-xs font-mono text-pb-text truncate text-left">{permanentUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded bg-pb-white border border-pb-line hover:border-pb-emerald text-pb-deep transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-pb-emerald" /> : null}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <p className="text-xs text-pb-muted leading-relaxed mb-6">
            <ShieldCheck className="w-3.5 h-3.5 inline text-pb-emerald mr-1" />
            Este QR Code aponta para a URL pública permanente da pessoa. Ele não armazena tokens secretos nem comprova a compra do livro.
          </p>

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleDownload('png')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-pb-line hover:border-pb-emerald/50 bg-pb-bg text-pb-deep text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-pb-emerald" />
              Baixar PNG (Alta Res)
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Baixar Vetor SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

