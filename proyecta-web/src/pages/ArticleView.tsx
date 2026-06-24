import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, 
  ChevronLeft, Star, FlaskConical, Lightbulb, Target,
  MoreVertical, UserPlus, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ArticleView = () => {
  const { id } = useParams();
  const [hasVoted, setHasVoted] = useState(0); // -1, 0, 1
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Simulated article data
  const article = {
    id: id,
    title: 'Avances en la síntesis de biopolímeros a partir de desechos agrícolas en Mesoamérica',
    content: `
      <h2>Introducción</h2>
      <p>La búsqueda de alternativas sostenibles a los plásticos convencionales ha llevado a un interés creciente en los biopolímeros derivados de residuos agroindustriales. En este estudio, nos enfocamos en el aprovechamiento de los desechos de la industria del café y el maíz en la región mesoamericana, buscando no solo reducir el impacto ambiental de los residuos, sino también crear un valor añadido para las economías rurales.</p>
      
      <h2>Metodología</h2>
      <p>Se recolectaron muestras de bagazo de café y cáscara de maíz de tres cooperativas en Chiapas, México. Estas muestras fueron sometidas a un proceso de hidrólisis ácida controlada seguida de una fermentación bacteriana utilizando cepas de <i>Bacillus subtilis</i> seleccionadas por su capacidad de síntesis de polihidroxialcanoatos (PHA).</p>

      <blockquote>
        "Los resultados preliminares muestran una eficiencia de conversión del 34% en peso seco, superando los promedios reportados anteriormente para sustratos similares en la literatura técnica regional."
      </blockquote>

      <h2>Resultados y Discusión</h2>
      <p>El análisis por infrarrojo (FTIR) confirmó la estructura de los polímeros obtenidos, mostrando bandas características de los ésteres del PHA. La biodegradabilidad fue evaluada en condiciones de compostaje industrial, donde el material mostró una degradación del 90% en un periodo de 45 días.</p>
    `,
    category: 'Biotecnología',
    date: 'Publicado el 24 de Mayo, 2024',
    author: {
      id: 'usr_1',
      name: 'Dr. Alejandro Silva',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2dw=150&h=150&fit=crop',
      orcidId: '0000-0002-1234-5678',
      affiliation: 'UNAM, Ciudad de México',
      reputation: 156
    },
    metrics: {
      votes: 42,
      comments: 12,
      reviews: 5
    }
  };

  const handleVote = (val: number) => {
    if (hasVoted === val) setHasVoted(0);
    else setHasVoted(val);
    toast.success(val === 1  '¡Voto positivo registrado!' : 'Voto negativo registrado');
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* Left Sidebar - Interaction */}
        <aside className="hidden lg:flex flex-col items-center gap-8 sticky top-24 h-fit pt-4 w-12 shrink-0">
          <div className="flex flex-col items-center gap-4 bg-white p-3 rounded-full border border-slate-200 shadow-sm">
            <button 
              onClick={() => handleVote(1)}
              className={`p-2 rounded-full transition-all ${hasVoted === 1  'bg-fuchsia-100 text-fuchsia-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ArrowUp size={24} />
            </button>
            <span className="text-lg font-black text-slate-700">{article.metrics.votes + hasVoted}</span>
            <button 
              onClick={() => handleVote(-1)}
              className={`p-2 rounded-full transition-all ${hasVoted === -1  'bg-red-100 text-red-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ArrowDown size={24} />
            </button>
          </div>
          <button className="p-3 bg-white rounded-full border border-slate-200 shadow-sm text-slate-400 hover:text-fuchsia-600 hover:border-fuchsia-200 transition-all">
            <Bookmark size={24} />
          </button>
          <button className="p-3 bg-white rounded-full border border-slate-200 shadow-sm text-slate-400 hover:text-fuchsia-600 hover:border-fuchsia-200 transition-all">
            <Share2 size={24} />
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-fuchsia-600 mb-8 transition-colors">
            <ChevronLeft size={18} /> Volver al feed
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-fuchsia-50 text-fuchsia-600 text-xs font-black uppercase tracking-widest rounded-full border border-fuchsia-100">
                {article.category}
              </span>
              <span className="text-sm text-slate-400 font-medium italic">• {article.date}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] mb-8">
              {article.title}
            </h1>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
              <div className="flex items-center gap-4">
                <Link to={`/profile/${article.author.id}`} className="shrink-0">
                  <img src={article.author.image} alt={article.author.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${article.author.id}`} className="font-black text-slate-900 hover:text-fuchsia-600 transition-colors">
                      {article.author.name}
                    </Link>
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1.5">
                      <img src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" alt="ORCID" className="w-3 h-3" />
                      ORCID Verificado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{article.author.affiliation}</p>
                </div>
              </div>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-fuchsia-600 bg-white hover:bg-fuchsia-600 hover:text-white rounded-xl transition-all border border-fuchsia-100 shadow-sm">
                <UserPlus size={16} /> Seguir
              </button>
            </div>
          </header>

          <div 
            className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-blockquote:border-fuchsia-500 prose-blockquote:bg-fuchsia-50 prose-blockquote:py-2 prose-blockquote:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Engagement Footer */}
          <section className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">Conversación Científica</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{article.metrics.comments} comentarios</span>
              </div>
            </div>

            <div className="flex gap-4 mb-12">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2dw=150&h=150&fit=crop" className="w-10 h-10 rounded-full shrink-0" alt="Current User" />
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-fuchsia-500/20 focus-within:border-fuchsia-500 transition-all">
                <textarea 
                  placeholder="Añade tu comentario o pregunta científica..."
                  className="w-full border-none focus:ring-0 p-0 text-sm min-h-[80px] text-slate-700 placeholder:italic"
                />
                <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                  <button className="px-5 py-2 bg-fuchsia-600 text-white text-xs font-bold rounded-lg hover:bg-fuchsia-700 transition-colors shadow-md shadow-fuchsia-200">
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar - Peer Review */}
        <aside className="lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FlaskConical size={20} className="text-fuchsia-600" /> Peer Review
            </h3>
            
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2"><Target size={14} className="text-fuchsia-500" /> Claridad</span>
                  <span className="text-fuchsia-600">4.8/5</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2"><FlaskConical size={14} className="text-purple-500" /> Rigor</span>
                  <span className="text-purple-600">4.2/5</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2"><Lightbulb size={14} className="text-amber-500" /> Utilidad</span>
                  <span className="text-amber-600">4.5/5</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Evaluar artículo
            </button>

            {showReviewForm && (
              <div className="mt-6 p-4 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-medium text-fuchsia-700 mb-4 flex items-center gap-1.5">
                  <Info size={14} /> Tu evaluación afectará la reputación del autor y la visibilidad del post.
                </p>
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-1 hover:text-fuchsia-600 text-slate-400">
                      <Star size={24} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Revisiones recientes</h4>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={`https://i.pravatar.cc/150u=${i}`} className="w-5 h-5 rounded-full" alt="Reviewer" />
                    <span className="font-bold text-slate-800">Dra. Marta Ruiz</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed line-clamp-2">
                    "La métodología es sólida, pero sugeriría ampliar la muestra de biopolímeros en el siguiente ciclo."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticleView;
