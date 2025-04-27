// app/page.tsx

"use client";

import { useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  SoftShadows,
  MeshTransmissionMaterial,
  Environment,
} from "@react-three/drei";
import { Vector3, Group } from "three";
import {
  EffectComposer,
  Autofocus,
  DepthOfField,
  SSAO,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
// import * as rtpp from "@react-three/postprocessing";
import { HeroSurround } from "./HeroSurround"; // Make sure the path is correct

// --- Your existing Scene component and other helpers go here ---
// (No changes needed for the Scene component itself)
function Scene() {
  const [lightPosition, setLightPosition] = useState(
    new Vector3(-1.7, 2.8, 1.5)
  );
  const cubeGroupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    if (cubeGroupRef.current) {
      // A little bit of rotation to make it feel alive
      cubeGroupRef.current.rotation.y += delta * 0.2;
    }
  });
  useThree(({ camera }) => {
    camera.lookAt(0, 0.25, 0);
    // if (cubeGroupRef.current) {
    //     cubeGroupRef.current.rotation.y = 20;
    // }
  });

  return (
    <>
      <SoftShadows size={80} focus={0.4} samples={30} />
      <Environment preset="studio" />
      <ambientLight intensity={1.5} color="#ffffff" />
      <spotLight
        castShadow
        position={[0, 2.5, 0]}
        intensity={40}
        distance={100}
        decay={1}
        color="#ffffff"
        angle={Math.PI / 5}
        penumbra={1}
      />
      <spotLight
        castShadow
        position={lightPosition}
        intensity={80}
        distance={8}
        decay={1}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={1}
      />
      <group ref={cubeGroupRef} position={[0, 0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial
            color="black"
            colorWrite={false}
            depthWrite={false}
          />
        </mesh>
        <mesh receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <MeshTransmissionMaterial
            anisotropy={1}
            distortion={0.4}
            distortionScale={0.63}
            temporalDistortion={0.07}
            iridescence={1}
            iridescenceIOR={2.33}
            color="#ffffff"
            thickness={0.2}
            roughness={0.15}
            transmission={1}
            chromaticAberration={1}
            ior={2}
          />
        </mesh>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerMove={(e) => {
          // This will now work because of `pointer-events-none` on the overlay!
          setLightPosition(new Vector3(e.point.x, 0.5, e.point.z));
        }}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#727272"
          roughness={0.13}
          metalness={0.38}
        />
      </mesh>
      <EffectComposer>
        <DepthOfField
          focusDistance={0}
          focalLength={0.1}
          bokehScale={4}
          height={480}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.002, 0.0002]} // color offset
        />
      </EffectComposer>
    </>
  );
}

// A placeholder for your shadcn/ui CTA button
const CallToAction = () => (
  // You can use your actual shadcn Button here
  <button
    className="w-full px-6 py-3 bg-black text-white text-lg md:text-xl font-bold hover:bg-neutral-800 transition-colors"
    onClick={() => alert("sold out sori bro")}
  >
    Gimme dat
  </button>
);

export default function HomePage() {
  // State to hold the calculated parallax offset
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  // This function calculates the parallax effect based on mouse position
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { offsetWidth, offsetHeight } = currentTarget;

    // Calculate mouse position from the center of the screen (-1 to 1)
    const x = (clientX / offsetWidth - 0.5) * 2;
    const y = (clientY / offsetHeight - 0.5) * 2;

    // Define the maximum movement distance for the parallax effect
    const maxOffset = 1; // pixels

    setParallaxOffset({
      x: -x * maxOffset, // Invert for a natural parallax feel
      y: -y * maxOffset,
    });
  };

  return (
    // We add the onMouseMove handler to the main container
    <main
      className="relative h-screen w-screen overflow-hidden bg-[#dbe0e7]"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 20 }} // Adjusted camera for better framing
        className="h-full w-full"
      >
        <Scene />
      </Canvas>

      <HeroSurround cta={<CallToAction />} parallaxOffset={parallaxOffset} />
    </main>
  );
}