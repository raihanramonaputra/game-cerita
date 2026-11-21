"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { StoryMood } from "@/types/story";

export type SceneVisualType =
  | "station"
  | "lake"
  | "hill"
  | "safe"
  | "hazard"
  | "shelter";

interface Scene3DStageProps {
  visualType: SceneVisualType;
  mood: StoryMood;
}

const MOOD_LIGHTING: Record<
  StoryMood,
  {
    primary: number;
    secondary: number;
    rainColor: number;
    ambient: number;
  }
> = {
  calm: {
    primary: 0x34d399,
    secondary: 0x6ee7b7,
    rainColor: 0xa7f3d0,
    ambient: 0x86efac,
  },
  tense: {
    primary: 0xf59e0b,
    secondary: 0xfbbf24,
    rainColor: 0xbae6fd,
    ambient: 0xfde68a,
  },
  eerie: {
    primary: 0x818cf8,
    secondary: 0x38bdf8,
    rainColor: 0x93c5fd,
    ambient: 0xc7d2fe,
  },
};

function buildRainPersonAndScene(
  visualType: SceneVisualType,
  mood: StoryMood,
  primaryColor: number,
  secondaryColor: number,
  rainColor: number
) {
  const rootGroup = new THREE.Group();
  const characterGroup = new THREE.Group();

  const raincoatMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.4,
    metalness: 0.25,
  });

  const gearMat = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    roughness: 0.3,
    metalness: 0.55,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.2,
  });

  // Kepala + tudung / pelindung hujan
  const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const head = new THREE.Mesh(headGeo, darkMat);
  head.position.set(0, 0.52, 0);
  characterGroup.add(head);

  const hoodGeo = new THREE.ConeGeometry(0.24, 0.28, 16, 1, true);
  hoodGeo.rotateX(Math.PI);
  const hood = new THREE.Mesh(hoodGeo, raincoatMat);
  hood.position.set(0, 0.57, -0.02);
  characterGroup.add(hood);

  // Badan jas hujan (sedikit melebar ke bawah seperti poncho/jas hujan)
  const torsoGeo = new THREE.CylinderGeometry(0.14, 0.25, 0.52, 16);
  const torso = new THREE.Mesh(torsoGeo, raincoatMat);
  torso.position.set(0, 0.14, 0);
  characterGroup.add(torso);

  // Tali/strip reflektif di dada
  const strapGeo = new THREE.BoxGeometry(0.32, 0.05, 0.36);
  const strap = new THREE.Mesh(strapGeo, gearMat);
  strap.position.set(0, 0.26, 0);
  characterGroup.add(strap);

  // Lengan kiri & kanan
  const armGeo = new THREE.CapsuleGeometry(0.055, 0.28, 6, 10);
  const leftArm = new THREE.Mesh(armGeo, raincoatMat);
  leftArm.position.set(-0.23, 0.16, 0.04);
  leftArm.rotation.z = 0.25;
  leftArm.rotation.x = -0.2;
  characterGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, raincoatMat);
  rightArm.position.set(0.23, 0.16, 0.04);
  rightArm.rotation.z = -0.25;
  rightArm.rotation.x = -0.2;
  characterGroup.add(rightArm);

  // Kaki kiri & kanan
  const legGeo = new THREE.CapsuleGeometry(0.06, 0.26, 6, 10);
  const leftLeg = new THREE.Mesh(legGeo, darkMat);
  leftLeg.position.set(-0.1, -0.24, 0);
  characterGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, darkMat);
  rightLeg.position.set(0.1, -0.24, 0);
  characterGroup.add(rightLeg);

  characterGroup.position.set(-0.18, 0.12, 0);
  rootGroup.add(characterGroup);

  // Properti lingkungan sesuai lokasi adegan
  if (visualType === "lake") {
    const deckGeo = new THREE.BoxGeometry(1.45, 0.1, 0.85);
    const deck = new THREE.Mesh(deckGeo, gearMat);
    deck.position.set(0, -0.45, 0);
    rootGroup.add(deck);
  } else if (visualType === "hill") {
    const slopeGeo = new THREE.ConeGeometry(1.35, 0.65, 6);
    const slope = new THREE.Mesh(slopeGeo, darkMat);
    slope.position.set(0, -0.72, 0);
    rootGroup.add(slope);
  } else {
    const platformGeo = new THREE.CylinderGeometry(0.85, 0.92, 0.08, 24);
    const platform = new THREE.Mesh(platformGeo, gearMat);
    platform.position.set(0, -0.46, 0);
    rootGroup.add(platform);
  }

  // Rintik hujan 3D di sekitar karakter
  const rainCount = mood === "calm" ? 28 : 65;
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 2.8;
    rainPositions[i * 3 + 1] = Math.random() * 2.2 - 0.5;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
  }

  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: rainColor,
    size: mood === "calm" ? 0.035 : 0.05,
    transparent: true,
    opacity: mood === "calm" ? 0.45 : 0.8,
  });

  const rainPoints = new THREE.Points(rainGeo, rainMat);
  rootGroup.add(rainPoints);

  return {
    rootGroup,
    characterGroup,
    leftLeg,
    rightLeg,
    rainPoints,
    rainCount,
  };
}

export default function Scene3DStage({ visualType, mood }: Scene3DStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const manualRotRef = useRef<{ x: number; y: number }>({ x: 0.12, y: 0.25 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 176;
    const height = container.clientHeight || 112;

    const lighting = MOOD_LIGHTING[mood];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.28, 3.1);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(lighting.ambient, 1.15);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(lighting.primary, 2.2);
    dirLight.position.set(2.5, 3.5, 3);
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(lighting.secondary, 1.6, 10);
    rimLight.position.set(-2.5, -1, 2);
    scene.add(rimLight);

    const {
      rootGroup,
      characterGroup,
      leftLeg,
      rightLeg,
      rainPoints,
      rainCount,
    } = buildRainPersonAndScene(
      visualType,
      mood,
      lighting.primary,
      lighting.secondary,
      lighting.rainColor
    );
    scene.add(rootGroup);

    let frameId = 0;
    const clock = new THREE.Clock();
    const rainSpeed = mood === "calm" ? 0.025 : mood === "tense" ? 0.065 : 0.055;
    const windTilt = mood === "calm" ? 0.03 : mood === "tense" ? 0.16 : 0.12;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        manualRotRef.current.y += 0.006;
      }

      rootGroup.rotation.y = manualRotRef.current.y;
      rootGroup.rotation.x = manualRotRef.current.x;

      // Gerakan orang kehujanan: sedikit condong diterpa angin/hujan & melangkah/bergetar
      const shiver =
        mood === "calm" ? 0 : Math.sin(elapsed * 28) * 0.012;
      characterGroup.rotation.z = -windTilt + shiver;
      characterGroup.rotation.x =
        mood === "calm" ? 0.04 : 0.12 + Math.cos(elapsed * 6) * 0.03;
      characterGroup.position.y =
        0.12 + Math.abs(Math.sin(elapsed * (mood === "calm" ? 2.5 : 6.5))) * 0.045;

      const stride = Math.sin(elapsed * (mood === "calm" ? 2.5 : 6.5)) * 0.35;
      leftLeg.rotation.x = stride;
      rightLeg.rotation.x = -stride;

      // Rintik hujan jatuh ke bawah & sedikit miring
      const posAttr = rainPoints.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      for (let i = 0; i < rainCount; i++) {
        let y = posAttr.getY(i) - rainSpeed;
        let x = posAttr.getX(i) - rainSpeed * 0.25;
        if (y < -0.75) {
          y = 1.45;
          x = (Math.random() - 0.35) * 2.8;
        }
        posAttr.setY(i, y);
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nextW = container.clientWidth || 176;
      const nextH = container.clientHeight || 112;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      rootGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else if (mat) {
          mat.dispose();
        }
      });
    };
  }, [visualType, mood]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    manualRotRef.current.y += dx * 0.012;
    manualRotRef.current.x = Math.max(
      -0.65,
      Math.min(0.65, manualRotRef.current.x + dy * 0.01)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Geser / drag untuk memutar tampilan 3D orang kehujanan"
      className="w-40 h-28 sm:w-48 sm:h-30 rounded-xl bg-black/35 border border-white/10 cursor-grab active:cursor-grabbing shrink-0 overflow-hidden touch-none"
    />
  );
}