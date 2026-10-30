import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper, Heart, Calendar, ArrowRight, UserPlus } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { DiaryPost } from '../../types/index.js';

export const MyFeed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<DiaryPost[]>([]);
  const [followedCount, setFollowedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      if (!user) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.getMyFeed();
        if (res.success && res.data) {
          setFeed(res.data.feed || []);
          setFollowedCount(res.data.followedCount || 0);
        }
      } catch (err) {
        console.error('Error loading feed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeed();
  }, [user]);

  return (
    <div className="min-h-screen bg-pb-bg py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-pb-line">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-pb-gold block mb-1">
              Feed Literário
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pb-text">
              The Living Feed
            </h1>
            <p className="text-xs text-pb-muted mt-1">
              Atualizações e novos capítulos das pessoas reais que você acompanha.
            </p>
          </div>

          <div className="text-xs text-pb-deep bg-pb-light px-3.5 py-1.5 rounded-full font-bold self-start sm:self-auto">
            Seguindo {followedCount} protagonistas
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-pb-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-serif text-pb-muted">Buscando atualizações de diário...</p>
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-pb-white rounded-3xl border border-pb-line p-14 text-center shadow-editorial">
            <UserPlus className="w-12 h-12 text-pb-emerald mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-pb-text mb-2">
              Seu Feed Literário está Vazio
            </h3>
            <p className="text-sm text-pb-muted max-w-md mx-auto mb-8 leading-relaxed">
              Para acompanhar o Diário Vivo, ative o volume correspondente na sua biblioteca e siga os protagonistas cujas histórias inspiram sua jornada.
            </p>
            <Link
              to="/people"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pb-emerald text-white text-xs font-bold hover:bg-pb-primary transition-colors"
            >
              <span>Explorar Protagonistas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {feed.map((post) => (
              <article
                key={post.id}
                className="bg-pb-white rounded-3xl border border-pb-line p-8 shadow-editorial hover:-translate-y-0.5 transition-all"
              >
                {/* Author Header */}
                {post.author && (
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-pb-line">
                    <Link
                      to={`/people/${post.author.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-11 h-11 rounded-full object-cover border border-pb-line"
                      />
                      <div>
                        <h4 className="font-serif text-base font-bold text-pb-text group-hover:text-pb-emerald transition-colors">
                          {post.author.name}
                        </h4>
                        <p className="text-xs text-pb-muted">
                          {post.author.profession} • Volume {post.author.primaryVolumeId}
                        </p>
                      </div>
                    </Link>

                    <span className="text-[11px] text-pb-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <h3 className="font-serif text-2xl font-bold text-pb-text mb-3">
                  {post.title}
                </h3>

                <div className="text-sm text-pb-text/90 leading-relaxed whitespace-pre-line mb-6 font-sans">
                  {post.content}
                </div>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-pb-line mb-6">
                    <img src={post.mediaUrls[0]} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="pt-4 border-t border-pb-line/60 flex items-center justify-between text-xs text-pb-muted">
                  <div className="flex items-center gap-2">
                    {post.tags.map((tg, idx) => (
                      <span key={idx} className="bg-pb-bg px-2.5 py-1 rounded-md text-pb-text font-medium">
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 font-semibold text-pb-emerald">
                    <Heart className="w-4 h-4 fill-pb-emerald" />
                    <span>{post.likesCount}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

