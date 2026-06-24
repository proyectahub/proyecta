import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ExternalLink, GraduationCap, MapPin, Award, Book, 
  RefreshCw, FileText, BarChart2, Star, Quote, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOCK_ORCID_WORKS = [
  {
    title: 'Characterization of sustainable biopolymers from agricultural waste',
    year: 2022,
    type: 'Journal Article',
    doi: '10.1016/j.biopoly.2022.10.004',
    journal: 'Biopolymers & Sustainability'
  },
  {
    title: 'New pathways for cellulose extraction in tropical environments',
    year: 2020,
    type: 'Conference Proceeding',
    doi: '10.1109/IEEE.BIO.2020.1234',
    journal: 'IEEE Bio-Engineering LatAm'
  },
  {
    title: 'Sustainable materials for rural construction: A review',
    year: 2018,
    type: 'Book Chapter',
    journal: 'Global Sustainable Development'
  }
];

const Profile = () => {
  const { id } = useParams();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('orcid');

  // Simulated user data
  const user = {
    name: 'Dr. Alejandro Silva',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2dw=300&h=300&fit=crop',
    reputation: 156,
    orcidId: '0000-0002-1234-5678',
    affiliation: 'Universidad Nacional Autónoma de México (UNAM)',
    bio: 'Investigador en Biotecnología Aplicada. Especializado en el desarrollo de biopolímeros sustentables a partir de residuos agroindustriales. Apasionado por la ciencia abierta y la democratización del conocimiento.',
    metrics: {
      publications: 24,
      citations: 128,
      hIndex: 8
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    toast.loading('Sincronizando con ORCID...');
    setTimeout(() => {
      setIsSyncing(false);
      toast.dismiss();
      toast.success('Perfil actualizado desde ORCID iD');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-fuchsia-600 to-purple-700 relative">
          <button 
            onClick={handleSync}
            className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
            disabled={isSyncing}
          >
            <RefreshCw size={20} className={isSyncing  'animate-spin' : ''} />
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row gap-8 items-end -mt-20 mb-6">
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-40 h-40 rounded-3xl border-8 border-white object-cover shadow-lg"
            />
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                  <img src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" alt="ORCID" className="w-3 h-3" />
                  ORCID iD: {user.orcidId}
                </div>
              </div>
              <p className="text-slate-600 flex items-center gap-2 mt-2 font-medium">
                <GraduationCap size={18} className="text-fuchsia-600" /> {user.affiliation}
              </p>
            </div>
            <div className="flex items-center gap-4 pb-2">
              <div className="bg-fuchsia-600 text-white px-6 py-3 rounded-2xl text-center shadow-lg shadow-fuchsia-200">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Reputación</p>
                <p className="text-2xl font-black">{user.reputation}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Biografía</h3>
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  "{user.bio}"
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6 py-8 border-y border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{user.metrics.publications}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publicaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{user.metrics.citations}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citas (Google)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{user.metrics.hIndex}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">h-index</p>
                </div>
              </div>

              {/* Tabs Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-8 border-b border-slate-100">
                  <button 
                    onClick={() => setActiveTab('orcid')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'orcid'  'text-fuchsia-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    ORCID Works
                    {activeTab === 'orcid' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-fuchsia-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('nova')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'nova'  'text-fuchsia-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Proyecta Posts
                    {activeTab === 'nova' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-fuchsia-600 rounded-full" />}
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTab === 'orcid'  (
                    MOCK_ORCID_WORKS.map((work, idx) => (
                      <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-fuchsia-200 transition-all group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-fuchsia-600 transition-colors">{work.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {work.journal} • {work.year}
                            </p>
                            {work.doi && (
                              <a href={`https://doi.org/${work.doi}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-fuchsia-500 font-bold mt-2 hover:underline">
                                <ExternalLink size={12} /> DOI: {work.doi}
                              </a>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-400 rounded uppercase tracking-wider">
                            {work.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500 font-medium italic">No hay publicaciones de divulgación en Proyecta todavía.</p>
                      <button className="mt-4 text-fuchsia-600 text-sm font-bold hover:underline flex items-center gap-2 mx-auto">
                        Escribir primera publicación <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <BarChart2 size={16} className="text-fuchsia-600" /> Resumen de Actividad
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Revisiones realizadas</span>
                    <span className="text-sm font-black text-slate-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Artículos comentados</span>
                    <span className="text-sm font-black text-slate-900">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Upvotes recibidos</span>
                    <span className="text-sm font-black text-green-600">+342</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Badges académicos</h4>
                  <div className="flex flex-wrap gap-3">
                    <div title="Revisor Verificado" className="w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center text-fuchsia-600">
                      <Star size={20} />
                    </div>
                    <div title="Divulgador Pro" className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <Book size={20} />
                    </div>
                    <div title="Top 100 LatAm" className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                      <Award size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <Quote size={24} className="text-fuchsia-400" />
                  <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">Cita destacada</span>
                </div>
                <p className="text-sm leading-relaxed font-serif italic text-slate-300">
                  "La ciencia no existe hasta que se comunica de forma abierta y transparente a la sociedad."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
