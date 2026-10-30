import React from 'react';
import { BookOpen, ShieldCheck, HeartHandshake } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-2">
            Manifesto Editorial
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text tracking-tight mb-4">
            Sobre o PeopleBooks
          </h1>
          <p className="text-lg text-pb-muted leading-relaxed font-serif italic">
            "A história começa no livro, mas continua na vida real."
          </p>
        </div>

        <div className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-12 shadow-editorial space-y-8 text-sm sm:text-base text-pb-text/90 leading-relaxed font-sans">
          <p>
            O <strong>PeopleBooks.net</strong> nasceu para resgatar o valor sagrado da literatura biográfica humana em uma era dominada por feeds efêmeros e algoritmos ruidosos.
          </p>

          <p>
            Acreditamos que cada ser humano carrega uma história que merece ser contada com respeito, beleza tipográfica e profundidade editorial. Por isso, publicamos antologias em volumes impressos distribuídos na Amazon, onde cada pessoa ocupa duas páginas generosas com fotografia e memórias autênticas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 py-6 border-y border-pb-line">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-pb-light text-pb-deep mx-auto flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-pb-emerald" />
              </div>
              <h4 className="font-serif text-lg font-bold text-pb-text mb-1">Cada Pessoa é um Livro</h4>
              <p className="text-xs text-pb-muted leading-relaxed">
                Não somos uma rede de relacionamentos superficial, mas uma plataforma literária de histórias de vida.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-pb-light text-pb-deep mx-auto flex items-center justify-center mb-3">
                <HeartHandshake className="w-6 h-6 text-pb-emerald" />
              </div>
              <h4 className="font-serif text-lg font-bold text-pb-text mb-1">Conexão Voluntária</h4>
              <p className="text-xs text-pb-muted leading-relaxed">
                Conversas privadas acontecem somente após aceite mútuo, preservando a intimidade e a paz dos autores.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-pb-light text-pb-deep mx-auto flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-pb-emerald" />
              </div>
              <h4 className="font-serif text-lg font-bold text-pb-text mb-1">Monetização Ética</h4>
              <p className="text-xs text-pb-muted leading-relaxed">
                80% da receita de capítulos adicionais individuais é repassada diretamente ao participante que os escreveu.
              </p>
            </div>
          </div>

          <p>
            No PeopleBooks, os livros não envelhecem esquecidos em estantes poeirentas: eles ganham vida própria através de QR Codes permanentes e comunidades dedicadas a cada volume.
          </p>
        </div>
      </div>
    </div>
  );
};

