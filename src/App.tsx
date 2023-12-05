import { Canvas, useFrame } from "@react-three/fiber";
import "./App.css";
import { useRef } from "react";
import { OrbitControls, Sphere } from "@react-three/drei";
import { BufferAttribute, BufferGeometry } from "three";

const MAX_PLANET_RADIUS = 4;
const MIN_PLANET_RADIUS = 0.6;

function generatePlanet(previousOrbit: number, orbitIndex: number) {
  const color = getRandomColor();
  const baseOrbit = 6;

  let orbitRadius;
  if (previousOrbit === 0) {
    orbitRadius = baseOrbit * 4;
  } else {
    // Introduce variance by multiplying with a random factor between 0.8 and 1.2
    const randomFactor = 0.8 + Math.random() * 0.3;
    orbitRadius = baseOrbit * (orbitIndex + 1) + previousOrbit * randomFactor;
  }

  // Generate planet radius within a specified range
  const mediumPlanetRadius = (MAX_PLANET_RADIUS + MIN_PLANET_RADIUS) / 2;
  const rangeFactor = 2; // Adjust the factor as needed
  const planetRadius = Math.min(
    MAX_PLANET_RADIUS,
    Math.max(
      MIN_PLANET_RADIUS,
      mediumPlanetRadius + (Math.random() - 0.5) * rangeFactor
    )
  );

  // Random chance for moons
  const hasMoon = Math.random() < 0.2;

  return {
    color,
    orbitRadius,
    planetRadius,
    hasMoon,
  };
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function App() {
  return (
    <div id="canvas-wrapper">
      <Canvas camera={{ position: [0, 150, 300] }} shadows>
        <color attach="background" args={["#001"]} />
        <Content />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

function Content() {
  // @ts-ignore
  let planets = [];

  for (let i = 0; i < 8; i++) {
    // @ts-ignore
    planets.push(generatePlanet(i > 0 ? planets[i - 1].orbitRadius : 0, i));
  }

  return (
    <group>
      {/* @ts-ignore */}
      <SimpleStar position={[0, 0, 0]} />
      {planets.map((planet, index) => (
        // @ts-ignore
        <SimplePlanet
          hasMoon={planet.hasMoon}
          key={index}
          orbitRadius={planet.orbitRadius}
          planetRadius={planet.planetRadius}
          color={planet.color}
        />
      ))}
    </group>
  );
}

function SimplePlanet({
  hasMoon,
  orbitRadius,
  color,
  planetRadius,
  ...props
}: {
  hasMoon: boolean;
  orbitRadius: number;
  color: string;
  planetRadius: number;
  props: any;
}) {
  const planetRef = useRef(null);
  const orbitVariance =
    (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.2);
  const rotation = Math.random() > 0.5 ? 1 : -1;

  // Planet orbit
  useFrame(({ clock }) => {
    // Orbit rotation
    // @ts-ignore
    planetRef.current.position.x =
      Math.sin(orbitVariance * clock.getElapsedTime()) * orbitRadius;
    // @ts-ignore
    planetRef.current.position.z =
      Math.cos(orbitVariance * clock.getElapsedTime()) * orbitRadius;

    // @ts-ignore
    planetRef.current.rotation.y += 0.02;

    // @ts-ignore
    planetRef.current.rotation.z =
      // @ts-ignore
      planetRef.current.rotation.z + 0.001 * rotation;
  });

  return (
    <group>
      <SimpleOrbit radius={orbitRadius} />
      <Sphere
        castShadow
        receiveShadow
        ref={planetRef}
        args={[planetRadius, 6, 6]}
        {...props}
      >
        <meshStandardMaterial roughness={0.75} emissive={color} />
        {/* Moon */}

        {hasMoon && (
          <SimpleMoon
            planetRef={planetRef}
            orbitRadius={planetRadius + 3}
            color={color}
          />
        )}
      </Sphere>
    </group>
  );
}

function SimpleMoon({
  planetRef,
  orbitRadius,
  color,
  ...props
}: {
  planetRef: React.MutableRefObject<null>;
  orbitRadius: number;
  color: string;
  props?: any;
}) {
  const moonRef = useRef(null);
  const orbitVariance = Math.random() * 0.5;

  useFrame(({ clock }) => {
    // Orbit rotation
    // @ts-ignore
    moonRef.current.position.x =
      orbitRadius * Math.sin(orbitVariance * clock.getElapsedTime());
    // @ts-ignore
    moonRef.current.position.z =
      orbitRadius * Math.cos(orbitVariance * clock.getElapsedTime());
  });

  return (
    <mesh>
      <meshStandardMaterial roughness={0.75} emissive={color} />

      <Sphere
        castShadow
        receiveShadow
        ref={moonRef}
        args={[orbitRadius / 6, 6, 6]}
        {...props}
      />
    </mesh>
  );
}

function SimpleOrbit({ radius }: { radius: number }) {
  const orbitRef = useRef();

  const orbitGeometry = new BufferGeometry();
  const positions = [];

  // Create orbit circle points
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;
    positions.push(x, 0, z);
  }

  orbitGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );

  return (
    // @ts-ignore
    <group ref={orbitRef}>
      <line>
        <bufferGeometry attach="geometry" {...orbitGeometry} />
        <lineBasicMaterial color="#666" transparent opacity={0.3} />
      </line>
    </group>
  );
}

function SimpleStar({ time, ...props }: { time: number; props: any }) {
  const starRef = useRef(null);

  // @ts-ignore
  useFrame(({ clock }) => {
    // @ts-ignore
    starRef.current.rotation.y -= 0.002;
  });
  return (
    <mesh {...props} ref={starRef}>
      <meshStandardMaterial emissive="yellow" />
      <sphereGeometry args={[6, 6, 6]} />
      <pointLight
        color="white"
        intensity={1}
        distance={1000}
        castShadow
        position={[0, 0, 0]}
      />
    </mesh>
  );
}

export default App;
