"use client"
import React, { useState, useEffect } from 'react';
import TurkeyMap from '@/components/TurkeyMap';
import { citiesData } from '@/data/cities';
import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Page = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [isPortrait, setIsPortrait] = useState(false);
  const [filteredUniversityCount, setFilteredUniversityCount] = useState<number>(
    citiesData.reduce((acc, city) => acc + city.universities.length, 0)
  );

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
    const calculateFilteredCount = () => {
      if (activeFilters.includes('all')) {
        return citiesData.reduce((acc, city) => acc + city.universities.length, 0);
      }

      return citiesData.reduce((acc, city) => {
        const filteredUniversities = city.universities.filter(university => {
          if (activeFilters.includes('state') && university.type === 'state') return true;
          if (activeFilters.includes('private') && university.type === 'private') return true;
          if (activeFilters.includes('before2000') && university.foundedYear < 2000) return true;
          if (activeFilters.includes('after2000') && university.foundedYear >= 2000) return true;
          return false;
        });
        return acc + filteredUniversities.length;
      }, 0);
    };

    setFilteredUniversityCount(calculateFilteredCount());
  }, [activeFilters]);

  const buttonClasses = (currentFilter: string) =>
    `mx-2 px-4 py-2 rounded-full ${activeFilters.includes(currentFilter) ? 'bg-lime-900' : 'bg-lime-600'} text-white`;

  return (
    <main className='justify-center items-center flex flex-col bg-[#c4e6c3] min-h-screen'>

      {isPortrait && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 fixed top-0 left-0 right-0 z-50">
          <p className="font-bold">Daha iyi görüntüleme için telefonunuzu yan çevirin!</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 mb-4 ">
        <div className='items-center flex flex-col '>
          <h1 className="text-2xl font-bold text-black mt-4">Türkiye`&apos;`nin Üniversite Haritası</h1>
          <p className="text-xl text-gray-800 ">Toplam Üniversite Sayısı: {filteredUniversityCount}</p>
          <p className="text-sm text-gray-500 mt-1">Veriler YÖK Atlas'tan alınmıştır.</p>
        </div>

        <div className="flex justify-center gap-2 max-md:flex-col">
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

      <div className='mb-8'>
        <TurkeyMap filters={activeFilters} />
      </div>

      <div className='flex justify-center gap-4 mb-4'>
        <a target='_blank' href="https://github.com/alprenkrc"><FaGithub size={35} color='black' /></a>
        <a target='_blank' href="https://www.linkedin.com/in/alperen-k%C4%B1r%C4%B1c%C4%B1-001887150/"><FaLinkedin size={35} color='black' /></a>
        <a target='_blank' href="https://www.instagram.com/alprenkrc"><FaInstagram size={35} color='black' /></a>
        <a target='_blank' href="https://x.com/linepiercer"><FaSquareXTwitter size={35} color='black' /></a>
      </div>

    </main>
  );
};

export default Page;
