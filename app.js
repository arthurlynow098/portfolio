let activeLayerId = 'espaco';
const animFrameHandles = {};

document.addEventListener('DOMContentLoaded', () => {
    initSpaceCanvasEngine();
    initSkyCanvasEngine();
    initEarthCanvasEngine();
    initUltimateOceanEngine();
    initGeometricNodesCanvas();
});

function switchLayer(layerId) {
    if (activeLayerId === layerId) return;
    activeLayerId = layerId;

    document.querySelectorAll('.main-nav .nav-item').forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`.main-nav a[href="#${layerId}"]`);
    if (activeItem) activeItem.classList.add('active');

    document.querySelectorAll('.journey-canvas').forEach(can => can.classList.remove('active'));

    document.body.className = '';
    document.body.classList.add(`layer-${layerId}-active`);

    if (layerId === 'espaco') {
        document.getElementById('space-canvas')?.classList.add('active');
    } else if (layerId === 'ceus') {
        document.getElementById('sky-canvas')?.classList.add('active');
    } else if (layerId === 'terra') {
        document.getElementById('earth-canvas')?.classList.add('active');
    } else if (layerId === 'oceano') {
        document.getElementById('fluid-canvas')?.classList.add('active');
    }

    document.querySelectorAll('.editorial-panel').forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(`section-${layerId}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}
window.switchLayer = switchLayer;

const layerOrder = ['espaco', 'ceus', 'terra', 'oceano'];
let isScrollCooldown = false;

window.addEventListener('wheel', (e) => {
    const isModalOpen = document.querySelector('.luxury-modal:not(.hidden)');
    if (isModalOpen) return;
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    const scrollableParent = e.target.closest('.mini-projects-scroll, .dynamic-section-panel');
    if (scrollableParent) {
        const atBottom = scrollableParent.scrollHeight - scrollableParent.scrollTop <= scrollableParent.clientHeight + 4;
        const atTop = scrollableParent.scrollTop <= 4;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
    }

    if (isScrollCooldown) return;

    if (Math.abs(e.deltaY) > 20) {
        isScrollCooldown = true;
        const currIdx = layerOrder.indexOf(activeLayerId);

        if (e.deltaY > 0) {
            const nextIdx = (currIdx + 1) % layerOrder.length;
            switchLayer(layerOrder[nextIdx]);
        } else {
            const prevIdx = (currIdx - 1 + layerOrder.length) % layerOrder.length;
            switchLayer(layerOrder[prevIdx]);
        }

        setTimeout(() => {
            isScrollCooldown = false;
        }, 750);
    }
}, { passive: true });

let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const isModalOpen = document.querySelector('.luxury-modal:not(.hidden)');
    if (isModalOpen) return;
    if (isScrollCooldown) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > 45) {
        isScrollCooldown = true;
        const currIdx = layerOrder.indexOf(activeLayerId);
        if (diffY > 0) {
            const nextIdx = (currIdx + 1) % layerOrder.length;
            switchLayer(layerOrder[nextIdx]);
        } else {
            const prevIdx = (currIdx - 1 + layerOrder.length) % layerOrder.length;
            switchLayer(layerOrder[prevIdx]);
        }
        setTimeout(() => {
            isScrollCooldown = false;
        }, 750);
    }
}, { passive: true });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.luxury-modal').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = '';
        return;
    }
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.key === '1') switchLayer('espaco');
    if (e.key === '2') switchLayer('ceus');
    if (e.key === '3') switchLayer('terra');
    if (e.key === '4') switchLayer('oceano');

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const currIdx = layerOrder.indexOf(activeLayerId);
        const nextIdx = (currIdx + 1) % layerOrder.length;
        switchLayer(layerOrder[nextIdx]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const currIdx = layerOrder.indexOf(activeLayerId);
        const prevIdx = (currIdx - 1 + layerOrder.length) % layerOrder.length;
        switchLayer(layerOrder[prevIdx]);
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('luxury-modal')) {
        e.target.classList.add('hidden');
        document.body.style.overflow = '';
    }
});

function openSection(id) {
    document.querySelectorAll('.luxury-modal').forEach(m => m.classList.add('hidden'));
    const targetModal = document.getElementById(`modal-${id}`);
    if (targetModal) {
        targetModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}
window.openSection = openSection;

function closeSection(id) {
    const targetModal = document.getElementById(`modal-${id}`);
    if (targetModal) {
        targetModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}
window.closeSection = closeSection;

function initSpaceCanvasEngine() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        if (activeLayerId !== 'espaco') return;
        mouse.targetX = e.clientX; mouse.targetY = e.clientY;
    });

    const stars = [];
    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.6 + 0.4,
            alpha: Math.random() * 0.7 + 0.2,
            pulseSpeed: Math.random() * 0.025 + 0.005,
            phase: Math.random() * Math.PI * 2,
            hasSpark: Math.random() > 0.88
        });
    }

    class SpaceMoon {
        constructor() {
            this.orbitAngle1 = 0;
            this.orbitAngle2 = Math.PI;
            this.satelliteAngle = 0;
        }
        update() {
            this.orbitAngle1 += 0.005;
            this.orbitAngle2 -= 0.004;
            this.satelliteAngle += 0.009;
        }
        draw(t) {
            const cx = W * 0.48;
            const cy = H * 0.32 + Math.sin(t * 0.3) * 6;
            const r = 100;

            ctx.save();
            ctx.translate(cx, cy);

            const halo = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 2.5);
            halo.addColorStop(0, 'rgba(215, 230, 255, 0.25)');
            halo.addColorStop(0.5, 'rgba(179, 144, 85, 0.08)');
            halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2); ctx.fill();

            ctx.save();
            ctx.rotate(this.orbitAngle1);
            ctx.strokeStyle = 'rgba(179, 144, 85, 0.35)'; ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r * 0.48, 0.4, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.rotate(this.orbitAngle2);
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.28)'; ctx.lineWidth = 0.9;
            ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r * 0.58, -0.3, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();

            const moonGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 6, 0, 0, r);
            moonGrad.addColorStop(0, '#ffffff');
            moonGrad.addColorStop(0.4, '#e2e8f0');
            moonGrad.addColorStop(0.75, '#94a3b8');
            moonGrad.addColorStop(1, '#334155');
            ctx.fillStyle = moonGrad;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'; ctx.lineWidth = 1;
            [
                [-32, -26, 16], [26, -38, 13], [40, 22, 19], [-20, 40, 15],
                [6, 6, 11], [-54, 8, 10], [50, -8, 11], [12, 48, 9]
            ].forEach(c => {
                ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            });

            const sx = Math.cos(this.satelliteAngle) * (r * 1.45);
            const sy = Math.sin(this.satelliteAngle) * (r * 0.48);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(this.satelliteAngle + Math.PI * 0.5);
            ctx.fillStyle = '#b39055';
            ctx.beginPath(); ctx.rect(-4, -4, 8, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.85)'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
            ctx.restore();

            ctx.restore();
        }
    }

    const moon = new SpaceMoon();

    function renderSpace() {
        if (activeLayerId !== 'espaco') {
            animFrameHandles.espaco = requestAnimationFrame(renderSpace);
            return;
        }

        time += 0.015;
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        ctx.fillStyle = '#060812';
        ctx.fillRect(0, 0, W, H);

        stars.forEach(s => {
            const a = s.alpha + Math.sin(time * s.pulseSpeed * 60 + s.phase) * 0.25;
            ctx.save();
            ctx.globalAlpha = Math.max(0.1, a);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
            ctx.fill();

            if (s.hasSpark && s.r > 1.2) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(s.x * W - 3, s.y * H); ctx.lineTo(s.x * W + 3, s.y * H);
                ctx.moveTo(s.x * W, s.y * H - 3); ctx.lineTo(s.x * W, s.y * H + 3);
                ctx.stroke();
            }
            ctx.restore();
        });

        moon.update();
        moon.draw(time);

        animFrameHandles.espaco = requestAnimationFrame(renderSpace);
    }
    renderSpace();
}

function initSkyCanvasEngine() {
    const canvas = document.getElementById('sky-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        if (activeLayerId !== 'ceus') return;
        mouse.targetX = e.clientX; mouse.targetY = e.clientY;
    });

    function drawCleanSkyGradient() {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#cbe3fb');
        skyGrad.addColorStop(0.5, '#dfeeff');
        skyGrad.addColorStop(1, '#f4f8fe');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
    }

    class RadiantSun {
        constructor() { 
            this.angle = 0; 
        }
        draw(t) {
            this.angle += 0.003;
            const cx = W * 0.48;
            const cy = H * 0.32 + Math.sin(t * 0.3) * 6;
            const r = 100;

            ctx.save();
            ctx.translate(cx, cy);

            const pulse = Math.sin(t * 1.2) * 0.06 + 1.0;

            const outerHalo = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.8 * pulse);
            outerHalo.addColorStop(0, 'rgba(253, 224, 71, 0.38)');
            outerHalo.addColorStop(0.35, 'rgba(251, 191, 36, 0.18)');
            outerHalo.addColorStop(0.7, 'rgba(245, 158, 11, 0.06)');
            outerHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = outerHalo;
            ctx.beginPath(); 
            ctx.arc(0, 0, r * 2.8 * pulse, 0, Math.PI * 2); 
            ctx.fill();

            ctx.save();
            ctx.rotate(this.angle);
            for (let i = 0; i < 12; i++) {
                const a = (Math.PI * 2 / 12) * i;
                const rayLen = r * (1.35 + Math.sin(t * 1.5 + i) * 0.15);
                const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(a) * rayLen, Math.sin(a) * rayLen);
                rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
                rayGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.12)');
                rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

                ctx.fillStyle = rayGrad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a - 0.08) * rayLen, Math.sin(a - 0.08) * rayLen);
                ctx.lineTo(Math.cos(a + 0.08) * rayLen, Math.sin(a + 0.08) * rayLen);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            const innerGlow = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.25);
            innerGlow.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
            innerGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = innerGlow;
            ctx.beginPath(); 
            ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2); 
            ctx.fill();

            const diskGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 6, 0, 0, r);
            diskGrad.addColorStop(0, '#ffffff');
            diskGrad.addColorStop(0.2, '#fef08a');
            diskGrad.addColorStop(0.55, '#facc15');
            diskGrad.addColorStop(0.85, '#f59e0b');
            diskGrad.addColorStop(1, '#d97706');
            
            ctx.fillStyle = diskGrad;
            ctx.beginPath(); 
            ctx.arc(0, 0, r, 0, Math.PI * 2); 
            ctx.fill();

            ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.restore();
        }
    }

    class MinimalCloud {
        constructor(xPct, yPct, scale, speed) {
            this.x = W * xPct; this.yPct = yPct; this.scale = scale; this.speed = speed;
        }
        update() {
            this.x += this.speed;
            if (this.x > W * 0.72) this.x = W * 0.22;
        }
        draw(t) {
            const cy = H * this.yPct + Math.sin(t * 0.3 + this.x * 0.005) * 4;
            ctx.save();
            ctx.translate(this.x, cy);
            ctx.scale(this.scale, this.scale);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.strokeStyle = 'rgba(180, 205, 235, 0.4)';
            ctx.lineWidth = 1.1;

            ctx.beginPath();
            ctx.arc(0, 0, 16, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(16, -10, 20, Math.PI, Math.PI * 1.85);
            ctx.arc(42, -6, 14, Math.PI * 1.3, Math.PI * 1.9);
            ctx.arc(58, 2, 12, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();
        }
    }

    class MinimalBirds {
        constructor() { this.x = W * 0.32; this.speed = 0.5; }
        update() {
            this.x += this.speed;
            if (this.x > W * 0.7) this.x = W * 0.2;
        }
        draw(t) {
            const baseY = H * 0.42 + Math.sin(t * 0.4) * 5;
            const birds = [{ox: 0, oy: 0}, {ox: -14, oy: -7}, {ox: -12, oy: 8}, {ox: -26, oy: -12}];
            ctx.save();
            ctx.strokeStyle = 'rgba(60, 80, 110, 0.6)'; ctx.lineWidth = 1.1;
            birds.forEach((b, i) => {
                const flap = Math.sin(t * 3.5 + i) * 3;
                ctx.save();
                ctx.translate(this.x + b.ox, baseY + b.oy);
                ctx.beginPath();
                ctx.moveTo(-5, flap);
                ctx.quadraticCurveTo(-1.5, -1.5, 0, 0);
                ctx.quadraticCurveTo(1.5, -1.5, 5, flap);
                ctx.stroke();
                ctx.restore();
            });
            ctx.restore();
        }
    }

    const sun = new RadiantSun();
    const clouds = [
        new MinimalCloud(0.28, 0.12, 0.9, 0.07),
        new MinimalCloud(0.46, 0.36, 1.05, 0.09)
    ];
    const birds = new MinimalBirds();

    function renderSky() {
        if (activeLayerId !== 'ceus') {
            animFrameHandles.ceus = requestAnimationFrame(renderSky);
            return;
        }

        time += 0.015;
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        drawCleanSkyGradient();
        sun.draw(time);
        clouds.forEach(c => { c.update(); c.draw(time); });
        birds.update();
        birds.draw(time);

        animFrameHandles.ceus = requestAnimationFrame(renderSky);
    }
    renderSky();
}

function initEarthCanvasEngine() {
    const canvas = document.getElementById('earth-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        if (activeLayerId !== 'terra') return;
        mouse.targetX = e.clientX; mouse.targetY = e.clientY;
    });

    const smokePuffs = [];

    function drawMinimalLandscape(t) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#1c2438');
        skyGrad.addColorStop(0.55, '#28354d');
        skyGrad.addColorStop(1, '#3b4c68');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        const mx = W * 0.48;
        const my = H * 0.32 + Math.sin(t * 0.3) * 6;
        const mr = 100;

        const mg = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.6);
        mg.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        mg.addColorStop(0.45, 'rgba(251, 191, 36, 0.1)');
        mg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mx, my, mr * 2.6, 0, Math.PI * 2);
        ctx.fill();

        const darkSideGrad = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 10, mx, my, mr);
        darkSideGrad.addColorStop(0, 'rgba(38, 50, 75, 0.88)');
        darkSideGrad.addColorStop(0.7, 'rgba(24, 32, 50, 0.94)');
        darkSideGrad.addColorStop(1, 'rgba(18, 24, 40, 0.98)');
        ctx.fillStyle = darkSideGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.clip();

        const moonGrad = ctx.createLinearGradient(mx - mr * 0.2, my - mr, mx + mr, my + mr);
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.25, '#fef08a');
        moonGrad.addColorStop(0.65, '#facc15');
        moonGrad.addColorStop(1, '#eab308');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.rect(mx - mr, my - mr, mr * 2, mr * 2);
        ctx.fill();

        ctx.fillStyle = darkSideGrad;
        ctx.beginPath();
        ctx.arc(mx - mr * 0.44, my - mr * 0.06, mr * 0.92, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(179, 144, 85, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(mx, my, mr, -Math.PI * 0.44, Math.PI * 0.58, false);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(25, 35, 55, 0.65)';
        ctx.strokeStyle = 'rgba(179, 144, 85, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(W * 0.15, H);
        ctx.lineTo(W * 0.28, H * 0.65);
        ctx.lineTo(W * 0.42, H * 0.76);
        ctx.lineTo(W * 0.54, H * 0.62);
        ctx.lineTo(W * 0.68, H * 0.78);
        ctx.lineTo(W * 0.75, H);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = 'rgba(35, 48, 40, 0.75)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(W * 0.18, H);
        ctx.lineTo(W * 0.34, H * 0.74);
        ctx.lineTo(W * 0.48, H * 0.80);
        ctx.lineTo(W * 0.62, H * 0.72);
        ctx.lineTo(W * 0.72, H);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        const hx = W * 0.48, hy = H * 0.80;
        ctx.save();
        ctx.translate(hx, hy);

        ctx.fillStyle = '#eddac0';
        ctx.strokeStyle = '#b39055';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.rect(-26, -38, 52, 38);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#9a3412';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-35, -38);
        ctx.lineTo(0, -64);
        ctx.lineTo(35, -38);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#b39055';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.rect(12, -70, 12, 24);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#b39055';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.rect(-16, -28, 20, 18);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-6, -28); ctx.lineTo(-6, -10);
        ctx.moveTo(-16, -19); ctx.lineTo(4, -19);
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.rect(12, -22, 11, 22);
        ctx.fill();

        ctx.restore();

        if (Math.random() < 0.16) {
            smokePuffs.push({
                x: hx + 18,
                y: hy - 70,
                r: 3.5,
                alpha: 0.7,
                vx: (Math.random() - 0.5) * 0.3 - 0.25,
                vy: -0.8 - Math.random() * 0.4
            });
        }

        for (let i = smokePuffs.length - 1; i >= 0; i--) {
            const p = smokePuffs[i];
            p.x += p.vx;
            p.y += p.vy;
            p.r += 0.14;
            p.alpha -= 0.007;

            if (p.alpha <= 0) {
                smokePuffs.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = 'rgba(240, 245, 255, 0.75)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    const fireflies = [];
    for (let i = 0; i < 18; i++) {
        fireflies.push({
            x: 0.25 + Math.random() * 0.45,
            y: 0.45 + Math.random() * 0.4,
            r: Math.random() * 1.5 + 1,
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.01
        });
    }

    function renderEarth() {
        if (activeLayerId !== 'terra') {
            animFrameHandles.terra = requestAnimationFrame(renderEarth);
            return;
        }

        time += 0.015;
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        drawMinimalLandscape(time);

        fireflies.forEach(f => {
            f.pulse += f.speed;
            const a = 0.3 + Math.sin(f.pulse) * 0.4;
            ctx.save();
            ctx.globalAlpha = Math.max(0.05, a);
            ctx.fillStyle = '#b39055';
            ctx.beginPath();
            ctx.arc((f.x + Math.sin(f.pulse * 0.5) * 0.02) * W, (f.y + Math.cos(f.pulse * 0.5) * 0.02) * H, f.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        animFrameHandles.terra = requestAnimationFrame(renderEarth);
    }
    renderEarth();
}

function initUltimateOceanEngine() {
    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        if (activeLayerId !== 'oceano') return;
        mouse.targetX = e.clientX; mouse.targetY = e.clientY;
    });

    class TopoLine {
        constructor(yPct, amp, freq, color) {
            this.yPct = yPct; this.amp = amp; this.freq = freq; this.color = color;
        }
        draw(t, m) {
            const baseY = H * this.yPct + (m.y - H * 0.5) * 0.02;
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(W * 0.15, baseY);
            for (let x = W * 0.15; x <= W * 0.72; x += 10) {
                const y = baseY + Math.sin(x * this.freq + t) * this.amp;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    class MajesticBigWhale {
        constructor() {
            this.x = W * 0.28;
            this.speed = 0.35;
            this.blowParticles = [];
        }
        update(t) {
            this.x += this.speed;
            if (this.x > W * 0.74) this.x = W * 0.15;

            if (Math.random() < 0.08) {
                this.blowParticles.push({
                    x: this.x + 38,
                    y: H * 0.44 + Math.sin(t * 0.5) * 10 - 24,
                    r: Math.random() * 3 + 1.5,
                    alpha: 0.75,
                    vx: (Math.random() - 0.5) * 0.6 + 0.2,
                    vy: -0.9 - Math.random() * 0.5
                });
            }

            for (let i = this.blowParticles.length - 1; i >= 0; i--) {
                const b = this.blowParticles[i];
                b.x += b.vx;
                b.y += b.vy;
                b.r += 0.04;
                b.alpha -= 0.01;
                if (b.alpha <= 0) this.blowParticles.splice(i, 1);
            }
        }
        draw(t) {
            const cy = H * 0.44 + Math.sin(t * 0.5) * 10;
            const wLen = 95;

            this.blowParticles.forEach(b => {
                ctx.save();
                ctx.globalAlpha = b.alpha;
                ctx.fillStyle = 'rgba(179, 144, 85, 0.45)';
                ctx.strokeStyle = 'rgba(179, 144, 85, 0.75)'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.restore();
            });

            ctx.save();
            ctx.translate(this.x, cy);

            const bodyGrad = ctx.createLinearGradient(-wLen, -30, wLen, 30);
            bodyGrad.addColorStop(0, 'rgba(179, 144, 85, 0.15)');
            bodyGrad.addColorStop(0.4, 'rgba(179, 144, 85, 0.28)');
            bodyGrad.addColorStop(1, 'rgba(179, 144, 85, 0.12)');
            ctx.fillStyle = bodyGrad;
            ctx.strokeStyle = 'rgba(179, 144, 85, 0.85)';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(wLen * 0.85, -6);
            ctx.quadraticCurveTo(wLen * 0.5, -24, 0, -22);
            ctx.quadraticCurveTo(-wLen * 0.35, -20, -wLen * 0.45, -18);
            ctx.lineTo(-wLen * 0.52, -26);
            ctx.quadraticCurveTo(-wLen * 0.55, -20, -wLen * 0.6, -15);
            ctx.quadraticCurveTo(-wLen * 0.8, -10, -wLen * 0.95, -2);

            const tailSway = Math.sin(t * 1.3) * 9;
            ctx.lineTo(-wLen * 1.3, -22 + tailSway);
            ctx.quadraticCurveTo(-wLen * 1.22, tailSway, -wLen * 1.15, tailSway);
            ctx.quadraticCurveTo(-wLen * 1.22, tailSway, -wLen * 1.3, 22 + tailSway);
            ctx.lineTo(-wLen * 0.95, 2);

            ctx.quadraticCurveTo(-wLen * 0.6, 16, -wLen * 0.2, 26);
            ctx.quadraticCurveTo(wLen * 0.35, 28, wLen * 0.75, 14);
            ctx.quadraticCurveTo(wLen * 0.95, 8, wLen * 0.85, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(179, 144, 85, 0.35)'; ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const yOff = 4 + i * 3.5;
                ctx.beginPath();
                ctx.moveTo(wLen * 0.72, yOff - 2);
                ctx.quadraticCurveTo(wLen * 0.3, yOff + 14, -wLen * 0.1, yOff + 10);
                ctx.stroke();
            }

            const finFlap = Math.sin(t * 1.1) * 0.18;
            ctx.save();
            ctx.translate(wLen * 0.18, 6);
            ctx.rotate(finFlap);
            ctx.fillStyle = 'rgba(179, 144, 85, 0.3)';
            ctx.strokeStyle = 'rgba(179, 144, 85, 0.85)'; ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-38, 38, -12, 36);
            ctx.quadraticCurveTo(-4, 20, 0, 0);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#45351e';
            ctx.beginPath(); ctx.arc(wLen * 0.65, -3, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(179, 144, 85, 0.5)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(wLen * 0.65, -3, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();

            ctx.restore();
        }
    }

    class FishSchool {
        constructor() {
            this.fishes = [];
            for (let i = 0; i < 16; i++) {
                this.fishes.push({
                    ox: (Math.random() - 0.5) * 80,
                    oy: (Math.random() - 0.5) * 45,
                    size: Math.random() * 4 + 6,
                    speedMult: Math.random() * 0.3 + 0.85,
                    wiggleOffset: Math.random() * Math.PI * 2
                });
            }
            this.baseX = W * 0.22;
        }
        update() {
            this.baseX += 0.48;
            if (this.baseX > W * 0.72) this.baseX = W * 0.16;
        }
        draw(t) {
            const baseY = H * 0.65 + Math.sin(t * 0.4) * 12;
            ctx.save();
            this.fishes.forEach(f => {
                const fx = this.baseX + f.ox;
                const fy = baseY + f.oy + Math.sin(t * 2 + f.wiggleOffset) * 3;

                ctx.save();
                ctx.translate(fx, fy);
                ctx.fillStyle = 'rgba(179, 144, 85, 0.55)';
                ctx.strokeStyle = 'rgba(179, 144, 85, 0.8)';
                ctx.lineWidth = 0.9;

                ctx.beginPath();
                ctx.moveTo(f.size, 0);
                ctx.quadraticCurveTo(0, -f.size * 0.45, -f.size * 0.6, 0);
                ctx.lineTo(-f.size, -f.size * 0.4);
                ctx.lineTo(-f.size * 0.75, 0);
                ctx.lineTo(-f.size, f.size * 0.4);
                ctx.lineTo(-f.size * 0.6, 0);
                ctx.quadraticCurveTo(0, f.size * 0.45, f.size, 0);
                ctx.closePath();
                ctx.fill(); ctx.stroke();

                ctx.restore();
            });
            ctx.restore();
        }
    }

    const topoLines = [
        new TopoLine(0.25, 8, 0.008, 'rgba(179, 144, 85, 0.35)'),
        new TopoLine(0.42, 12, 0.006, 'rgba(179, 144, 85, 0.45)'),
        new TopoLine(0.60, 10, 0.007, 'rgba(179, 144, 85, 0.35)'),
        new TopoLine(0.78, 14, 0.005, 'rgba(179, 144, 85, 0.25)')
    ];
    const bigWhale = new MajesticBigWhale();
    const fishSchool = new FishSchool();

    function renderOcean() {
        if (activeLayerId !== 'oceano') {
            animFrameHandles.oceano = requestAnimationFrame(renderOcean);
            return;
        }

        time += 0.015;
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        ctx.fillStyle = '#e5e0d8';
        ctx.fillRect(0, 0, W, H);

        topoLines.forEach(l => l.draw(time, mouse));
        bigWhale.update(time);
        bigWhale.draw(time);
        fishSchool.update();
        fishSchool.draw(time);

        animFrameHandles.oceano = requestAnimationFrame(renderOcean);
    }
    renderOcean();
}

function initGeometricNodesCanvas() {
    const canvas = document.getElementById('nodes-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, nodes = [];
    let mouse = { x: null, y: null };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Node {
        constructor() {
            this.x = Math.random() * W; this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.25; this.vy = (Math.random() - 0.5) * 0.25;
            this.radius = Math.random() * 1.5 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }
        draw() {
            ctx.save(); ctx.fillStyle = '#b39055';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 14; i++) nodes.push(new Node());

    function animate() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x; const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.save(); ctx.globalAlpha = (1 - dist / 150) * 0.25; ctx.strokeStyle = '#b39055'; ctx.lineWidth = 0.6;
                    ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); ctx.restore();
                }
            }
            if (mouse.x && mouse.y) {
                const dx = nodes[i].x - mouse.x; const dy = nodes[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    ctx.save(); ctx.globalAlpha = (1 - dist / 140) * 0.35; ctx.strokeStyle = '#b39055'; ctx.lineWidth = 0.8;
                    ctx.beginPath(); ctx.moveTo(nodes[i].x, mouse.x); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.restore();
                }
            }
        }
        nodes.forEach(n => { n.update(); n.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

function copyAtsText() {
    const textarea = document.getElementById('ats-text-area');
    if (!textarea) return;
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
        const btn = document.querySelector('.btn-copy-luxury');
        if (btn) {
            btn.textContent = '✓ Copiado com Sucesso!';
            btn.style.background = '#b39055';
            setTimeout(() => { btn.textContent = '📋 Copiar Currículo Completo'; btn.style.background = ''; }, 2500);
        }
    });
}
window.copyAtsText = copyAtsText;
