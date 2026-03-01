
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../App';

export const FuturisticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let scrollY = window.scrollY;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    // Particle Configuration
    const particleCount = Math.min(width * 0.15, 100); // Reduce count for performance on mobile
    interface Particle {
        x: number;
        y: number;
        z: number; // Depth factor (1 = far, 3 = close)
        size: number;
        vx: number;
        vy: number;
    }
    
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5, 
            size: Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2
        });
    }

    let animationFrameId: number;

    const render = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Colors
        // Dark mode: White/Cyan particles
        // Light mode: Indigo/Slate particles
        const particleBaseColor = isDark ? '255, 255, 255' : '99, 102, 241';
        const lineBaseColor = isDark ? '99, 102, 241' : '148, 163, 184'; // Indigo (Dark) vs Slate (Light)
        
        // Update & Draw
        particles.forEach((p, i) => {
            // Natural drifting movement
            p.x += p.vx;
            p.y += p.vy;

            // Boundary wrapping
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Parallax Calculation
            // We shift the Y position based on scrollY and depth (z). 
            // Closer particles (higher z) move faster.
            // (scrollY * 0.2 * p.z) determines the offset.
            // We use modulo (%) to keep particles cycling within the viewport height.
            let displayY = (p.y - (scrollY * 0.15 * p.z)) % height;
            if (displayY < 0) displayY += height;

            const opacity = isDark ? (0.2 + (p.z * 0.15)) : (0.1 + (p.z * 0.1));
            
            // Draw Particle
            ctx.beginPath();
            ctx.fillStyle = `rgba(${particleBaseColor}, ${opacity})`;
            ctx.arc(p.x, displayY, p.size * p.z, 0, Math.PI * 2);
            ctx.fill();

            // Draw Connections (Neural Network effect)
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                
                // Calculate p2's display position
                let displayY2 = (p2.y - (scrollY * 0.15 * p2.z)) % height;
                if (displayY2 < 0) displayY2 += height;

                const dx = p.x - p2.x;
                const dy = displayY - displayY2;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Connect if close enough
                const connectionDist = 120;
                if (dist < connectionDist) {
                    ctx.beginPath();
                    const lineOpacity = (1 - dist / connectionDist) * (isDark ? 0.15 : 0.1);
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${lineOpacity})`;
                    ctx.lineWidth = 0.5 * p.z; // Thicker lines for closer particles
                    ctx.moveTo(p.x, displayY);
                    ctx.lineTo(p2.x, displayY2);
                    ctx.stroke();
                }
            }
        });

        animationFrameId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('scroll', handleScroll);
        cancelAnimationFrame(animationFrameId);
    };

  }, [isDark]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000" />;
};
