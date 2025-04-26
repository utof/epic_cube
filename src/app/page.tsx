// app/page.tsx

"use client"; // This is essential for using React hooks and event listeners in Next.js App Router

import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import { Vector3, Mesh } from "three";

/**
 * This is the main component containing our 3D scene logic.
 * It's kept separate from the Page component for better organization.
 */
function Scene() {
  // State to hold the position of our interactive light
  // We initialize it off-screen until the mouse moves over the canvas
  const [lightPosition, setLightPosition] = useState(new Vector3(0, 5, 0));

  // A ref to the cube mesh to make it rotate
  const cubeRef = useRef<Mesh>(null!);
  return (
    <>
      {/* 
        SoftShadows from drei is a helper that makes shadows look much better.
        'size' controls the blurriness/fuzziness.
        'focus' helps maintain sharpness near the shadow caster.
        'samples' improves the quality.
      */}
      <SoftShadows size={35} focus={0.9} samples={24} />

      {/* Ambient light to illuminate the whole scene faintly.
          This ensures that the parts of the cube not hit by the main light are not pitch black.
          The color is a light gray. */}
      <ambientLight intensity={2} color="#ffffff" />

      {/* This is our interactive light. It's a PointLight, which emits light from a single point.
          - 'castShadow' is crucial for it to create shadows.
          - 'position' is controlled by the mouse movement.
          - 'intensity' is how bright the light is.
          - 'distance' and 'decay' make the light fade out over distance, as requested.
      */}
      <pointLight
        castShadow
        position={lightPosition}
        intensity={90}
        distance={4}
        decay={4}
        color="#ffffff"
      />

      {/* This is the central cube. */}
      <mesh ref={cubeRef} position={[0, 0.45, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        {/* 
          meshStandardMaterial is a physically based material that reacts to light realistically.
          - 'color' is a light beige/gray, like cardboard.
          - 'roughness' makes the surface non-glossy (a high value means less reflective).
          - 'metalness' is set to 0 for a non-metallic look.
        */}
        <meshStandardMaterial color="#f2e9d8" roughness={0.5} metalness={1} />
      </mesh>

      {/* This is the ground plane. It needs to be large enough to catch the shadow. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]} // Rotate it to be flat
        position={[0, 0, 0]}
        receiveShadow // This allows the plane to have shadows cast upon it.
        // We add the onPointerMove event here. It's the most efficient way to track the cursor in 3D space.
        // The event 'e.point' gives us the exact 3D coordinate where the cursor intersects with this mesh.
        onPointerMove={(e) => {
          // We update the light's position based on the cursor's intersection point on the plane.
          // We keep the light's height (Y-axis) constant at 2.5 units above the plane.
          setLightPosition(new Vector3(e.point.x, 2.5, e.point.z));
        }}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.5} />
      </mesh>
    </>
  );
}

/**
 * This is the main page component exported for Next.js.
 */
export default function HomePage() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #d3d3d3, #f5f5f5)",
      }}
    >
      {/* 
        The Canvas component is the root of our 3D scene.
        - 'shadows' enables shadow mapping in the renderer.
        - 'camera' sets the initial properties of the camera.
          - 'position' is set as requested: 45 degrees above and slightly to the side.
          - 'fov' (Field of View) controls the zoom level.
      */}
      <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
        <Scene />
      </Canvas>
    </main>
  );
}
