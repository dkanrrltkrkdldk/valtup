'use client';

import { useState, useEffect } from 'react';

interface RouletteWheelProps {
  isSpinning: boolean;
  onSpinEnd?: () => void;
}

const SEGMENTS = [
  { value: 100, color: '#FF6B6B' },
  { value: 200, color: '#4ECDC4' },
  { value: 300, color: '#45B7D1' },
  { value: 400, color: '#96CEB4' },
  { value: 500, color: '#FFEAA7' },
  { value: 600, color: '#DDA0DD' },
  { value: 700, color: '#98D8C8' },
  { value: 800, color: '#F7DC6F' },
  { value: 900, color: '#BB8FCE' },
  { value: 1000, color: '#F1948A' },
];

export function RouletteWheel({ isSpinning, onSpinEnd }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      const spinDegrees = 360 * 5 + Math.random() * 360;
      setRotation((prev) => prev + spinDegrees);

      const timer = setTimeout(() => {
        onSpinEnd?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, onSpinEnd]);

  const segmentAngle = 360 / SEGMENTS.length;

  return (
    <div className="relative w-72 h-72 mx-auto">
      <div
        className="absolute inset-0 rounded-full shadow-2xl overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {SEGMENTS.map((segment, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            const textAngle = startAngle + segmentAngle / 2;
            const textRad = (textAngle - 90) * (Math.PI / 180);
            const textX = 50 + 32 * Math.cos(textRad);
            const textY = 50 + 32 * Math.sin(textRad);

            return (
              <g key={index}>
                <path d={pathData} fill={segment.color} stroke="#fff" strokeWidth="0.5" />
                <text
                  x={textX}
                  y={textY}
                  fill="#333"
                  fontSize="5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {segment.value}
                </text>
              </g>
            );
          })}
          <circle cx="50" cy="50" r="8" fill="#1e1b4b" />
          <circle cx="50" cy="50" r="5" fill="#4338ca" />
        </svg>
      </div>

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-indigo-600 drop-shadow-lg" />
      </div>
    </div>
  );
}
