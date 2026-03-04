"use client"
import React, { useState, useEffect, useMemo } from 'react';
import TurkeyMap from '@/components/TurkeyMap';
import { citiesData } from '@/data/cities';
import { FaInstagram, FaGithub, FaLinkedin, FaPlay, FaPause, FaStop, FaPlus, FaMinus } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Page = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [isPortrait, setIsPortrait] = useState(false);
  const [filteredUniversityCount, setFilteredUniversityCount] = useState<number>(
    citiesData.reduce((acc, city) => acc + city.universities.length, 0)
  );

  const [animationYear, setAnimationYear] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const allYears = useMemo(() => citiesData.flatMap(city => city.universities.map(uni => uni.foundedYear)), []);
  const minYear = useMemo(() => Math.min(...allYears), [allYears]);
  const maxYear = useMemo(() => Math.max(...allYears), [allYears]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const toggleFilter = (filterType: string) => {
    if (filterType === 'all') {
      setActiveFilters(['all']);
      return;
    }

    let newFilters = activeFilters.filter(f => f !== 'all');
    if (newFilters.includes(filterType)) {
      newFilters = newFilters.filter(f => f !== filterType);
    } else {
      newFilters.push(filterType);
    }

    setActiveFilters(newFilters.length === 0 ? ['all'] : newFilters);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationYear(prev => {
          if (prev === null) return minYear;
          if (prev >= maxYear) {
            setIsPlaying(false);
            return maxYear;
          }
          return prev + 1;
        });
      }, 500 / animationSpeed); // Hıza göre gecikme süresi
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxYear, minYear, animationSpeed]);

  useEffect(() => {
    const calculateFilteredCount = () => {
      return citiesData.reduce((acc, city) => {
        const filteredUniversities = city.universities.filter(university => {
          // Animasyon filtresi
          if (animationYear !== null && university.foundedYear > animationYear) return false;

          if (activeFilters.includes('all')) return true;

          // Tip filtresi kontrolü (devlet/vakıf)
          const typeFilters = activeFilters.filter(f => ['state', 'private'].includes(f));
          const matchesType = typeFilters.length === 0 || typeFilters.some(filter =>
            (filter === 'state' && university.type === 'state') ||
            (filter === 'private' && university.type === 'private')
          );

          // Yıl filtresi kontrolü (2000 öncesi/sonrası)
          const yearFilters = activeFilters.filter(f => ['before2000', 'after2000'].includes(f));
          const matchesYear = yearFilters.length === 0 || yearFilters.some(filter =>
            (filter === 'before2000' && university.foundedYear < 2000) ||
            (filter === 'after2000' && university.foundedYear >= 2000)
          );

          return matchesType && matchesYear;
        });
        return acc + filteredUniversities.length;
      }, 0);
    };

    setFilteredUniversityCount(calculateFilteredCount());
  }, [activeFilters, animationYear]);

  const handlePlayPause = () => {
    if (animationYear === maxYear) {
      setAnimationYear(minYear);
    } else if (animationYear === null) {
      setAnimationYear(minYear);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAnimationYear(null);
  };

  const handleSpeedChange = (delta: number) => {
    setAnimationSpeed(prev => {
      const newSpeed = Math.round((prev + delta) * 4) / 4; // 0.25x adımlarla yuvarla
      return Math.max(0.5, Math.min(newSpeed, 5)); // Min 0.5x, Max 5x hız
    });
  };

  const buttonClasses = (currentFilter: string) =>
    `mx-2 px-4 py-2 rounded-full ${activeFilters.includes(currentFilter) ? 'bg-lime-900' : 'bg-lime-600'} text-white`;

  return (
    <main className='justify-center items-center flex flex-col bg-[#c4e6c3] min-h-screen'>

      {/* Portrait/mobile rotation warning */}
      {isPortrait && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-2 fixed top-0 left-0 right-0 z-50 text-sm font-bold shadow">
          📱 Daha iyi görüntüleme için telefonunuzu yan çevirin!
        </div>
      )}

      {/* Sticky animation control bar at top */}
      <div className={`sticky z-30 w-full bg-lime-100/95 backdrop-blur border-b border-lime-300 shadow-sm px-4 py-2 ${isPortrait ? 'top-9' : 'top-0'}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-2">
          {/* Year + progress */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg sm:text-2xl font-black text-lime-900 tabular-nums whitespace-nowrap">
              {animationYear !== null ? `📅 ${animationYear}` : "Tüm Yıllar"}
            </span>
            <div className="flex-1 bg-gray-300 rounded-full h-2 overflow-hidden min-w-[60px]">
              <div
                className="bg-lime-600 h-2 rounded-full transition-all duration-75"
                style={{ width: animationYear !== null ? `${((animationYear - minYear) / (maxYear - minYear)) * 100}%` : '0%' }}
              />
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm transition-all shadow transform hover:scale-105 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-lime-600 hover:bg-lime-700'} text-white`}
            >
              {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} />}
              {isPlaying ? "Duraklat" : "Başlat"}
            </button>
            <button
              onClick={handleReset}
              disabled={animationYear === null && !isPlaying}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-full font-bold text-sm transition-all shadow transform hover:scale-105"
            >
              <FaStop size={13} /> Sıfırla
            </button>
            <div className="flex items-center gap-1 bg-white rounded-full px-2.5 py-1 border border-gray-300">
              <button onClick={() => handleSpeedChange(-0.25)} className="text-gray-600 hover:text-lime-700 transition p-1">
                <FaMinus size={12} />
              </button>
              <span className="font-bold text-gray-700 w-9 text-center text-xs">{animationSpeed}x</span>
              <button onClick={() => handleSpeedChange(0.25)} className="text-gray-600 hover:text-lime-700 transition p-1">
                <FaPlus size={12} />
              </button>
            </div>
          </div>
        </div>
        {/* Filter buttons row inside sticky bar */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-1.5 pb-0.5">
          <button onClick={() => toggleFilter('all')} className={buttonClasses('all')}>
            Tüm Üniversiteler
          </button>
          <button onClick={() => toggleFilter('state')} className={buttonClasses('state')}>
            Devlet Üniversiteleri
          </button>
          <button onClick={() => toggleFilter('private')} className={buttonClasses('private')}>
            Vakıf Üniversiteleri
          </button>
          <button onClick={() => toggleFilter('before2000')} className={buttonClasses('before2000')}>
            2000 Öncesi Kurulan
          </button>
          <button onClick={() => toggleFilter('after2000')} className={buttonClasses('after2000')}>
            2000 Sonrası Kurulan
          </button>
        </div>
      </div>

      {/* Title */}
      <div className='items-center flex flex-col px-4 text-center pt-3 pb-1'>
        <h1 className="text-xl sm:text-2xl font-bold text-black">Türkiye&apos;nin Üniversite Haritası</h1>
        <p className="text-base sm:text-lg text-gray-800">Toplam Üniversite Sayısı: {filteredUniversityCount}</p>
        <p className="text-xs text-gray-500">Veriler YÖK Atlas&apos;tan alınmıştır.</p>
      </div>

      {/* Map */}
      <div className='w-full'>
        <TurkeyMap filters={activeFilters} animationYear={animationYear} isPlaying={isPlaying} />
      </div>


      {/* Social links */}
      <div className='flex justify-center gap-4 mb-4'>
        <a target='_blank' href="https://github.com/alprenkrc"><FaGithub size={28} color='black' /></a>
        <a target='_blank' href="https://www.linkedin.com/in/alperen-k%C4%B1r%C4%B1c%C4%B1-001887150/"><FaLinkedin size={28} color='black' /></a>
        <a target='_blank' href="https://www.instagram.com/alprenkrc"><FaInstagram size={28} color='black' /></a>
        <a target='_blank' href="https://x.com/linepiercer"><FaSquareXTwitter size={28} color='black' /></a>
      </div>

    </main>
  );
};

export default Page;

