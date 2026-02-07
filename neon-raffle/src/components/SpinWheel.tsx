import React, { useRef, useEffect, useState } from 'react';
import type { Segment } from '../hooks/useRaffle';

interface SpinWheelProps {
    segments: Segment[];
    winner: string | null;
    isSpinning: boolean;
    onSpinComplete: () => void;
}

// User Requested Palette (v2)
const COLORS = [
    '#0066cc', // Blue
    '#ff9000', // Orange
    '#009933', // Green
    '#ff006e', // Yellow
    '#cc3333', // Red
    '#6600cc', // Purple    
    '#1d7a82',
    '#c2b2b4',
    '#fb6107',
    '#3d405b',
    '#05668d',
    '#d62828'
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
    segments,
    winner,
    isSpinning,
    onSpinComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);

    const spinState = useRef({
        startTime: 0,
        startRotation: 0,
        targetRotation: 0,
        isAnimating: false,
        duration: 6000
    });

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    useEffect(() => {
        if (isSpinning && winner && !spinState.current.isAnimating) {
            const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
            if (totalWeight === 0) return;

            // Find winner center angle
            let currentAngle = 0;
            let winnerCenter = 0;
            let winnerFound = false;

            for (const s of segments) {
                const segmentAngle = (s.weight / totalWeight) * 360;
                if (s.name === winner) {
                    winnerCenter = currentAngle + (segmentAngle / 2);
                    winnerFound = true;
                    // Add some randomness within the segment so it doesn't always land effectively dead center
                    // Limit offset to 80% of the segment width to be safe
                    const randomInternalOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
                    winnerCenter += randomInternalOffset;
                    break;
                }
                currentAngle += segmentAngle;
            }

            if (!winnerFound) return;

            // Target: Top = 270 degrees
            // We want the winnerCenter to end up at 270.
            const extraSpins = 360 * 6; // More spins for dramatic effect
            const targetAngle = extraSpins + (270 - winnerCenter);

            spinState.current = {
                startTime: performance.now(),
                startRotation: rotation % 360,
                targetRotation: targetAngle,
                isAnimating: true,
                duration: 6000 + Math.random() * 1000
            };

            requestAnimationFrame(animate);
        }
    }, [isSpinning, winner, segments]);

    const animate = (time: number) => {
        if (!spinState.current.isAnimating) return;

        const { startTime, startRotation, targetRotation, duration } = spinState.current;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = easeOutCubic(progress);
        const currentRotation = startRotation + (targetRotation - startRotation) * ease;

        setRotation(currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            spinState.current.isAnimating = false;
            onSpinComplete();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;
        const center = size / 2;

        // Geometry
        const outerRadius = size / 2 - 80; // Increased padding to fit Pointer (was -20)
        const rimThickness = 40;
        const innerRadius = outerRadius - rimThickness;

        const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Context Setup
        ctx.lineJoin = 'round';

        // --- DRAW WHEEL ROTATING PART --- //
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((rotation * Math.PI) / 180);

        // Deep Shadow behind the wheel
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
        ctx.shadowOffsetY = 0;

        // Segments
        let currentRadian = 0;

        segments.forEach((seg, i) => {
            const segmentAngle = (seg.weight / totalWeight) * (2 * Math.PI);

            // Pie Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, innerRadius + 2, currentRadian, currentRadian + segmentAngle); // +2 overlaps slight gap
            ctx.closePath();

            const baseColor = COLORS[i % COLORS.length];
            ctx.fillStyle = baseColor;
            ctx.fill();

            // Deepening Gradient (Cone Effect)
            // Darkens towards the center to simulate depth
            const depthGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
            depthGrad.addColorStop(0, 'rgba(0,0,0,0.4)'); // Darker center
            depthGrad.addColorStop(0.4, 'rgba(0,0,0,0.1)');
            depthGrad.addColorStop(1, 'rgba(0,0,0,0)'); // Edge is pure color
            ctx.fillStyle = depthGrad;
            ctx.fill();

            // Inner Highlight Stroke (Bevel) along segment edges
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.stroke();

            // Text/Icon Content
            ctx.save();
            ctx.rotate(currentRadian + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            // Text Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;

            const fontSize = segments.length > 20 ? 16 : 28;
            ctx.font = `900 ${fontSize}px "Inter", "Roboto", sans-serif`;
            ctx.fillStyle = '#FFFFFF';

            // Render Text closer to edge
            const textRadius = innerRadius - 20;
            const text = seg.name.length > 15 ? seg.name.substring(0, 15) + '...' : seg.name;
            ctx.fillText(text, textRadius, 0);

            // REMOVED WEIGHT TEXT RENDERING HERE

            ctx.restore();

            currentRadian += segmentAngle;
        });

        // --- GOLDEN RIM (Metal Effect) --- //

        // Main Rim Body
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
        ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI, true);
        ctx.closePath();

        // Metallic Gradient
        const rimGrad = ctx.createLinearGradient(-outerRadius, -outerRadius, outerRadius, outerRadius);
        rimGrad.addColorStop(0, '#B45309'); // Dark Bronze
        rimGrad.addColorStop(0.2, '#FCD34D'); // Light Gold
        rimGrad.addColorStop(0.4, '#B45309'); // Dark
        rimGrad.addColorStop(0.6, '#FDE047'); // Very Light Gold
        rimGrad.addColorStop(0.8, '#D97706'); // Gold
        rimGrad.addColorStop(1, '#92400E'); // Dark Bronze

        ctx.fillStyle = rimGrad;
        ctx.fill();

        // Inner/Outer Bevel lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius - 1, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius + 1, 0, 2 * Math.PI);
        ctx.stroke();

        // --- RIVETS / BOLTS --- //
        const boltCount = 12; // 12 Bolts around rim
        const boltAngleStep = (2 * Math.PI) / boltCount;
        const boltRadius = innerRadius + (rimThickness / 2);

        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';

        for (let i = 0; i < boltCount; i++) {
            const theta = i * boltAngleStep;
            const bx = Math.cos(theta) * boltRadius;
            const by = Math.sin(theta) * boltRadius;

            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, 2 * Math.PI);

            // Bolt gradient
            const boltGrad = ctx.createRadialGradient(bx - 2, by - 2, 0, bx, by, 5);
            boltGrad.addColorStop(0, '#FFFFFF');
            boltGrad.addColorStop(1, '#92400E');

            ctx.fillStyle = boltGrad;
            ctx.fill();

            // Bolt border
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore(); // END WHEEL ROTATION


        // --- POINTER / NEEDLE (Static overlay) --- //
        // The pointer sits at Top Middle overlap
        ctx.save();
        ctx.translate(center, center);

        // Drop Shadow for Pointer
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 15;

        const pinW = 40;
        const pinH = 70;
        // Position pin so tip touches wheel, or slightly inside
        // outerRadius is roughly 420. center is 500. Top of wheel is y=80.
        // We want tip at y=80 + epsilon.
        const pinTipY = -outerRadius + 15; // Overlap rim

        ctx.translate(0, pinTipY);

        // Pointer Shape (Fancy Arrow)
        ctx.beginPath();
        ctx.moveTo(0, 0); // Tip
        // Draw wide head
        ctx.lineTo(-pinW, -pinH * 0.6);
        ctx.quadraticCurveTo(0, -pinH * 1.2, pinW, -pinH * 0.6);
        ctx.lineTo(0, 0);
        ctx.closePath();

        // Gradient Red
        const pinGrad = ctx.createLinearGradient(-pinW, -pinH, pinW, 0);
        pinGrad.addColorStop(0, '#DC2626'); // Red
        pinGrad.addColorStop(0.5, '#EF4444'); // Light Red
        pinGrad.addColorStop(1, '#991B1B'); // Dark Red

        ctx.fillStyle = pinGrad;
        ctx.fill();

        // Gold Border for Pointer
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#F59E0B'; // Gold
        ctx.stroke();

        // Center Dot on Pin
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(0, -pinH * 0.6, 10, 0, 2 * Math.PI);
        ctx.fill();

        // Inner Gold Dot
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(0, -pinH * 0.6, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore(); // End Pointer

    }, [segments, rotation]);

    return (
        <div className="relative w-full max-w-[700px] aspect-square animate-in zoom-in spin-in-1 duration-700">
            <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                className="w-full h-full object-contain drop-shadow-2xl"
            />
            {/* Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
        </div>
    );
};
