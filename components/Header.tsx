import React from 'react';
import SparkleIcon from './icons/SparkleIcon';
import UserIcon from './icons/UserIcon';
import ImageIcon from './icons/ImageIcon';
import LayersIcon from './icons/LayersIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import FireIcon from './icons/FireIcon';
import CubeIcon from './icons/CubeIcon';
import { View } from '../App';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../constants';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  artStyle: ArtStyle;
  setArtStyle: (style: ArtStyle) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-md text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-300 hover:bg-slate-700'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, artStyle, setArtStyle }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10 py-3 px-4 sm:px-8 border-b border-slate-700">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SparkleIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 hidden md:block">
            AI Comic Book Generator
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
           <div className="relative flex items-center bg-slate-800 p-1 rounded-lg">
            <PaintBrushIcon className="w-5 h-5 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
              className="bg-transparent border-0 rounded-md py-1.5 pl-7 sm:pl-9 pr-2 sm:pr-3 text-sm font-semibold text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              aria-label="Select Art Style"
            >
              {ART_STYLES.map(style => (
                  <option key={style.value} value={style.value} className="bg-slate-800 text-base">{style.label}</option>
              ))}
            </select>
          </div>
          <nav className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            <NavButton
              label="Character Studio"
              icon={<UserIcon className="w-5 h-5" />}
              isActive={activeView === 'character'}
              onClick={() => setActiveView('character')}
            />
            <NavButton
              label="Scene Studio"
              icon={<ImageIcon className="w-5 h-5" />}
              isActive={activeView === 'scene'}
              onClick={() => setActiveView('scene')}
            />
            <NavButton
              label="Props Studio"
              icon={<CubeIcon className="w-5 h-5" />}
              isActive={activeView === 'props'}
              onClick={() => setActiveView('props')}
            />
            <NavButton
              label="Scene Editor"
              icon={<LayersIcon className="w-5 h-5" />}
              isActive={activeView === 'editor'}
              onClick={() => setActiveView('editor')}
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;