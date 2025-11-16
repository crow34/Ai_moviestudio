import React from 'react';
import { View } from '../App';
import UserIcon from './icons/UserIcon';
import ImageIcon from './icons/ImageIcon';
import CubeIcon from './icons/CubeIcon';
import FireIcon from './icons/FireIcon';
import LayersIcon from './icons/LayersIcon';
import VideoIcon from './icons/VideoIcon';
import BookIcon from './icons/BookIcon';
import BookOpenIcon from './icons/BookOpenIcon';


interface HomeProps {
  setActiveView: (view: View) => void;
}

const HomeCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, icon, onClick }) => (
  <button 
    onClick={onClick} 
    className="bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-center aspect-square transition-all duration-300 hover:bg-zinc-800/80 hover:scale-105 border border-zinc-700 hover:border-zinc-600"
  >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
  </button>
);

const Home: React.FC<HomeProps> = ({ setActiveView }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-4xl sm:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-2">
        What would you like to
      </h1>
      <h1 className="text-4xl sm:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-12">
        create today?
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <HomeCard title="Characters" icon={<UserIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('character')} />
          <HomeCard title="Scenes" icon={<ImageIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('scene')} />
          <HomeCard title="Script" icon={<BookIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('script')} />
          <HomeCard title="Props" icon={<CubeIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('props')} />
          <HomeCard title="VFX" icon={<FireIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('vfx')} />
          <HomeCard title="Editor" icon={<LayersIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('editor')} />
          <HomeCard title="Video Lab" icon={<VideoIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('video')} />
          <HomeCard title="Cover Creator" icon={<BookOpenIcon className="w-8 h-8 text-white" />} onClick={() => setActiveView('cover')} />
      </div>
    </div>
  );
};

export default Home;