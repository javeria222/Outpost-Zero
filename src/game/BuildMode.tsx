
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BUILDINGS,
  type BuildingType,
  type PlacedBuilding,
} from "./colonySimulation";

type BuildModeProps = {
  active: boolean;
  selected: BuildingType;
  buildings: PlacedBuilding[];
  credits: number;
  onPlace: (type: BuildingType, x: number, z: number, rotation: number) => void;
};

const GRID = 2;
const BUILD_RADIUS = 3.5;

function snap(value: number) {
  return Math.round(value / GRID) * GRID;
}

function Structure({ type }: { type: BuildingType }) {
  const common = { castShadow: true, receiveShadow: true };

  switch (type) {
    case "habitat":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} {...common}>
            <cylinderGeometry args={[1.8, 2, 0.4, 16]} />
            <meshStandardMaterial color="#718495" metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 0]} {...common}>
            <cylinderGeometry args={[1.4, 1.6, 2.3, 16]} />
            <meshStandardMaterial color="#c3d3df" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[0, 2.7, 0]} {...common}>
            <sphereGeometry args={[1.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#709db5" metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.1, -1.55]}>
            <boxGeometry args={[0.7, 1.2, 0.12]} />
            <meshStandardMaterial color="#263d50" />
          </mesh>
        </group>
      );

    case "solar":
      return (
        <group>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 1.2, 1, 0]}>
              <mesh rotation={[-0.18, 0, 0]} {...common}>
                <boxGeometry args={[1.8, 0.08, 2.5]} />
                <meshStandardMaterial color="#183d75" metalness={0.7} roughness={0.25} />
              </mesh>
              {[-0.6, 0, 0.6].map((line) => (
                <mesh key={line} position={[line, 0.06, 0]}>
                  <boxGeometry args={[0.035, 0.025, 2.45]} />
                  <meshBasicMaterial color="#59dfff" />
                </mesh>
              ))}
              <mesh position={[0, -0.48, 0]}>
                <cylinderGeometry args={[0.07, 0.1, 0.9, 8]} />
                <meshStandardMaterial color="#aab7c2" metalness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "lifeSupport":
      return (
        <group>
          <mesh position={[0, 1, 0]} {...common}>
            <boxGeometry args={[2.2, 2, 1.8]} />
            <meshStandardMaterial color="#a6bac8" metalness={0.5} />
          </mesh>
          {[-0.65, 0, 0.65].map((x) => (
            <mesh key={x} position={[x, 1, -0.94]}>
              <cylinderGeometry args={[0.2, 0.2, 1.2, 12]} />
              <meshStandardMaterial color="#52e7ee" emissive="#0d7f92" emissiveIntensity={0.7} />
            </mesh>
          ))}
        </group>
      );

    case "greenhouse":
      return (
        <group>
          <mesh position={[0, 1.1, 0]} {...common}>
            <boxGeometry args={[3, 2.2, 3]} />
            <meshPhysicalMaterial color="#6bc7d7" transparent opacity={0.35} roughness={0.15} metalness={0.1} />
          </mesh>
          {[-0.8, 0, 0.8].map((x) => (
            <mesh key={x} position={[x, 0.65, 0]}>
              <boxGeometry args={[0.22, 0.6, 2.2]} />
              <meshStandardMaterial color="#4d985f" />
            </mesh>
          ))}
          <mesh position={[0, 2.25, 0]}>
            <boxGeometry args={[3.1, 0.12, 3.1]} />
            <meshStandardMaterial color="#b4d0d9" metalness={0.4} />
          </mesh>
        </group>
      );

    case "waterRecycler":
      return (
        <group>
          <mesh position={[0, 0.9, 0]} {...common}>
            <cylinderGeometry args={[0.9, 1.1, 1.8, 16]} />
            <meshStandardMaterial color="#648b9c" metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.2, 16]} />
            <meshStandardMaterial color="#52e7ee" emissive="#116a77" />
          </mesh>
        </group>
      );

    case "shielding":
      return (
        <group>
          <mesh position={[0, 0.3, 0]} {...common}>
            <cylinderGeometry args={[2.1, 2.1, 0.6, 16]} />
            <meshStandardMaterial color="#9b8a72" roughness={1} />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 0.12, 24]} />
            <meshBasicMaterial color="#f4b86a" />
          </mesh>
        </group>
      );

    case "battery":
      return (
        <group>
          {[-0.55, 0.55].map((x) => (
            <mesh key={x} position={[x, 0.75, 0]} {...common}>
              <boxGeometry args={[0.9, 1.5, 1.4]} />
              <meshStandardMaterial color="#53677e" metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.45, 0.12, 0.15]} />
            <meshBasicMaterial color="#5af4ff" />
          </mesh>
        </group>
      );
  }
}

function GhostStructure({
  type,
  valid,
}: {
  type: BuildingType;
  valid: boolean;
}) {
  return (
    <group>
      <Structure type={type} />
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.1, 32]} />
        <meshBasicMaterial
          color={valid ? "#4dffd2" : "#ff5369"}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function BuildMode({
  active,
  selected,
  buildings,
  credits,
  onPlace,
}: BuildModeProps) {
  const { camera, gl } = useThree();
  const [position, setPosition] = useState<[number, number, number] | null>(null);
  const [rotation, setRotation] = useState(0);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ground = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  const affordable = credits >= BUILDINGS[selected].cost;

  const valid = useMemo(() => {
    if (!position || !affordable) return false;

    const [x, , z] = position;
    if (Math.abs(x) > 45 || Math.abs(z) > 45) return false;

    return !buildings.some(
      (building) => Math.hypot(building.x - x, building.z - z) < BUILD_RADIUS,
    );
  }, [position, buildings, affordable]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = gl.domElement;

    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }

    const getGroundPosition = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectPlane(ground, target);
      if (!hit) return null;

      return [snap(hit.x), 0, snap(hit.z)] as [number, number, number];
    };

    const onMove = (event: MouseEvent) => {
      const next = getGroundPosition(event);
      if (next) setPosition(next);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyR") {
        setRotation((current) => (current + Math.PI / 2) % (Math.PI * 2));
      }
      if (event.code === "Escape") setPosition(null);
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;

      // Calculate placement from the actual click, not a stale mouse position.
      const clicked = getGroundPosition(event);
      if (!clicked) return;

      const [x, , z] = clicked;
      if (Math.abs(x) > 45 || Math.abs(z) > 45) return;
      if (credits < BUILDINGS[selected].cost) return;

      const occupied = buildings.some(
        (building) => Math.hypot(building.x - x, building.z - z) < BUILD_RADIUS,
      );
      if (occupied) return;

      onPlace(selected, x, z, rotation);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("click", onClick);

    return () => {
      setPosition(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("click", onClick);
    };
  }, [
    active,
    camera,
    gl,
    ground,
    onPlace,
    buildings,
    selected,
    rotation,
    raycaster,
    target,
    credits,
  ]);

  return (
    <group>
      {buildings.map((building) => (
        <group
          key={building.instanceId}
          position={[building.x, 0, building.z]}
          rotation={[0, building.rotation, 0]}
        >
          <Structure type={building.type} />
        </group>
      ))}

      {active && position && (
        <group position={position} rotation={[0, rotation, 0]}>
          <GhostStructure type={selected} valid={valid} />
        </group>
      )}
    </group>
  );
}
