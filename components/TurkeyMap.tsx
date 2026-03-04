"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { citiesData } from "../data/cities";
import MapFeatures from "./MapFeatures";
import { IoMdClose } from "react-icons/io";

interface TurkeyMapProps {
  filters: string[];
  animationYear?: number | null;
  isPlaying?: boolean;
}

const TurkeyMap = ({ filters, animationYear, isPlaying = true }: TurkeyMapProps) => {
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    cityName: ""
  });
  const [fixedTooltip, setFixedTooltip] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [popups, setPopups] = useState<Array<{ uni: any; city: any; popupId: string }>>([]);
  const prevAnimationYear = useRef<number | null>(null);

  useEffect(() => {
    if (animationYear === null || animationYear === undefined) {
      setPopups([]);
      prevAnimationYear.current = null;
      return;
    }

    if (animationYear !== prevAnimationYear.current) {
      const newlyAdded: Array<{ uni: any; city: any; popupId: string }> = [];
      citiesData.forEach(city => {
        city.universities.forEach(uni => {
          if (uni.foundedYear === animationYear) {
            newlyAdded.push({ uni, city, popupId: `${uni.id}-${animationYear}` });
          }
        });
      });

      if (newlyAdded.length > 0) {
        setPopups(prev => {
          const existingIds = new Set(prev.map(p => p.popupId));
          const toAdd = newlyAdded.filter(n => !existingIds.has(n.popupId));
          return [...prev, ...toAdd];
        });
      }
      prevAnimationYear.current = animationYear;
    }
  }, [animationYear]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateTooltipPosition = (mouseX: number, mouseY: number, cityName: string) => {
    const tooltipWidth = 300;
    // Dinamik yükseklik hesaplama
    const cityData = filteredCitiesData.find(city => city.city === cityName);
    const universitiesCount = cityData?.universities.length || 0;
    // Her üniversite kartı için yaklaşık yükseklik (başlık ve padding dahil)
    const estimatedHeight = Math.min(400, 100 + universitiesCount * 100);
    const padding = 20;

    let x = mouseX + 10;
    let y = mouseY + 10;

    // Sağ kenara taşma kontrolü
    if (x + tooltipWidth + padding > windowSize.width) {
      x = mouseX - tooltipWidth - 10;
    }

    // Alt kenara taşma kontrolü
    if (y + estimatedHeight + padding > windowSize.height) {
      y = mouseY - estimatedHeight - 10;
    }

    // Minimum pozisyon kontrolü
    x = Math.max(padding, x);
    y = Math.max(padding, y);

    // Maksimum pozisyon kontrolü
    x = Math.min(windowSize.width - tooltipWidth - padding, x);
    y = Math.min(windowSize.height - estimatedHeight - padding, y);

    return { x, y };
  };

  const handleMouseEnter = (e: React.MouseEvent, cityName: string) => {
    if (!fixedTooltip) {
      const { x, y } = calculateTooltipPosition(e.clientX, e.clientY, cityName);
      setTooltipData({
        visible: true,
        x,
        y,
        cityName,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!fixedTooltip) {
      setTooltipData((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!fixedTooltip && tooltipData.visible) {
      const { x, y } = calculateTooltipPosition(e.clientX, e.clientY, tooltipData.cityName);
      setTooltipData((prev) => ({
        ...prev,
        x,
        y,
      }));
    }
  };

  const handleClick = () => {
    setFixedTooltip((prev) => !prev);
  };

  const handleClose = () => {
    setTooltipData((prev) => ({ ...prev, visible: false }));
    setFixedTooltip(false);
  };

  const filteredCitiesData = citiesData.map(city => ({
    ...city,
    universities: city.universities.filter(uni => {
      // Animasyon yılı kontrolü
      if (animationYear !== null && animationYear !== undefined) {
        if (uni.foundedYear > animationYear) return false;
      }

      if (filters.includes('all')) return true;

      const typeMatch = filters.includes(uni.type) || (!filters.includes('state') && !filters.includes('private'));
      const yearMatch = filters.includes('before2000') ? uni.foundedYear < 2000
        : filters.includes('after2000') ? uni.foundedYear >= 2000
          : true;

      return typeMatch && yearMatch;
    })
  }));

  return (
    <div className="relative">

      <svg

        baseProfile="tiny"
        fill="#36877a"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".5"
        version="1.2"
        viewBox="0 0 1000 422"
        className="w-screen px-10 mb-15 relative"
      >
        <MapFeatures
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleMouseMove={handleMouseMove}
          handleClick={handleClick}
        />
        <g id="city-labels" className="pointer-events-none">
          {filteredCitiesData.map(city => (
            <g key={`label-${city.id}`}>
              <text
                x={city.coordinates.x}
                y={city.coordinates.y}
                className="text-[8px] fill-[#f7feae]"
                textAnchor="middle"
                stroke="#f7feae"
              >
                {city.city}
              </text>
              <text
                x={city.coordinates.x}
                y={city.coordinates.y + 10}
                className="text-[10px] fill-[#f7feae]"
                textAnchor="middle"
                stroke="#f7feae"

              >
                {city.universities.length}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Newly established university logos overlay */}
      {popups.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none px-10">
          <div className="relative w-full h-full" style={{ aspectRatio: '1000 / 422' }}>
            {popups.map(({ uni, city, popupId }, index, array) => {
              // Aynı şehirdeki diğer aktif popup'lar
              const sameCityPopups = array.filter(p => p.city.id === city.id);
              const posInCity = sameCityPopups.findIndex(p => p.popupId === popupId);
              const totalInCity = sameCityPopups.length;

              // Fan yayı hesaplama - maksimum 5 elemanı yay
              const MAX_FAN = 5;
              const fanCount = Math.min(totalInCity, MAX_FAN);
              const fanIndex = Math.min(posInCity, MAX_FAN - 1);

              // Merkez konumundan yay çizgisi: sol üst'ten sağ alt'a doğru yayılır
              // Tek eleman ise tam merkez, çok eleman ise araları eşit bölünür
              const spread = 22; // her eleman arası mesafe (px)
              const xOffset = fanCount === 1 ? 0 : (fanIndex - (fanCount - 1) / 2) * spread;
              const yOffset = fanCount === 1 ? 0 : -Math.abs(xOffset) * 0.4; // U şeklinde hafif kavis

              return (
                <div
                  key={popupId}
                  className="absolute pointer-events-none"
                  style={{
                    left: `calc(${(city.coordinates.x / 1000) * 100}% + ${xOffset}px)`,
                    top: `calc(${(city.coordinates.y / 422) * 100}% + ${yOffset}px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 40 + fanIndex,
                  }}
                >
                  <div
                    className="animate-logo-popup bg-white rounded-full p-1.5 shadow-2xl border-[3px] border-lime-500 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center relative -top-10 md:-top-12"
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    onAnimationEnd={() => {
                      setPopups(prev => prev.filter(p => p.popupId !== popupId));
                    }}
                  >
                    <Image
                      src={`/uniLogolar/${uni.id}.png`}
                      alt={`${uni.name} logo`}
                      fill
                      className="object-contain p-1.5"
                    />
                    <div className="absolute -bottom-3 bg-lime-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white whitespace-nowrap shadow-sm">
                      {uni.foundedYear}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tooltipData.visible && (
        <div
          className="fixed bg-white p-4 rounded-lg shadow-xl border z-50 text-black w-[90vw] max-w-[320px] max-h-[70vh] overflow-y-auto"
          style={{
            left: Math.min(tooltipData.x, windowSize.width - 330),
            top: Math.min(tooltipData.y, windowSize.height - 200),
          }}
        >
          <div className="flex justify-between ">
            <h3 className="font-bold text-lg mb-2">{tooltipData.cityName}</h3>
            <button onClick={handleClose} className=" text-gray-500 hover:text-gray-700 ">
              <IoMdClose size={25} color="black" />
            </button>
          </div>

          <p className="mb-3">Toplam Üniversite: {filteredCitiesData.find(city => city.city === tooltipData.cityName)?.universities.length}</p>

          <div className="text-sm space-y-4 max-h-[400px] overflow-y-auto">
            {filteredCitiesData
              .find(city => city.city === tooltipData.cityName)
              ?.universities
              .map(uni => (
                <div key={uni.id} className="flex gap-3 p-2 border rounded-lg items-center">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={`/uniLogolar/${uni.id}.png`}
                      alt={`${uni.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{uni.name}</p>
                    <p className="text-xs text-gray-500">
                      {uni.type === 'state' ? 'Devlet' : 'Vakıf'} - {uni.foundedYear}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TurkeyMap;
