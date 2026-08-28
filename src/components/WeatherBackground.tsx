import React, { useEffect, useRef } from 'react';
import { WeatherApiResponse } from '../types';

interface WeatherBackgroundProps {
  weather: WeatherApiResponse | null;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isRaining = weather 
      ? (weather.current.precipitation > 0.05 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.current.weather_code))
      : false;
    
    const isSnowing = weather 
      ? [71, 73, 75, 77, 85, 86].includes(weather.current.weather_code)
      : false;

    const windSpeed = weather ? weather.current.wind_speed_10m : 10;
    const rainIntensity = weather ? Math.min(10, Math.max(1, weather.current.precipitation * 3 || 3)) : 2;
    const dropCount = isRaining ? Math.min(220, Math.floor(60 + rainIntensity * 25)) : (isSnowing ? 80 : 20);

    interface Particle {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      size: number;
      windOffset: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < dropCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: isSnowing ? 3 : 12 + Math.random() * 16,
        speed: isSnowing ? 1 + Math.random() * 2 : 12 + Math.random() * 14 + rainIntensity * 2,
        opacity: 0.15 + Math.random() * 0.45,
        size: isSnowing ? 2 + Math.random() * 3 : 1 + Math.random() * 1.5,
        windOffset: (windSpeed / 12) + (Math.random() * 0.5 - 0.25),
      });
    }

    // Ripples
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    const ripples: Ripple[] = [];

    let frame = 0;
    let thunderFlash = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Occasional gentle lightning flash if thunderstorm code
      const isThunder = weather && [95, 96, 99].includes(weather.current.weather_code);
      if (isThunder) {
        if (Math.random() < 0.003) {
          thunderFlash = 0.7;
        }
        if (thunderFlash > 0) {
          ctx.fillStyle = `rgba(224, 231, 255, ${thunderFlash})`;
          ctx.fillRect(0, 0, width, height);
          thunderFlash -= 0.04;
        }
      }

      if (isRaining || isSnowing) {
        ctx.lineWidth = isSnowing ? 1 : 1.2;

        particles.forEach((p) => {
          if (isSnowing) {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.windOffset * 4, p.y + p.length);
            ctx.stroke();
          }

          p.y += p.speed;
          p.x += p.windOffset * 2;

          if (p.y > height) {
            // Chance of ripple at bottom
            if (isRaining && Math.random() < 0.25 && ripples.length < 35) {
              ripples.push({
                x: p.x,
                y: height - Math.random() * 40,
                radius: 1,
                maxRadius: 6 + Math.random() * 8,
                opacity: 0.4,
              });
            }

            p.y = -p.length;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
        });

        // Draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${r.opacity})`;
          ctx.ellipse(r.x, r.y, r.radius * 2, r.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();

          r.radius += 0.4;
          r.opacity -= 0.02;

          if (r.opacity <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weather]);

  // Background atmosphere CSS styling based on weather state
  const isDay = weather?.current?.is_day !== 0;
  const weatherCode = weather?.current?.weather_code ?? 0;
  const isRaining = weather?.current?.precipitation && weather.current.precipitation > 0.05;

  let bgGradient = 'from-slate-950 via-slate-900 to-sky-950';
  let ambientGlow = 'rgba(56, 189, 248, 0.06)';

  if (!isDay) {
    // Night
    bgGradient = isRaining 
      ? 'from-slate-950 via-[#0a1128] to-[#040914]' 
      : 'from-slate-950 via-[#0d1527] to-[#020617]';
    ambientGlow = 'rgba(147, 197, 253, 0.04)';
  } else if (isRaining || [95, 96, 99].includes(weatherCode)) {
    // Stormy / Rainy Day
    bgGradient = 'from-[#0b1329] via-[#0f1d3a] to-[#080d1a]';
    ambientGlow = 'rgba(56, 189, 248, 0.12)';
  } else if ([1, 2, 3].includes(weatherCode)) {
    // Cloudy / Overcast Day
    bgGradient = 'from-[#09152b] via-[#0f1f3d] to-[#070e1c]';
    ambientGlow = 'rgba(96, 165, 250, 0.08)';
  } else {
    // Clear Sun Day
    bgGradient = 'from-[#071938] via-[#0b254a] to-[#041024]';
    ambientGlow = 'rgba(251, 191, 36, 0.09)';
  }

  return (
    <div className="fixed inset-0 pointer-events-none transition-colors duration-1000 bg-[#05070A] overflow-hidden">
      {/* Bold Typography Theme Light Leak on right side */}
      <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
      
      {/* Soft atmospheric glowing orbs */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-40 transition-all duration-1000"
        style={{ background: ambientGlow }}
      />
      <div 
        className="absolute top-1/2 right-0 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-30 transition-all duration-1000"
        style={{ background: ambientGlow }}
      />
      
      {/* Subtle fine tech grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />

      {/* Dynamic Rain & Weather Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
