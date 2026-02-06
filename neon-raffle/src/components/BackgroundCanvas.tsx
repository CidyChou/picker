
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface BackgroundCanvasProps {
    isRolling: boolean;
    winner: string | null;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ isRolling, winner }) => {
    const renderRef = useRef<HTMLDivElement>(null);
    const p5Instance = useRef<p5 | null>(null);

    useEffect(() => {
        if (!renderRef.current) return;

        // Destroy existing instance if any
        if (p5Instance.current) {
            p5Instance.current.remove();
        }

        const sketch = (p: p5) => {
            let particles: Particle[] = [];
            const numParticles = 100;
            let gridOffset = 0;

            // Confetti system
            let confetti: Confetti[] = [];

            class Particle {
                pos: p5.Vector;
                vel: p5.Vector;
                size: number;
                color: p5.Color;

                constructor() {
                    this.pos = p.createVector(p.random(p.width), p.random(p.height));
                    this.vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
                    this.size = p.random(2, 5);
                    this.color = p.color(p.random(100, 255), p.random(100, 255), 255, 50);
                }

                update(speedMult: number) {
                    this.pos.add(p5.Vector.mult(this.vel, speedMult));
                    if (this.pos.x < 0) this.pos.x = p.width;
                    if (this.pos.x > p.width) this.pos.x = 0;
                    if (this.pos.y < 0) this.pos.y = p.height;
                    if (this.pos.y > p.height) this.pos.y = 0;
                }

                display() {
                    p.noStroke();
                    p.fill(this.color);
                    p.circle(this.pos.x, this.pos.y, this.size);
                }
            }

            class Confetti {
                pos: p5.Vector;
                vel: p5.Vector;
                color: p5.Color;
                size: number;

                constructor() {
                    this.pos = p.createVector(p.width / 2, p.height / 2);
                    this.vel = p5.Vector.random2D().mult(p.random(5, 15));
                    this.color = p.color(p.random(100, 255), p.random(50, 255), p.random(200, 255));
                    this.size = p.random(5, 10);
                }

                update() {
                    this.vel.y += 0.2; // Gravity
                    this.vel.mult(0.98); // Friction
                    this.pos.add(this.vel);
                }

                display() {
                    p.fill(this.color);
                    p.square(this.pos.x, this.pos.y, this.size);
                }
            }

            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight).parent(renderRef.current!);
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle());
                }
            };

            p.draw = () => {
                p.background(15, 23, 42); // slate-900

                // Grid (Algorithmic Art)
                p.stroke(30, 41, 59);
                p.strokeWeight(1);

                // Speed multiplier based on state
                // access prop values via closure (but p5 setup is once) 
                // We need a way to pass props into sketch.
                // We can attach them to the p object or use a mutable ref accessible here.
                // For simplicity, we'll re-check refs or rely on closures if component doesn't unmount frequently.
                // But props `isRolling` change won't trigger re-render of sketch unless we handle it.
                // Use `p5Instance.current.myCustomProp = ...` pattern or external var.
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };

            // Methods to externalize
            (p as any).updateState = (rolling: boolean, win: string | null) => {
                // Logic to trigger confetti or speed up
                if (rolling) {
                    gridOffset += 5; // Fake speed up
                } else {
                    gridOffset += 0.5;
                }

                if (win && confetti.length === 0) {
                    // Spawn confetti
                    for (let i = 0; i < 200; i++) confetti.push(new Confetti());
                }
            };

            // Rewrite draw to correctly use the state passed in via update usually
            // For now, let's keep it self-contained loop
            p.draw = () => {
                p.background(15, 23, 42); // slate-900

                // Grid
                let speed = (p as any).rolling ? 5.0 : 0.5;
                gridOffset += speed;

                p.stroke(56, 189, 248, 50); // Sky-400 with alpha
                p.strokeWeight(1);
                p.noFill();

                // Horizontal lines
                for (let y = 0; y < p.height; y += 40) {
                    p.beginShape();
                    for (let x = 0; x <= p.width; x += 20) {
                        let yOff = y + p.sin((x + gridOffset) * 0.01) * 20;
                        p.vertex(x, yOff);
                    }
                    p.endShape();
                }

                // Particles
                particles.forEach(pt => {
                    pt.update((p as any).rolling ? 2.0 : 0.5);
                    pt.display();
                });

                // Confetti
                confetti.forEach((c, i) => {
                    c.update();
                    c.display();
                });

                // Cleanup off-screen confetti
                confetti = confetti.filter(c => c.pos.y < p.height);
            };

            // Expose function to trigger burst
            (p as any).triggerBurst = () => {
                for (let i = 0; i < 300; i++) {
                    confetti.push(new Confetti());
                }
            };
        };

        p5Instance.current = new p5(sketch);

        return () => {
            p5Instance.current?.remove();
        };
    }, []);

    // Sync props to p5 instance
    useEffect(() => {
        if (p5Instance.current) {
            const p = p5Instance.current as any;
            p.rolling = isRolling;

            // Trigger explosion if winner just appeared
            if (winner && p.triggerBurst) {
                p.triggerBurst();
            }
            p.winner = winner;
        }
    }, [isRolling, winner]);

    return <div ref={renderRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />;
};
