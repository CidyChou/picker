
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
            // --- FIREWORKS SYSTEM ---
            class Firework {
                hu: number;
                firework: Particle;
                exploded: boolean;
                particles: Particle[];

                constructor() {
                    this.hu = p.random(255);
                    this.firework = new Particle(p.random(p.width), p.height, this.hu, true);
                    this.exploded = false;
                    this.particles = [];
                }

                done() {
                    return this.exploded && this.particles.length === 0;
                }

                update() {
                    if (!this.exploded) {
                        this.firework.applyForce(gravity);
                        this.firework.update();

                        if (this.firework.vel.y >= 0) {
                            this.exploded = true;
                            this.explode();
                        }
                    }

                    for (let i = this.particles.length - 1; i >= 0; i--) {
                        this.particles[i].applyForce(gravity);
                        this.particles[i].update();
                        if (this.particles[i].done()) {
                            this.particles.splice(i, 1);
                        }
                    }
                }

                explode() {
                    // HUGE EXPLOSION
                    // 150 particles per explosion
                    for (let i = 0; i < 150; i++) {
                        const p5p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
                        this.particles.push(p5p);
                    }
                }

                show() {
                    if (!this.exploded) {
                        this.firework.show();
                    }
                    for (let i = 0; i < this.particles.length; i++) {
                        this.particles[i].show();
                    }
                }
            }

            class Particle {
                pos: p5.Vector;
                vel: p5.Vector;
                acc: p5.Vector;
                lifespan: number;
                hu: number;
                firework: boolean;

                constructor(x: number, y: number, hu: number, firework: boolean) {
                    this.pos = p.createVector(x, y);
                    this.firework = firework;
                    this.lifespan = 255;
                    this.hu = hu;
                    this.acc = p.createVector(0, 0);

                    if (this.firework) {
                        // Rocket launch height
                        this.vel = p.createVector(0, p.random(-18, -10));
                    } else {
                        // Explosion physics
                        this.vel = p5.Vector.random2D();
                        this.vel.mult(p.random(2, 20)); // High spread power
                    }
                }

                applyForce(force: p5.Vector) {
                    this.acc.add(force);
                }

                update() {
                    if (!this.firework) {
                        this.vel.mult(0.95); // Air resistance / Drag
                        this.lifespan -= 3;  // Fade speed
                    }
                    this.vel.add(this.acc);
                    this.pos.add(this.vel);
                    this.acc.mult(0);
                }

                done() {
                    return this.lifespan < 0;
                }

                show() {
                    p.colorMode(p.HSB);
                    if (!this.firework) {
                        // Spark
                        p.strokeWeight(3);
                        p.stroke(this.hu, 255, 255, this.lifespan);
                    } else {
                        // Rocket head
                        p.strokeWeight(6);
                        p.stroke(this.hu, 255, 255);
                    }
                    p.point(this.pos.x, this.pos.y);
                }
            }

            let fireworks: Firework[] = [];
            let gravity: p5.Vector;
            let gridOffset = 0;

            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight).parent(renderRef.current!);
                p.colorMode(p.HSB);
                gravity = p.createVector(0, 0.2);
                p.stroke(255);
                p.strokeWeight(4);
                p.background(0);
            };

            p.draw = () => {
                p.colorMode(p.RGB);
                // 15, 23, 42 is slate-900. Alpha 50 gives a trail effect.
                p.background(15, 23, 42, 50);

                // --- BACKGROUND GRID ---
                let speed = (p as any).rolling ? 5.0 : 0.5;
                gridOffset += speed;
                p.stroke(56, 189, 248, 50); // Sky-400
                p.strokeWeight(1);
                p.noFill();
                for (let y = 0; y < p.height; y += 40) {
                    p.beginShape();
                    for (let x = 0; x <= p.width; x += 20) {
                        let yOff = y + p.sin((x + gridOffset) * 0.01) * 20;
                        p.vertex(x, yOff);
                    }
                    p.endShape();
                }

                // --- FIREWORKS LOGIC ---
                // Continuous spawning while winner is present
                if ((p as any).winner) {
                    // 10% chance per frame to launch new rocket
                    if (p.random(1) < 0.1) {
                        fireworks.push(new Firework());
                    }
                }

                // Initial burst Trigger from React prop
                if ((p as any).trigger) {
                    for (let i = 0; i < 5; i++) {
                        fireworks.push(new Firework());
                    }
                    (p as any).trigger = false;
                }

                for (let i = fireworks.length - 1; i >= 0; i--) {
                    fireworks[i].update();
                    fireworks[i].show();
                    if (fireworks[i].done()) {
                        fireworks.splice(i, 1);
                    }
                }
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };

            // Expose function to trigger burst from outside
            (p as any).triggerBurst = () => {
                (p as any).trigger = true;
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

            // If we detect a new winner, ensure we trigger the initial volley immediately
            if (winner && !p.winner) {
                if (p.triggerBurst) p.triggerBurst();
            }
            p.winner = winner;
        }
    }, [isRolling, winner]);

    return <div ref={renderRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />;
};
