// app/page.tsx

"use client"; // This is essential for using React hooks and event listeners in Next.js App Router

import { useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import { Vector3, Group, MathUtils } from "three";

/**
 * This is the main component containing our 3D scene logic.
 * It's kept separate from the Page component for better organization.
 */
function Scene() {
  // State to hold the position of our interactive light
  const [lightPosition, setLightPosition] = useState(new Vector3(-0.5, 0.5, 2.9));

  // A ref to the group containing both cube meshes to rotate them together
  const cubeGroupRef = useRef<Group>(null!);

  // useFrame is a hook that runs on every rendered frame to add rotation
  useFrame((state, delta) => {
    if (cubeGroupRef.current) {
      cubeGroupRef.current.rotation.y += delta * 0.1;
    }
  });
  useThree(({ camera }) => {
    // camera.rotation.set(MathUtils.degToRad(-100), MathUtils.degToRad(2), 0);
    console.log(camera.rotation)
  });

  return (
    <>
      {/* 
        SoftShadows from drei is a helper that makes shadows look much better.
        'size' controls the blurriness/fuzziness.
        'focus' helps maintain sharpness near the shadow caster.
        'samples' improves the quality.
      */}
      <SoftShadows size={80} focus={0.4} samples={30} />

      {/* 
        Ambient light to illuminate the whole scene faintly.
        The intensity is high enough to make sure the cube is never black.
        The color is a neutral white.
      />
      */}    
      <ambientLight intensity={1.5} color="#ffffff" />

      {/* 
        NEW: We now use a SpotLight for a more "diffused" effect.
        A spotlight creates a cone of light, which we can soften.
        - 'penumbra' creates the soft edge on the light cone. A value of 1 is maximum softness.
        - 'angle' controls how wide the cone is.
        - It still casts a shadow and fades with distance and decay.
        - We also give it a target. By default, it targets [0,0,0], which is perfect.
      */}
      <spotLight
        castShadow
        position={lightPosition}
        intensity={90}
        distance={8}
        decay={2}
        color="#ffffff"
        angle={Math.PI / 6} // A 45-degree cone angle
        penumbra={1} // Maximum softness for the edge
      />
      {/* <spotLight
        castShadow
        position={new Vector3(-0.5, 0.5, 2.9)}
        intensity={40}
        distance={8}
        decay={2}
        color="#ffffff"
        angle={Math.PI / 6} // A 45-degree cone angle
        penumbra={1} // Maximum softness for the edge
      /> */}


        <spotLight
        castShadow
        position={new Vector3(0, 5, 0)}
        intensity={80}
        distance={100}
        decay={2}
        color="#ffffff"
        angle={Math.PI / 6} // A 45-degree cone angle
        penumbra={0.5} // Maximum softness for the edge
      />
      

      {/* 
        NEW: We use a <group> to hold two cube meshes.
        This allows us to position and rotate them as a single unit.
        This is the key to having a transparent object that also casts a shadow.
      */}
      <group ref={cubeGroupRef} position={[0, 0.5, 0]}>
        {/* 
          MESH 1: THE SHADOW CASTER (INVISIBLE)
          This mesh's only job is to cast a shadow. It's not visible to the camera.
          We make it invisible by using a material that doesn't write to the color buffer.
          It MUST have castShadow={true}.
        */}
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="black" colorWrite={false} depthWrite={false} />
        </mesh>

        {/* 
          MESH 2: THE VISUAL CUBE (TRANSPARENT & REFRACTIVE)
          This is the cube the user actually sees.
          It does NOT cast a shadow, because transparent objects let light pass through them.
        */}
        <mesh receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          {/* 
            NEW: We use meshPhysicalMaterial for advanced effects like transparency and refraction.
            - 'metalness' is now 0.1. This is THE FIX for the ambient light issue. Non-metallic objects are affected by ambient light.
            - 'roughness' controls how "frosted" the glass is. 0 is clear, 1 is fully frosted.
            - 'transmission' is the key property for transparency/refraction. 1 means 100% of light passes through.
            - 'thickness' affects the amount of refractive distortion.
          */}
          <meshPhysicalMaterial
            color="#f2e9d8"
            metalness={0}
            roughness={0}
            transmission={1}
            thickness={0.1}
            dispersion={1}
            iridescence={1}
          />
        </mesh>
      </group>

      {/* This is the ground plane. It needs to be large enough to catch the shadow. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]} // Rotate it to be flat
        position={[0, -0.01, 0]} // Lowered slightly to prevent visual artifacts with the cube
        receiveShadow // This allows the plane to have shadows cast upon it.
        onPointerMove={(e) => {
          // We update the light's position based on the cursor's intersection point on the plane.
          // We keep the light's height (Y-axis) constant.
          setLightPosition(new Vector3(e.point.x, 1.5, e.point.z));
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