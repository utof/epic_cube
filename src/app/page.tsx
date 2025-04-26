// app/page.tsx

"use client";

import { useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  SoftShadows,
  MeshTransmissionMaterial,
  Environment,
} from "@react-three/drei";
// FIX: Import specific types from 'three' to help TypeScript
import { Vector3, Group, Color, PerspectiveCamera } from "three";
import { useControls, button } from "leva";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  SSAO,
  Vignette,
} from "@react-three/postprocessing";

/**
 * A dedicated component to control the camera with Leva.
 */
function CameraRig() {
  const { camera } = useThree();

  useControls("Camera", () => ({
    position: {
      value: [4, 1.5, 5],
      step: 0.1,
      onChange: (v) => camera.position.set(v[0], v[1], v[2]),
    },
    fov: {
      value: 35,
      min: 10,
      max: 120,
      onChange: (v) => {
        // FIX: Check if the camera is a PerspectiveCamera before accessing 'fov'
        if (camera instanceof PerspectiveCamera) {
          camera.fov = v;
          camera.updateProjectionMatrix();
        }
      },
    },
    "Save Camera": button(() => {
      // FIX: Check if the camera is a PerspectiveCamera before accessing 'fov'
      if (camera instanceof PerspectiveCamera) {
        const { x, y, z } = camera.position;
        const cameraState = { position: [x, y, z], fov: camera.fov };
        const stateString = JSON.stringify(cameraState, null, 2);
        navigator.clipboard.writeText(stateString);
        alert("Camera state copied to clipboard!");
      }
    }),
  }));

  return useFrame(() => {
    camera.lookAt(0, -3.5, 0);
  });
}

/**
 * This is the main component containing our 3D scene logic.
*/
function Scene() {
    // RESTORED: Using useState for the light position, as you originally had.
    const [lightPosition, setLightPosition] = useState(new Vector3(0, .5, 0));
    const cubeGroupRef = useRef<Group>(null!);
    
    const materialProps = useControls("Glass Material", {
    thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
    roughness: { value: 0.05, min: 0, max: 1, step: 0.01 },
    color: "#ffffff",
    "Save Material": button((get) => {
        const { color, ...rest } = get("Glass Material");
        const materialState = { color: `#${new Color(color).getHexString()}`, ...rest };
        delete materialState["Save Material"];
        const stateString = JSON.stringify(materialState, null, 2);
        navigator.clipboard.writeText(stateString);
        alert("Material state copied to clipboard!");
    }),
});

const groundProps = useControls("Ground Plane", {
    color: "#ffffff",
    roughness: { value: 0.2, min: 0, max: 1 },
    metalness: { value: 0.5, min: 0, max: 1 },
});

useFrame((state, delta) => {
    if (cubeGroupRef.current) {
        cubeGroupRef.current.rotation.y += delta * 0;
    }
});

useThree(({camera}) => {
    camera.lookAt(0, -0.5, 0);
  });
  return (
    <>
      {/* <CameraRig /> */}
      <SoftShadows size={80} focus={0.4} samples={30} />
      <Environment preset="studio" />
      {/* <ambientLight intensity={1.5} color="#ffffff" /> */}
      {/* <spotLight
        castShadow
        position={[0, 5, 0]}
        intensity={80}
        distance={10}
        decay={2}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={0.5}
      /> */}
      {/* The interactive light now correctly uses the state variable for its position */}
      <spotLight
        castShadow
        position={lightPosition}
        intensity={90}
        distance={8}
        decay={2}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={1}
      />
      <group ref={cubeGroupRef} position={[0, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="black" colorWrite={false} depthWrite={false} />
        </mesh>
        <mesh receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <MeshTransmissionMaterial {...materialProps} thickness={0.2} roughness={0.15} transmission={1} chromaticAberration={1} ior={2}/>
        </mesh>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        // RESTORED: The onPointerMove event handler updates the state.
        onPointerMove={(e) => {
          setLightPosition(new Vector3(e.point.x, 1.5, e.point.z));
        }}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#727272" roughness={0.13} metalness={0.38} />
      </mesh>

    </>
  );
}

export default function HomePage() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #d3d3d3, #f5f5f5)",
      }}
    >
      <Canvas shadows camera={{position: [4, 3.5, -3], fov: 31}}>
        <Scene />
      </Canvas>
    </main>
  );
}