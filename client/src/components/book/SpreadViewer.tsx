import React, { useState } from 'react';
import { Eye, X, BookOpen, Maximize2 } from 'lucide-react';

interface SpreadViewerProps {
  spreadImageUrl?: string;
  personName: string;
  volumeNumber: string;
}

export const SpreadViewer: React.FC<SpreadViewerProps> = ({
  spreadImageUrl = '/assets/juliana_spread_hd.png',
  personName,
  volumeNumber,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Spread Preview Card */}
      <div className="relative rounded-2xl overflow-hidden border border-pb-line bg-pb-white shadow-editorial group cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="p-4 sm:p-6 bg-gradient-to-b from-pb-bg to-pb-white flex items-center justify-between border-b border-pb-line">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-pb-emerald" />
            <div>
              <h4 className="font-serif text-lg font-bold text-pb-text">
                Prévia do Livro Impresso (2 Páginas)
              </h4>
              <p className="text-xs text-pb-muted">
                Veja exatamente como a história de {personName} está diagramada no Volume {volumeNumber}.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-pb-emerald bg-pb-light/60 px-3 py-1.5 rounded-lg group-hover:bg-pb-light transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Ampliar Miolo</span>
          </button>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100 flex items-center justify-center p-4">
          <img
            src={spreadImageUrl}
            alt={`Miolo aberto de ${personName} no Volume ${volumeNumber}`}
            className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('spread.jpg')) {
                target.src = '/assets/spread.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-pb-deep/0 group-hover:bg-pb-deep/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-pb-white/90 backdrop-blur-sm text-pb-deep text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Eye className="w-4 h-4 text-pb-emerald" />
              Clique para abrir em alta resolução
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
          <div className="relative max-w-5xl w-full bg-pb-white rounded-2xl overflow-hidden shadow-2xl border border-pb-line flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 bg-pb-deep text-pb-light flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {personName} — Volume {volumeNumber} (Páginas Impressas)
                </h3>
                <p className="text-xs text-pb-light/80">
                  Diagramação original de duas páginas com biografia e QR Code.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto p-4 sm:p-6 flex-1 flex items-center justify-center bg-stone-100">
              <img
                src={spreadImageUrl}
                alt={`Miolo de ${personName}`}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-book"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/spread.jpg';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

