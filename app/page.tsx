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

      {/* Portrait mode warning removed - layout is now responsive */}

      <div className="flex flex-col items-center gap-4 mb-4 ">
        <div className='items-center flex flex-col px-4 text-center'>
          <h1 className="text-xl sm:text-2xl font-bold text-black mt-4">Türkiye&apos;nin Üniversite Haritası</h1>
          <p className="text-base sm:text-xl text-gray-800 ">Toplam Üniversite Sayısı: {filteredUniversityCount}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Veriler YÖK Atlas&apos;tan alınmıştır.</p>
        </div>

        <div className="flex flex-col items-center gap-2 my-2 p-4 sm:p-6 bg-lime-100 rounded-2xl shadow-sm border border-lime-300 w-full max-w-2xl mx-4">
          <div className="text-2xl sm:text-4xl font-black text-lime-900 drop-shadow-sm mb-2 tabular-nums text-center">
            {animationYear !== null ? `Yıl: ${animationYear}` : "Tüm Yıllar"}
          </div>

          <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2 relative overflow-hidden">
            <div
              className="bg-lime-600 h-2.5 rounded-full transition-all duration-75"
              style={{ width: animationYear !== null ? `${((animationYear - minYear) / (maxYear - minYear)) * 100}%` : '0%' }}
            ></div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
            <button
              onClick={handlePlayPause}
              className={`flex items-center justify-center gap-2 w-28 sm:w-36 py-2 sm:py-3 rounded-full font-bold transition-all shadow-md transform hover:scale-105 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-lime-600 hover:bg-lime-700'} text-white text-sm sm:text-base`}
              title={isPlaying ? "Duraklat" : "Oynat"}
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
              {isPlaying ? "Duraklat" : "Başlat"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white w-24 sm:w-32 py-2 sm:py-3 rounded-full font-bold transition-all shadow-md disabled:opacity-50 disabled:transform-none transform hover:scale-105 text-sm sm:text-base"
              disabled={animationYear === null && !isPlaying}
              title="Sıfırla"
            >
              <FaStop size={16} /> Sıfırla
            </button>
            <div className="flex items-center gap-1 bg-white rounded-full px-3 border border-gray-300">
              <button
                onClick={() => handleSpeedChange(-0.25)}
                className="p-2 text-gray-600 hover:text-lime-700 transition"
                title="Yavaşlat"
              >
                <FaMinus size={14} />
              </button>
              <span className="font-bold text-gray-700 w-10 text-center text-sm">{animationSpeed}x</span>
              <button
                onClick={() => handleSpeedChange(0.25)}
                className="p-2 text-gray-600 hover:text-lime-700 transition"
                title="Hızlandır"
              >
                <FaPlus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 px-4 mt-2">
          <button onClick={() => toggleFilter('all')} className={buttonClasses('all')}>
            Tümü
          </button>
          <button onClick={() => toggleFilter('state')} className={buttonClasses('state')}>
            Devlet
          </button>
          <button onClick={() => toggleFilter('private')} className={buttonClasses('private')}>
            Vakıf
          </button>
          <button onClick={() => toggleFilter('before2000')} className={buttonClasses('before2000')}>
            2000 Öncesi
          </button>
          <button onClick={() => toggleFilter('after2000')} className={buttonClasses('after2000')}>
            2000 Sonrası
          </button>
        </div>
      </div>

      <div className='mb-8'>
        <TurkeyMap filters={activeFilters} animationYear={animationYear} isPlaying={isPlaying} />
      </div>

      <div className='flex justify-center gap-4 mb-4 mt-2'>
        <a target='_blank' href="https://github.com/alprenkrc"><FaGithub size={28} color='black' /></a>
        <a target='_blank' href="https://www.linkedin.com/in/alperen-k%C4%B1r%C4%B1c%C4%B1-001887150/"><FaLinkedin size={28} color='black' /></a>
        <a target='_blank' href="https://www.instagram.com/alprenkrc"><FaInstagram size={28} color='black' /></a>
        <a target='_blank' href="https://x.com/linepiercer"><FaSquareXTwitter size={28} color='black' /></a>
      </div>

    </main>
  );
};

export default Page;
