"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { citiesData } from "../data/cities";
import MapFeatures from "./MapFeatures";
import { IoMdClose } from "react-icons/io";

interface TurkeyMapProps {
  filters: string[];
}

const TurkeyMap = ({ filters }: TurkeyMapProps) => {
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    cityName: ""
  });
  const [fixedTooltip, setFixedTooltip] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

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
        className="w-screen px-10 mb-15"
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
      

      {tooltipData.visible && (
        <div 
          className="fixed bg-white p-4 rounded-lg shadow-xl border z-50 text-black min-w-[300px] max-h-[400px] overflow-y-auto"
          style={{
            left: tooltipData.x,
            top: tooltipData.y
          }}
        >
        <div className="flex justify-between ">
          <h3 className="font-bold text-lg mb-2">{tooltipData.cityName}</h3>
          <button onClick={handleClose} className=" text-gray-500 hover:text-gray-700 ">
          <IoMdClose size={25} color="black"/>
          </button>
        </div>

          <p className="mb-3">Toplam Üniversite: {filteredCitiesData.find(city => city.city === tooltipData.cityName)?.universities.length}</p>
          
          <div className="text-sm space-y-4 max-h-[400px] overflow-y-auto">
            {filteredCitiesData
              .find(city => city.city === tooltipData.cityName)
              ?.universities
              .map(uni => (
                <div key={uni.id} className="flex gap-3 p-2 border rounded-lg items-center">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={`/uniLogolar/${uni.id}.png`}
                      alt={`${uni.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-base">{uni.name}</p>
                    <p className="text-sm text-gray-500">
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

