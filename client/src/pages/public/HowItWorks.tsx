import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, QrCode, Lock, Heart, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-pb-bg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-2">
            A Experiência PeopleBooks
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-pb-text tracking-tight mb-4">
            Como Funciona a Literatura Viva
          </h1>
          <p className="text-base text-pb-muted leading-relaxed max-w-2xl mx-auto">
            Entenda como conectamos o objeto livro impresso com a plataforma digital onde cada protagonista continua escrevendo sua história.
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              step: 'Passo 01',
              title: 'O Livro Físico na Amazon',
              desc: 'Tudo começa com a leitura física. Você adquire um volume do PeopleBooks na Amazon. Cada volume apresenta oito pessoas reais, suas fotografias em página inteira, seus desafios, conquistas e relatos biográficos.',
              icon: BookOpen,
              highlight: 'Aproximadamente 2 páginas nobres por participante no miolo impresso.',
            },
            {
              step: 'Passo 02',
              title: 'O QR Code Individual Permanente',
              desc: 'No canto inferior de cada biografia impressa existe um QR Code exclusivo e um endereço permanente (ex: peoplebooks.net/people/juliana-moreira). Escaneie com seu celular para abrir o perfil digital.',
              icon: QrCode,
              highlight: 'O QR Code aponta para o perfil permanente e não carrega senhas ou tokens secretos.',
            },
            {
              step: 'Passo 03',
              title: 'Ativação do Volume por Verificação Auditável',
              desc: 'Qualquer visitante pode ler a prévia pública da história. Para acessar o Living Diary íntimo, galerias exclusivas e solicitar conversa, o leitor ativa o volume informando seu comprovante ou chave de teste.',
              icon: Lock,
              highlight: 'O acesso a um volume específico não concede acesso automático a outros volumes.',
            },
            {
              step: 'Passo 04',
              title: 'O Diário Vivo (The Living Diary)',
              desc: 'A vida não para quando o livro é impresso. Os participantes utilizam o Author Studio para publicar novos capítulos, fotos de viagens, decisões de vida e reflexões em tempo real para os leitores do seu volume.',
              icon: Heart,
              highlight: 'As mídias privadas são protegidas e entregues via cofre seguro com URLs temporárias.',
            },
            {
              step: 'Passo 05',
              title: 'Conexão Humana & Conversas Voluntárias',
              desc: 'Ao contrário de redes sociais ruidosas, as mensagens no PeopleBooks exigem uma solicitação de apresentação prévia. O autor tem total liberdade para aceitar, conversar com respeito ou encerrar o contato.',
              icon: MessageSquare,
              highlight: 'Dados pessoais como telefone e endereço nunca são divulgados.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-pb-white rounded-3xl border border-pb-line p-8 sm:p-10 shadow-editorial flex flex-col sm:flex-row items-start gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-pb-emerald/10 text-pb-emerald shrink-0 flex items-center justify-center font-serif text-xl font-bold">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-pb-gold font-bold">
                    {item.step}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-pb-text mt-1 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-pb-muted leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <div className="inline-flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-pb-bg border border-pb-line text-xs font-medium text-pb-deep">
                    <ShieldCheck className="w-4 h-4 text-pb-emerald shrink-0" />
                    <span>{item.highlight}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/people"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-pb-emerald hover:bg-pb-primary text-white text-sm font-bold shadow-editorial transition-all"
          >
            <span>Explorar Protagonistas Publicados</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

