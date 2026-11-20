import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import QRCode from 'qrcode';

interface QR3DLaserScannerProps {
  onOpenStudio?: () => void;
  targetUrl?: string;
}

export const QR3DLaserScanner: React.FC<QR3DLaserScannerProps> = ({
  onOpenStudio,
  targetUrl = 'https://www.vidcuts.online',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scanPercent, setScanPercent] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('ALIGNING OPTICS...');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    // 1. Generate QR Code Matrix data
    let qrSize = 33;
    let qrModules: { get: (r: number, c: number) => number | boolean; size: number };
    try {
      const qrData = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
      qrModules = qrData.modules;
      qrSize = qrModules.size;
    } catch {
      qrModules = {
        size: 33,
        get: (r: number, c: number) => ((r + c) % 2 === 0 ? 1 : 0),
      };
      qrSize = 33;
    }

    // 2. Three.js Scene Setup
    const width = host.clientWidth || 480;
    const height = host.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06150c, 0.032);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    host.appendChild(renderer.domElement);

    // 3. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const keyLight = new THREE.PointLight(0x35ff91, 140, 50);
    keyLight.position.set(4, 5, 10);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00b978, 90, 40);
    rimLight.position.set(-8, -2, 5);
    scene.add(rimLight);

    const laserSpot = new THREE.PointLight(0x42ff9b, 0, 18);
    laserSpot.position.set(0, -3.2, 2.8);
    scene.add(laserSpot);

    // 4. 3D Instanced QR Cubes
    const size = qrSize;
    const step = 0.22;
    const total = size * size;

    const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const material = new THREE.MeshStandardMaterial({
      color: 0xdffff0,
      roughness: 0.25,
      metalness: 0.28,
      emissive: 0x063d25,
      emissiveIntensity: 0.65,
    });

    const cubes = new THREE.InstancedMesh(geometry, material, total);
    cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    cubes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(total * 3), 3);

    const dummy = new THREE.Object3D();
    const starts: THREE.Vector3[] = [];
    const baseEnds: THREE.Vector3[] = [];
    const color = new THREE.Color();
    let idx = 0;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const x = (col - (size - 1) / 2) * step;
        const y = ((size - 1) / 2 - row) * step;
        const active = qrModules.get(row, col) === 1;

        baseEnds.push(new THREE.Vector3(x, y, active ? 0 : -0.22));
        starts.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 14 + 1.8,
            (Math.random() - 0.5) * 10
          )
        );

        color.set(active ? 0x9affc4 : 0x113b28);
        cubes.setColorAt(idx, color);

        dummy.position.copy(starts[idx]);
        dummy.scale.setScalar(active ? 0.92 : 0.42);
        dummy.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        dummy.updateMatrix();
        cubes.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    cubes.instanceColor.needsUpdate = true;
    cubes.instanceMatrix.needsUpdate = true;
    scene.add(cubes);

    // 5. Volumetric 3D Laser Fan
    const fanGeo = new THREE.BufferGeometry();
    const fanPos = new Float32Array(4 * 3);
    fanGeo.setAttribute('position', new THREE.BufferAttribute(fanPos, 3));
    fanGeo.setIndex([0, 1, 2, 0, 2, 3]);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x42ff9b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const laserFan3D = new THREE.Mesh(fanGeo, fanMat);
    scene.add(laserFan3D);

    // 6. 3D Laser Contact Line
    const laser3DGeo = new THREE.CylinderGeometry(0.04, 0.04, 7.2, 16);
    laser3DGeo.rotateZ(Math.PI / 2);
    const laser3DMat = new THREE.MeshBasicMaterial({
      color: 0x55ffaa,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const laser3D = new THREE.Mesh(laser3DGeo, laser3DMat);
    laser3D.position.set(0, 1.8, 0.12);
    scene.add(laser3D);

    // 7. 3D Laser Trailing Scan Sheet
    const sheet3DGeo = new THREE.PlaneGeometry(7.2, 1.2);
    const sheet3DMat = new THREE.MeshBasicMaterial({
      color: 0x24d87a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sheet3D = new THREE.Mesh(sheet3DGeo, sheet3DMat);
    sheet3D.position.set(0, 1.8, 0.08);
    scene.add(sheet3D);

    // 8. Ambient Particles
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x42ff9b, size: 0.045, transparent: true, opacity: 0.55 })
    );
    scene.add(particles);

    // 9. Autonomous Smooth Animation Cycle Loop
    let animFrameId: number;
    const clock = new THREE.Clock();
    let cycleTime = 0;
    const CYCLE_DURATION = 6.4; // 6.4s full scanning journey loop

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    host.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      animFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const t = clock.getElapsedTime();

      cycleTime = (cycleTime + delta) % CYCLE_DURATION;
      const progress = cycleTime / CYCLE_DURATION;

      // Stage states across cycle:
      // 0.0 -> 0.28: Assembling cubes into matrix
      // 0.28 -> 0.76: Active laser scanning sweep top to bottom
      // 0.76 -> 0.94: Verified payload decoded & result ready
      // 0.94 -> 1.0: Gentle return transition

      let assemble = 1.0;
      let scan = 0.0;
      let isScanning = false;
      let isVerified = false;

      if (progress < 0.24) {
        assemble = Math.min(1.0, progress / 0.2);
        scan = 0;
      } else if (progress < 0.76) {
        assemble = 1.0;
        scan = (progress - 0.24) / 0.52;
        isScanning = true;
      } else if (progress < 0.94) {
        assemble = 1.0;
        scan = 1.0;
        isVerified = true;
      } else {
        assemble = 1.0;
        scan = 0;
      }

      setScanPercent(Math.round(scan * 100));
      setIsLocked(isVerified);
      setShowResult(isVerified);

      if (isScanning) {
        setScanStatus(`DECODING MATRIX [${Math.round(scan * 100)}%]`);
      } else if (isVerified) {
        setScanStatus('100% VERIFIED & DECODED ✓');
      } else {
        setScanStatus('ALIGNING OPTICAL RETICLE...');
      }

      // Smooth Camera follow & subtle float
      const targetCamX = mouseX * 1.5;
      const targetCamY = 1.2 + mouseY * 1.0 + Math.sin(t * 0.8) * 0.15;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;

      // Position QR code in left-center portion of 3D scene
      const currentScale = 0.82;
      const currentCenterX = -1.8;
      const currentCenterY = 1.1;
      const currentZ = 0;

      const qrHalfHeight = ((size - 1) / 2) * step * currentScale;
      const qrTop = currentCenterY + qrHalfHeight;
      const qrBottom = currentCenterY - qrHalfHeight;
      const scanY = qrTop - scan * (qrTop - qrBottom);

      // Cube Positions and Laser Highlight
      for (let i = 0; i < total; i++) {
        const targetPos = new THREE.Vector3(
          baseEnds[i].x * currentScale + currentCenterX,
          baseEnds[i].y * currentScale + currentCenterY,
          baseEnds[i].z * currentScale + currentZ
        );

        const pos = starts[i].clone().lerp(targetPos, assemble);

        // Add subtle floating breath
        if (assemble > 0.95) {
          pos.y += Math.sin(t * 1.4 + i * 0.015) * 0.035;
          pos.z += Math.cos(t * 1.2 + i * 0.02) * 0.025;
        }

        dummy.position.copy(pos);
        const cubeScale = THREE.MathUtils.lerp(0.35, 0.92, assemble) * currentScale;
        dummy.scale.setScalar(cubeScale);

        if (assemble < 0.98) {
          dummy.rotation.set(
            (1 - assemble) * (t * 0.8 + i * 0.012),
            (1 - assemble) * (t * 0.9 + i * 0.015),
            (1 - assemble) * (t * 0.6 + i * 0.01)
          );
        } else {
          dummy.rotation.set(0, 0, 0);
        }
        dummy.updateMatrix();
        cubes.setMatrixAt(i, dummy.matrix);

        // Illumination when laser contact passes
        if (isScanning) {
          const dist = Math.abs(pos.y - scanY);
          if (dist < 0.18 * currentScale + 0.06) {
            color.set(0xffffff);
            cubes.setColorAt(i, color);
          } else if (dist < 0.45 * currentScale + 0.12) {
            color.set(0x55ffaa);
            cubes.setColorAt(i, color);
          } else {
            const active = qrModules.get(Math.floor(i / size), i % size) === 1;
            color.set(active ? 0x9affc4 : 0x113b28);
            cubes.setColorAt(i, color);
          }
        } else {
          const active = qrModules.get(Math.floor(i / size), i % size) === 1;
          color.set(active ? 0x9affc4 : 0x113b28);
          cubes.setColorAt(i, color);
        }
      }
      cubes.instanceMatrix.needsUpdate = true;
      if (cubes.instanceColor) {
        cubes.instanceColor.needsUpdate = true;
      }

      // Laser Contact Bar & Trailing Sheet
      if (isScanning) {
        const beamIntensity = Math.sin(scan * Math.PI);

        // 3D Line
        laser3D.position.set(currentCenterX, scanY, currentZ + 0.12);
        laser3D.scale.set(currentScale * 0.98, 1, currentScale);
        laser3D.material.opacity = beamIntensity * 0.95;

        // Trailing glow sheet
        sheet3D.position.set(currentCenterX, scanY + 0.28 * currentScale, currentZ + 0.06);
        sheet3D.scale.set(currentScale * 0.98, currentScale, currentScale);
        sheet3D.material.opacity = beamIntensity * 0.42;

        // Fan from emitter to contact
        const pArr = fanGeo.attributes.position.array as Float32Array;
        pArr[0] = 2.4; pArr[1] = -1.2; pArr[2] = 2.2;
        pArr[3] = 2.7; pArr[4] = -1.2; pArr[5] = 2.2;
        pArr[6] = currentCenterX + 3.4 * currentScale; pArr[7] = scanY; pArr[8] = currentZ + 0.06;
        pArr[9] = currentCenterX - 3.4 * currentScale; pArr[10] = scanY; pArr[11] = currentZ + 0.06;
        fanGeo.attributes.position.needsUpdate = true;
        laserFan3D.material.opacity = beamIntensity * 0.35;

        laserSpot.position.set(currentCenterX, scanY, 1.5);
        laserSpot.intensity = beamIntensity * 28;
      } else {
        laser3D.material.opacity = 0;
        sheet3D.material.opacity = 0;
        laserFan3D.material.opacity = 0;
        laserSpot.intensity = 0;
      }

      // Background particle drift
      particles.rotation.y = t * 0.02;
      particles.rotation.x = Math.sin(t * 0.1) * 0.03;

      camera.lookAt(0, 1.2, 0);
      renderer.render(scene, camera);
    };
    render();

    // Resize Handler
    const handleResize = () => {
      if (!host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      host.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      material.dispose();
      laser3DGeo.dispose();
      laser3DMat.dispose();
      sheet3DGeo.dispose();
      sheet3DMat.dispose();
      fanGeo.dispose();
      fanMat.dispose();
      pGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [targetUrl]);

  return (
    <div className="relative w-full h-[540px] sm:h-[580px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#061a10] via-[#05110a] to-[#020704] border-2 border-green-500/40 shadow-2xl shadow-green-950/50 select-none">
      {/* 3D WebGL Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Grid line background overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-1 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(66,255,155,0.18) 1px, transparent 1px), linear-gradient(to right, rgba(66,255,155,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(66,255,155,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#082215]/90 border border-green-400/40 text-[10px] font-mono text-green-300 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>3D LASER OPTICAL MATRIX</span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/60 border border-green-500/30 text-[10px] font-mono text-green-400">
          532nm LASER
        </span>
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {onOpenStudio && (
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1 rounded-full bg-green-500 hover:bg-green-400 text-black text-[11px] font-mono font-bold tracking-wider shadow-md shadow-green-500/30 transition-all hover:scale-105 cursor-pointer"
          >
            CUSTOMIZE QR ↗
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 55% RIGHT-SIDE REALISTIC MOBILE VIEWFINDER HUD */}
      {/* ========================================================================= */}
      <div className="absolute right-3 sm:right-6 bottom-3 top-auto z-20 pointer-events-none">
        <div
          className="w-[210px] sm:w-[250px] h-[450px] sm:h-[490px] rounded-[42px] p-2 bg-gradient-to-tr from-[#0b2918] via-[#040e08] to-[#123821] border border-green-400/50 shadow-2xl shadow-black/80 flex flex-col justify-between"
          style={{
            transform: 'rotateX(12deg) rotateY(-8deg) perspective(1000px)',
            boxShadow: 'inset 0 0 1px 1px rgba(186, 255, 216, 0.4), 0 20px 50px rgba(0,0,0,0.85)',
          }}
        >
          {/* Dynamic Island Notch */}
          <div className="mx-auto w-24 h-5 rounded-full bg-black border border-green-500/30 flex items-center justify-end px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-400" />
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 text-[9px] font-mono text-green-300">
            <span>9:41</span>
            <span>●●● ▰</span>
          </div>

          {/* Optical Viewfinder HUD Body */}
          <div className="p-2 space-y-2 text-center">
            <div className="text-[7.5px] font-mono uppercase tracking-widest text-green-400">
              QUBIX OPTICAL LASER HUD
            </div>
            <div className="text-xs font-black text-white tracking-tight">
              Scan QR Matrix<span className="text-green-400">.</span>
            </div>

            {/* Viewfinder Target Window */}
            <div className="relative w-36 sm:w-44 h-36 sm:h-44 mx-auto rounded-2xl border border-green-400/40 bg-green-950/30 backdrop-blur-xs overflow-hidden flex items-center justify-center shadow-inner">
              {/* Corner Targeting Brackets */}
              <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-green-400 rounded-tl-sm" />
              <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-green-400 rounded-tr-sm" />
              <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-green-400 rounded-bl-sm" />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-green-400 rounded-br-sm" />

              {/* Reticle Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full border border-dashed border-green-400/40 animate-spin" style={{ animationDuration: '18s' }} />
                <div className="absolute w-8 h-[1px] bg-green-400/60" />
                <div className="absolute h-8 w-[1px] bg-green-400/60" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-green-400" />
              </div>

              {/* Sweeping Laser Beam Assembly */}
              <div
                className="absolute left-0 right-0 pointer-events-none transition-all duration-75"
                style={{ top: `${scanPercent}%` }}
              >
                {/* Laser core bar */}
                <div className="h-[2.5px] bg-gradient-to-r from-transparent via-[#42ff9b] to-transparent shadow-[0_0_12px_#42ff9b,0_0_24px_#42ff9b]" />
                {/* Trailing soft laser sheet */}
                <div className="h-6 -mt-6 bg-gradient-to-t from-green-400/35 to-transparent" />
                {/* Center beam flare */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 rounded-full bg-white blur-[2px] opacity-90" />
              </div>

              {/* Lock burst animation ring */}
              {isLocked && (
                <div className="absolute inset-4 rounded-full border-2 border-white animate-ping opacity-75" />
              )}
            </div>

            {/* Live Scanner Type & Payload HUD Card */}
            <div className="p-2 rounded-xl bg-black/75 border border-green-400/35 text-left font-mono space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[7.5px] pb-1 border-b border-green-500/20">
                <span className="px-1.5 py-0.2 rounded bg-green-500 text-black font-bold">
                  ◈ SECURE URL
                </span>
                <span className="text-green-300 text-[7px]">ISO-18004 ✓</span>
              </div>
              <div className="text-[7px] text-green-200 truncate">
                <span className="text-green-500">DEST:</span> {targetUrl.replace(/^https?:\/\//, '')}
              </div>
              <div className="flex items-center justify-between text-[6.5px]">
                <span className="text-green-400">FORMAT: 33×33 [ECC-H]</span>
                <span className={`font-bold ${isLocked ? 'text-white' : 'text-green-300'}`}>
                  {scanStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Shutter & Controls */}
          <div className="flex items-center justify-around py-1 text-[7.5px] font-mono text-green-400/70 border-t border-green-500/20">
            <span>FLASH</span>
            <div className="w-8 h-8 rounded-full border border-green-400 flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 to-green-500 shadow-sm" />
            </div>
            <span>GALLERY</span>
          </div>

          {/* Decoded Success Result Card Overlay */}
          {showResult && (
            <div className="absolute inset-2 z-30 rounded-[34px] bg-gradient-to-b from-[#0a2916] via-[#05140b] to-[#020704] border border-green-400 p-4 text-center flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
              <div className="w-8 h-8 rounded-full bg-green-500 text-black font-black flex items-center justify-center mx-auto text-sm shadow-lg shadow-green-500/40">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="text-[7.5px] font-mono text-green-400 uppercase tracking-wider block">
                  SCAN COMPLETE • 100% VERIFIED
                </span>
                <h4 className="text-xs font-black text-white">Your link is ready</h4>
                <p className="text-[7.5px] text-green-300 font-mono">Decoded from 3D QR Matrix</p>
              </div>

              {/* Preview Window Box */}
              <div className="p-3 rounded-xl bg-white text-black text-left space-y-1 shadow-md">
                <div className="flex items-center justify-between text-[7px] font-bold text-green-800">
                  <span>VIDCUTS STUDIO</span>
                  <span>↗</span>
                </div>
                <div className="text-xs font-black leading-tight text-slate-900">
                  Lossless Media<br />In Your Browser.
                </div>
                <div className="text-[7px] text-slate-600">
                  Private video, image, PDF &amp; QR suite.
                </div>
              </div>

              <div className="text-[7px] font-mono text-green-300 truncate bg-green-950/60 p-1.5 rounded-lg border border-green-500/30">
                ↗ {targetUrl} <span className="text-green-400 font-bold">✓</span>
              </div>

              {onOpenStudio ? (
                <button
                  onClick={onOpenStudio}
                  className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-[9px] font-mono font-bold tracking-wider cursor-pointer shadow-md shadow-green-500/30 transition-all pointer-events-auto"
                >
                  OPEN IN STUDIO ↗
                </button>
              ) : (
                <div className="text-[7px] font-mono text-green-400">
                  ● SAFE LINK VERIFIED
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar & Stage Caption */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[9px] font-mono text-green-400">LASER SCAN: {scanPercent}%</span>
        </div>
        <div className="w-24 h-1.5 rounded-full bg-black/60 border border-green-500/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-75"
            style={{ width: `${scanPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
