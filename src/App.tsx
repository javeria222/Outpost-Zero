
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

import BuildMode from "./game/BuildMode";
import {
  BUILDINGS,
  advanceSol,
  constructBuilding,
  createNewColony,
  type BuildingType,
  type ColonyState,
} from "./game/colonySimulation";

function Astronaut() {
  const body = useRef<THREE.Group>(null);

  return (
    <group ref={body}>
      <mesh position={[0, 1.05, 0.25]} castShadow>
        <boxGeometry args={[0.48, 0.7, 0.28]} />
        <meshStandardMaterial color="#64758b" metalness={0.55} roughness={0.4} />
      </mesh>

      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.5, 8, 16]} />
        <meshStandardMaterial color="#e3e9f0" metalness={0.2} roughness={0.55} />
      </mesh>

      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 24]} />
        <meshStandardMaterial color="#dce7f5" metalness={0.75} roughness={0.18} />
      </mesh>

      <mesh position={[0, 1.86, -0.245]} rotation={[0.08, 0, 0]}>
        <sphereGeometry args={[0.245, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial
          color="#10283e"
          metalness={0.85}
          roughness={0.12}
          emissive="#123d59"
          emissiveIntensity={0.35}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.42, 1.15, 0]}>
          <mesh rotation={[0, 0, side * -0.12]}>
            <capsuleGeometry args={[0.105, 0.48, 6, 10]} />
            <meshStandardMaterial color="#c6d1df" />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#e5a76e" metalness={0.35} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.19, 0.48, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.14, 0.42, 6, 10]} />
            <meshStandardMaterial color="#b8c6d5" />
          </mesh>
          <mesh position={[0, -0.4, -0.07]}>
            <boxGeometry args={[0.25, 0.14, 0.38]} />
            <meshStandardMaterial color="#39495b" metalness={0.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.15, -0.355]}>
        <boxGeometry args={[0.12, 0.16, 0.025]} />
        <meshBasicMaterial color="#63f2ff" />
      </mesh>
    </group>
  );
}

function Habitat({
  position,
  label,
}: {
  position: [number, number, number];
  label: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[2.4, 2.7, 0.25, 12]} />
        <meshStandardMaterial color="#6b5150" />
      </mesh>

      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[1.5, 1.65, 2.2, 12]} />
        <meshStandardMaterial color="#c2cbd5" metalness={0.5} roughness={0.45} />
      </mesh>

      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[1.48, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#7f96aa" metalness={0.4} roughness={0.4} />
      </mesh>

      {[-0.8, 0, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.45, -1.51]}>
          <boxGeometry args={[0.34, 0.48, 0.05]} />
          <meshBasicMaterial color="#63e6ff" />
        </mesh>
      ))}

      <mesh position={[0, 0.75, -1.68]}>
        <boxGeometry args={[0.7, 1.35, 0.12]} />
        <meshStandardMaterial color="#35465a" metalness={0.65} />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[2.48, 2.48, 0.035, 32]} />
        <meshBasicMaterial color="#54e9ff" />
      </mesh>

      <pointLight position={[0, 2, 0]} color="#67ddff" intensity={2} distance={7} />

      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#6af5ff" />
      </mesh>

      <group position={[0, 3.65, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.06, 0.04]} />
          <meshBasicMaterial color="#65eaff" />
        </mesh>
      </group>

      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[2.9, 2.9, 0.025, 32]} />
        <meshBasicMaterial color="#b6b9c8" wireframe />
      </mesh>

      <mesh position={[0, 4.1, 0]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group position={[0, 4.3, 0]}>
        <mesh>
          <boxGeometry args={[0.01, 0.01, 0.01]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group name={label} />
    </group>
  );
}

function SolarFarm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[i * 2.1, 0, 0]} rotation={[-0.28, 0, 0]}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[1.75, 0.08, 1.25]} />
            <meshStandardMaterial color="#273c60" metalness={0.75} roughness={0.25} />
          </mesh>

          {[-0.4, 0, 0.4].map((x) => (
            <mesh key={x} position={[x, 1.1, 0.005]}>
              <boxGeometry args={[0.025, 0.085, 1.24]} />
              <meshBasicMaterial color="#5ab8f5" />
            </mesh>
          ))}

          {[-0.4, 0.4].map((z) => (
            <mesh key={z} position={[0, 1.1, z]}>
              <boxGeometry args={[1.75, 0.085, 0.025]} />
              <meshBasicMaterial color="#5ab8f5" />
            </mesh>
          ))}

          <mesh position={[0, 0.48, 0.1]}>
            <cylinderGeometry args={[0.055, 0.08, 0.95, 8]} />
            <meshStandardMaterial color="#a5b0bf" metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CommunicationsTower() {
  return (
    <group position={[7, 0, -5]}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.09, 0.18, 3, 8]} />
        <meshStandardMaterial color="#a8b6c7" metalness={0.7} />
      </mesh>

      {[0.6, 1.5, 2.4].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.38, 0.035, 8, 24]} />
          <meshBasicMaterial color="#54eaff" />
        </mesh>
      ))}

      <mesh position={[0, 3.15, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#ffab72" />
      </mesh>

      <pointLight position={[0, 3.1, 0]} color="#ff8e68" intensity={3} distance={10} />
    </group>
  );
}

function Rocks() {
  const rocks = Array.from({ length: 90 }, (_, i) => {
    const angle = i * 2.399;
    const radius = 12 + (i % 9) * 2.4;

    return {
      position: [
        Math.cos(angle) * radius,
        0.15 + (i % 4) * 0.08,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      scale: [
        0.35 + (i % 4) * 0.18,
        0.3 + (i % 3) * 0.15,
        0.35 + (i % 5) * 0.12,
      ] as [number, number, number],
      rotation: (i * 0.7) % 3,
    };
  });

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          scale={rock.scale}
          rotation={[rock.rotation, rock.rotation * 0.6, 0]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#92716a" : "#66585b"}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Terrain() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, 0]}
        receiveShadow
      >
        <planeGeometry args={[600, 600, 100, 100]} />
        <meshStandardMaterial color="#986b60" roughness={1} />
      </mesh>

      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[-65 + i * 9, 2 + (i % 4) * 1.4, -55 - (i % 3) * 5]}
          scale={[8 + (i % 3) * 4, 5 + (i % 4) * 2, 6]}
          rotation={[0, (i % 3) * 0.4, 0]}
        >
          <dodecahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="#704c50" roughness={1} flatShading />
        </mesh>
      ))}

      {Array.from({ length: 100 }, (_, i) => {
        const x = Math.sin(i * 78.2) * 42;
        const z = Math.cos(i * 43.7) * 42;

        return (
          <mesh
            key={i}
            position={[x, -0.03, z]}
            rotation={[-Math.PI / 2, 0, i]}
          >
            <ringGeometry args={[0.18, 0.23, 8]} />
            <meshBasicMaterial color="#b68a79" />
          </mesh>
        );
      })}
    </group>
  );
}


function FollowCamera({ buildMode }: { buildMode: boolean }) {
  const { camera, gl } = useThree();
  const player = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(0.12);
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);

  useEffect(() => {
    const canvas = gl.domElement;

    const controlledKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyE",
      "Space",
      "ShiftLeft",
      "ShiftRight",
    ];

    const onKeyDown = (event: KeyboardEvent) => {
      if (!controlledKeys.includes(event.code)) return;
      if (buildMode) return;

      event.preventDefault();
      keys.current[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
    };

    const clearKeys = () => {
      keys.current = {};
    };

    const onMouseMove = (event: MouseEvent) => {
      if (buildMode || document.pointerLockElement !== canvas) return;

      yaw.current -= event.movementX * 0.0025;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current - event.movementY * 0.0018,
        -0.2,
        0.65,
      );
    };

    const onCanvasClick = () => {
      if (buildMode) return;

      canvas.focus();

      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    };

    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", clearKeys);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onCanvasClick);

    if (buildMode && document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", clearKeys);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, [gl, buildMode]);

  useFrame((_, delta) => {
    const astronaut = player.current;

    if (!astronaut || buildMode) return;

    const dt = Math.min(delta, 0.05);

    // Camera-relative movement
    const forward = new THREE.Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current),
    );

    const right = new THREE.Vector3(
      -forward.z,
      0,
      forward.x,
    );

    const movement = new THREE.Vector3();

    // AZERTY: ZQSD
    if (keys.current.KeyW || keys.current.ArrowUp) {
      movement.add(forward);
    }

    if (keys.current.KeyS || keys.current.ArrowDown) {
      movement.sub(forward);
    }

    if (keys.current.KeyD || keys.current.ArrowRight) {
      movement.add(right);
    }

    if (keys.current.KeyA || keys.current.ArrowLeft) {
      movement.sub(right);
    }

    if (movement.lengthSq() > 0) {
      movement.normalize();

      const sprinting =
        keys.current.ShiftLeft ||
        keys.current.ShiftRight;

      const speed = sprinting ? 9 : 5;

      astronaut.position.addScaledVector(
        movement,
        speed * dt,
      );

      astronaut.rotation.y = Math.atan2(
        -movement.x,
        -movement.z,
      );
    }

    // E: Hold to fly continuously
    if (keys.current.KeyE) {
      isGrounded.current = false;

      verticalVelocity.current = Math.min(
        verticalVelocity.current + 30 * dt,
        12,
      );
    } else {
      // Space: Jump once
      if (keys.current.Space && isGrounded.current) {
        verticalVelocity.current = 7;
        isGrounded.current = false;
        keys.current.Space = false;
      }

      // Gravity
      verticalVelocity.current = Math.max(
        verticalVelocity.current - 18 * dt,
        -8,
      );
    }

    astronaut.position.y += verticalVelocity.current * dt;

    // Ground collision
    if (astronaut.position.y <= 0) {
      astronaut.position.y = 0;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    // World boundaries
    astronaut.position.x = THREE.MathUtils.clamp(
      astronaut.position.x,
      -80,
      80,
    );

    astronaut.position.z = THREE.MathUtils.clamp(
      astronaut.position.z,
      -80,
      80,
    );

    // Follow camera
    const distance = 8;
    const cameraHeight = 3.8 + pitch.current * 5;

    const desiredPosition = new THREE.Vector3(
      astronaut.position.x + Math.sin(yaw.current) * distance,
      astronaut.position.y + cameraHeight,
      astronaut.position.z + Math.cos(yaw.current) * distance,
    );

    camera.position.lerp(
      desiredPosition,
      1 - Math.exp(-5 * dt),
    );

    camera.lookAt(
      astronaut.position.x - Math.sin(yaw.current) * 2,
      astronaut.position.y + 1.4,
      astronaut.position.z - Math.cos(yaw.current) * 2,
    );
  });

  return (
    <group ref={player} position={[0, 0, 4]}>
      <Astronaut />
    </group>
  );
}


export default function App() {
  const [colony, setColony] = useState<ColonyState>(() => createNewColony());
  const [buildMode, setBuildMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingType>("solar");

  const placeBuilding = useCallback(
    (type: BuildingType, x: number, z: number, rotation: number) => {
      setColony((current) =>
        constructBuilding(current, type, x, z, rotation),
      );
    },
    [],
  );

  const handleAdvanceSol = () => {
    setColony((current) => advanceSol(current));
  };

  const resources = colony.resources;
  const selectedDefinition = BUILDINGS[selectedBuilding];

  const resourcePercent = (value: number) =>
    Math.max(0, Math.min(100, value));

  return (
    <main className="game">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 12], fov: 65, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <World
          buildMode={buildMode}
          selectedBuilding={selectedBuilding}
          colony={colony}
          onPlaceBuilding={placeBuilding}
        />
      </Canvas>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>OUTPOST ZERO</strong>
            <small>MARS COLONIZATION PROGRAM</small>
          </div>
        </div>

        <div className="mission">
          <span className="live-dot" />
          MARS 2049 <span className="muted">/</span> SOL{" "}
          {String(colony.sol).padStart(2, "0")} OF 30
        </div>

        <div className="coordinates">
          <span>18.4° N</span>
          <small>ARCADIA PLANITIA</small>
        </div>
      </header>

      <aside className="left-panel">
        <small className="eyebrow">MISSION STATUS</small>
        <h2>
          {colony.status === "survived"
            ? "Mission accomplished."
            : colony.status === "failed"
              ? "Mission compromised."
              : buildMode
                ? "Expand the outpost."
                : "Establish the outpost."}
        </h2>

        <p>
          {colony.status === "survived"
            ? "Your colony survived the 30-sol mission."
            : colony.status === "failed"
              ? "An essential resource has run out. Review the colony report."
              : "Secure the base. Restore essential systems. Survive the Martian frontier."}
        </p>

        <div className="objective">
          <span className="objective-number">01</span>
          <div>
            <strong>Establish a habitat</strong>
            <small>{colony.buildings.some((b) => b.type === "habitat") ? "CONSTRUCTED" : "REQUIRED"}</small>
          </div>
        </div>

        <div className="objective">
          <span className="objective-number">02</span>
          <div>
            <strong>Generate power</strong>
            <small>{colony.buildings.some((b) => b.type === "solar") ? "ONLINE" : "REQUIRED"}</small>
          </div>
        </div>

        <div className="objective">
          <span className="objective-number">03</span>
          <div>
            <strong>Protect life support</strong>
            <small>{colony.buildings.some((b) => b.type === "lifeSupport") ? "INSTALLED" : "REQUIRED"}</small>
          </div>
        </div>

        <div className="panel-divider" />

        <small className="eyebrow">COLONY RESOURCES</small>
        <Resource label="POWER" value={`${resources.power} kW`} percent={resourcePercent(resources.power)} color="#65eaff" />
        <Resource label="OXYGEN" value={`${resources.oxygen}`} percent={resourcePercent(resources.oxygen)} color="#a8a0ff" />
        <Resource label="WATER" value={`${resources.water}`} percent={resourcePercent(resources.water)} color="#5ebdff" />
        <Resource label="FOOD" value={`${resources.food}`} percent={resourcePercent(resources.food)} color="#79e7ae" />
        <Resource label="MATERIALS" value={`${resources.materials}`} percent={resourcePercent(resources.materials)} color="#f1b778" />
      </aside>

      <aside className="right-panel">
        <div className="status-heading">
          <span className="live-dot" />
          OUTPOST NETWORK
        </div>

        <div className="system">
          <span className="system-icon">⌁</span>
          <div>
            <strong>Life support</strong>
            <small>{colony.buildings.some((b) => b.type === "lifeSupport") ? "INSTALLED" : "STANDBY"}</small>
          </div>
          <i className={colony.buildings.some((b) => b.type === "lifeSupport") ? "status-good" : "status-warning"} />
        </div>

        <div className="system">
          <span className="system-icon">ϟ</span>
          <div>
            <strong>Power grid</strong>
            <small>{colony.buildings.some((b) => b.type === "solar") ? "GENERATION AVAILABLE" : "LOW OUTPUT"}</small>
          </div>
          <i className={colony.buildings.some((b) => b.type === "solar") ? "status-good" : "status-warning"} />
        </div>

        <div className="system">
          <span className="system-icon">⌂</span>
          <div>
            <strong>Habitat</strong>
            <small>{colony.buildings.some((b) => b.type === "habitat") ? "CONSTRUCTED" : "NOT ESTABLISHED"}</small>
          </div>
          <i className={colony.buildings.some((b) => b.type === "habitat") ? "status-good" : "status-warning"} />
        </div>

        <div className="credits">
          <small>AVAILABLE CREDITS</small>
          <strong>
            <span>◈</span> {resources.credits} <small>CR</small>
          </strong>
        </div>

        <div className="panel-divider" />

        <small className="eyebrow">CONSTRUCTION</small>
        <label htmlFor="building-select">SELECT STRUCTURE</label>
        <select
          id="building-select"
          value={selectedBuilding}
          onChange={(event) =>
            setSelectedBuilding(event.target.value as BuildingType)
          }
          disabled={colony.status !== "building"}
        >
          {Object.values(BUILDINGS).map((building) => (
            <option key={building.id} value={building.id}>
              {building.name} — {building.cost} CR
            </option>
          ))}
        </select>

        <p>{selectedDefinition.description}</p>
        <button
          type="button"
          onClick={() => setBuildMode((current) => !current)}
          disabled={colony.status !== "building"}
        >
          {buildMode ? "EXIT BUILD MODE" : "ENTER BUILD MODE"}
        </button>

        <button
          type="button"
          onClick={handleAdvanceSol}
          disabled={colony.status !== "building"}
        >
          ADVANCE TO NEXT SOL
        </button>

        {buildMode && (
          <small>
            MOVE MOUSE TO POSITION · CLICK TO PLACE · R TO ROTATE
          </small>
        )}
      </aside>

      <div className="location-tag">
        <span className="location-dot" />
        <div>
          <strong>ARCADIA EXPEDITION ZONE</strong>
          <small>SECTOR 01 · SURFACE OPERATIONS</small>
        </div>
      </div>

      <div className="center-reticle">
        <span />
      </div>

      {colony.event && (
        <div className="mission-event">
          <strong>MISSION ALERT</strong>
          <p>{colony.event}</p>
        </div>
      )}

    
<footer className="bottom-bar">
  <div className="controls">
    <span>
      <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> MOVE
    </span>
    <span><kbd>SPACE</kbd> JUMP</span>
    <span><kbd>Q</kbd> JETPACK / FLY</span>
    <span><kbd>SHIFT</kbd> SPRINT</span>
    <span><kbd>MOUSE</kbd> LOOK AROUND</span>
    <span><kbd>ESC</kbd> RELEASE MOUSE</span>
  </div>
  <div className="build-label">
    OUTPOST ZERO <span>·</span> FIELD BUILD 0.2
  </div>
</footer>

    </main>
  );
}

function Resource({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="resource">
      <div className="resource-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="resource-track">
        <div
          className="resource-fill"
          style={{
            width: `${Math.max(0, Math.min(100, percent))}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
