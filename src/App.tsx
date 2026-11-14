import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

import BuildMode from "./game/BuildMode";
import {
  STRUCTURE_CATALOGUE,
  calculateNetRates,
  type StructureId,
} from "./game/simulateTick";
import { useColonyStore } from "./game/useColonyStore";
import { MISSION_OBJECTIVES } from "./game/missionObjectives";

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

    const clearKeys = () => {
      keys.current = {};
    };

    const handlePointerLockChange = () => {
      clearKeys();
      if (document.pointerLockElement !== canvas) {
        canvas.blur();
      }
    };

    const handleBlur = () => {
      clearKeys();
      canvas.blur();
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearKeys();
        canvas.blur();
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock();
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        clearKeys();
        canvas.blur();
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock();
        }
        return;
      }

      if (!controlledKeys.includes(event.code)) return;
      if (buildMode || (document.pointerLockElement !== canvas && document.activeElement !== canvas)) {
        clearKeys();
        return;
      }

      event.preventDefault();
      keys.current[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockChange);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onCanvasClick);

    if (buildMode) {
      clearKeys();
      canvas.blur();
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    }

    return () => {
      clearKeys();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockChange);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, [gl, buildMode]);

  useFrame((_, delta) => {
    const astronaut = player.current;

    if (!astronaut || buildMode) return;
    if (document.pointerLockElement !== gl.domElement && document.activeElement !== gl.domElement) {
      keys.current = {};
      return;
    }

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

type WorldProps = {
  buildMode: boolean;
  selectedBuilding: StructureId;
  onPlaceBuilding: (type: StructureId, x: number, z: number, rotation: number) => void;
};

function World({
  buildMode,
  selectedBuilding,
  onPlaceBuilding,
}: WorldProps) {
  // Narrow selectors: only re-render when structures or materials change!
  const structures = useColonyStore((s) => s.structures);
  const materials = useColonyStore((s) => s.resources.materials);

  return (
    <>
      <color attach="background" args={["#080d20"]} />
      <fog attach="fog" args={["#986b60", 90, 240]} />

      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#b7d2ff", "#79544d", 1.5]} />
      <directionalLight
        position={[-20, 35, 15]}
        color="#ffe2c2"
        intensity={3}
        castShadow
      />

      <pointLight position={[0, 5, -8]} color="#55bfff" intensity={30} distance={45} />
      <Stars radius={180} depth={100} count={7000} factor={3} saturation={0.2} fade speed={0.15} />

      <Terrain />

      <Habitat position={[-5, 0, -5]} label="HAB-01" />
      <Habitat position={[-11, 0, -8]} label="HAB-02" />

      <SolarFarm position={[3, 0, -10]} />
      <CommunicationsTower />
      <Rocks />
      <FollowCamera buildMode={buildMode} />

      <BuildMode
        active={buildMode}
        selected={selectedBuilding}
        structures={structures}
        materials={materials}
        onPlace={onPlaceBuilding}
      />
    </>
  );
}

export default function App() {
  // Authoritative Colony Store
  const sol = useColonyStore((s) => s.sol);
  const resources = useColonyStore((s) => s.resources);
  const structures = useColonyStore((s) => s.structures);
  const alerts = useColonyStore((s) => s.alerts);
  const alertHistory = useColonyStore((s) => s.alertHistory);
  const missionStatus = useColonyStore((s) => s.missionStatus);
  const simulationStatus = useColonyStore((s) => s.simulationStatus);
  const speed = useColonyStore((s) => s.speed);
  const failureReason = useColonyStore((s) => s.failureReason);

  const placeStructure = useColonyStore((s) => s.placeStructure);
  const tick = useColonyStore((s) => s.tick);
  const setSpeed = useColonyStore((s) => s.setSpeed);
  const setPaused = useColonyStore((s) => s.setPaused);
  const togglePaused = useColonyStore((s) => s.togglePaused);
  const skipSol = useColonyStore((s) => s.skipSol);
  const resetMission = useColonyStore((s) => s.resetMission);
  const markBuildModeOpened = useColonyStore((s) => s.markBuildModeOpened);

  // Local UI State
  const [buildMode, setBuildMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<StructureId>("solar_farm");
  const [showHelp, setShowHelp] = useState(false);
  const [objectiveIdleSeconds, setObjectiveIdleSeconds] = useState(0);

  // Simulation tick loop (clamped, fixed 1s accumulator inside simulateTick)
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (
        !document.hidden &&
        simulationStatus === "running" &&
        missionStatus === "playing"
      ) {
        const effectiveDt = rawDt * speed;
        tick(effectiveDt);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulationStatus, missionStatus, speed, tick]);

  // Dev Tool: Press 'K' to skip 1 SOL, 'H' for Help
  useEffect(() => {
    const onDevKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyK") {
        skipSol();
      }
      if (e.code === "KeyH") {
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onDevKeyDown);
    return () => window.removeEventListener("keydown", onDevKeyDown);
  }, [skipSol]);

  const rates = useMemo(() => calculateNetRates(structures), [structures]);

  // Active Objective calculation
  const storeState = useColonyStore.getState();
  const rawObjectiveIndex = MISSION_OBJECTIVES.findIndex((obj) => !obj.isCompleted(storeState));
  const currentObjectiveIndex = rawObjectiveIndex === -1 ? MISSION_OBJECTIVES.length - 1 : rawObjectiveIndex;

  // Track 20s idle time for the active objective
  const prevObjectiveIndexRef = useRef(currentObjectiveIndex);
  useEffect(() => {
    if (prevObjectiveIndexRef.current !== currentObjectiveIndex) {
      prevObjectiveIndexRef.current = currentObjectiveIndex;
      setObjectiveIdleSeconds(0);
    }

    const interval = setInterval(() => {
      if (simulationStatus === "running" && missionStatus === "playing") {
        setObjectiveIdleSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentObjectiveIndex, simulationStatus, missionStatus]);

  const placeBuilding = useCallback(
    (type: StructureId, x: number, z: number, rotation: number) => {
      placeStructure(type, x, z, rotation);
    },
    [placeStructure],
  );

  const toggleBuildMode = () => {
    setBuildMode((prev) => {
      const next = !prev;
      if (next) {
        markBuildModeOpened();
      }
      return next;
    });
  };

  const selectedDef = STRUCTURE_CATALOGUE[selectedBuilding];
  const buildCatalogue = Object.values(STRUCTURE_CATALOGUE).filter(
    (s) => s.visibleInMenu,
  );

  const resourcePercent = (value: number, max = 500) =>
    Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <main className="game">
      <Canvas
        tabIndex={0}
        style={{ outline: "none" }}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 12], fov: 65, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <World
          buildMode={buildMode}
          selectedBuilding={selectedBuilding}
          onPlaceBuilding={placeBuilding}
        />
      </Canvas>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>OUTPOST ZERO</strong>
            <small>NASA JUNIOR ASTRONAUT MISSION TRAINER</small>
          </div>
        </div>

        <div className="mission">
          <span className="live-dot" />
          MARS 2049 <span className="muted">/</span> SOL{" "}
          {String(sol).padStart(2, "0")} OF 05
          <span className="muted" style={{ marginLeft: "8px" }}>
            ({simulationStatus === "paused" ? "PAUSED" : `${speed}× SPEED`})
          </span>
        </div>

        <div className="topbar-controls">
          <button
            type="button"
            className="help-btn"
            onClick={() => setShowHelp(true)}
          >
            ? CONTROLS
          </button>
          <div className="coordinates">
            <span>18.4° N</span>
            <small>ARCADIA PLANITIA</small>
          </div>
        </div>
      </header>

      {/* Structured Alerts Banner */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <strong>{alert.severity}: {alert.system}</strong>
              <p>{alert.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Left Panel: Mission Objectives & Live Resource Telemetry */}
      <aside className="left-panel">
        <small className="eyebrow">MISSION OBJECTIVES</small>
        <h2>
          {missionStatus === "victory"
            ? "Mission accomplished."
            : missionStatus === "failed"
              ? "Mission compromised."
              : buildMode
                ? "Expand the outpost."
                : "Establish the outpost."}
        </h2>

        <p>
          {missionStatus === "victory"
            ? "Your colony survived through Sol 5."
            : missionStatus === "failed"
              ? "A critical life-support deficit compromised the mission."
              : "Follow mission protocols. Establish self-sufficient Mars life support."}
        </p>

        {MISSION_OBJECTIVES.map((obj, i) => {
          const isDone = obj.isCompleted(storeState);
          const isCurrent = i === currentObjectiveIndex;

          return (
            <div key={obj.id} className="objective objective-item">
              <span className="objective-number">{obj.stepNumber}</span>
              <div>
                <strong>{obj.title}</strong>
                <small style={{ color: isDone ? "#79e7ae" : isCurrent ? "#65eaff" : "#6c8299" }}>
                  {isDone ? "COMPLETE" : isCurrent ? "IN PROGRESS" : "STANDBY"}
                </small>
                <span className="objective-why">{obj.whyThisMatters}</span>
                {isCurrent && !isDone && objectiveIdleSeconds >= 20 && (
                  <span className="objective-hint">Tip: {obj.hint}</span>
                )}
              </div>
            </div>
          );
        })}

        <div className="panel-divider" />

        <small className="eyebrow">COLONY RESOURCES</small>
        <Resource
          label="POWER"
          value={`${Math.round(resources.energy)} kW`}
          delta={`${rates.netEnergyPerSol >= 0 ? "+" : ""}${Math.round(rates.netEnergyPerSol)} kW/SOL`}
          deltaClass={rates.netEnergyPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.energy, 300)}
          color="#65eaff"
        />
        <Resource
          label="OXYGEN"
          value={`${Math.round(resources.oxygen)} kg`}
          delta={`${rates.netOxygenPerSol >= 0 ? "+" : ""}${Math.round(rates.netOxygenPerSol)} kg/SOL`}
          deltaClass={rates.netOxygenPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.oxygen, 500)}
          color="#a8a0ff"
        />
        <Resource
          label="FOOD"
          value={`${Math.round(resources.food)} rations`}
          delta={`${rates.netFoodPerSol >= 0 ? "+" : ""}${Math.round(rates.netFoodPerSol)} /SOL`}
          deltaClass={rates.netFoodPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.food, 500)}
          color="#79e7ae"
        />
        <Resource
          label="MATERIALS"
          value={`${Math.round(resources.materials)} MAT`}
          delta="STOCK"
          deltaClass="neutral"
          percent={resourcePercent(resources.materials, 800)}
          color="#f1b778"
        />

        <span className="simulation-note">
          * Gameplay simulation abstraction for Junior Astronaut Mission Trainer.
        </span>
      </aside>

      {/* Right Panel: Network & Construction */}
      <aside className="right-panel">
        <div className="status-heading">
          <span className="live-dot" />
          OUTPOST SYSTEMS
        </div>

        <div className="system">
          <span className="system-icon">⌁</span>
          <div>
            <strong>Life Support (O2)</strong>
            <small>
              {structures.some((s) => s.structureId === "oxygen_generator" && s.active)
                ? "MOXIE ONLINE (+40/SOL)"
                : "OFFLINE (CREW DEMAND −32)"}
            </small>
          </div>
          <i
            className={
              structures.some((s) => s.structureId === "oxygen_generator" && s.active)
                ? "status-good"
                : "status-warning"
            }
          />
        </div>

        <div className="system">
          <span className="system-icon">ϟ</span>
          <div>
            <strong>Power Grid</strong>
            <small>
              {rates.netEnergyPerSol >= 0
                ? `NET POSITIVE (+${Math.round(rates.netEnergyPerSol)} kW)`
                : `DEFICIT (${Math.round(rates.netEnergyPerSol)} kW/SOL)`}
            </small>
          </div>
          <i
            className={rates.netEnergyPerSol >= 0 ? "status-good" : "status-warning"}
          />
        </div>

        <div className="system">
          <span className="system-icon">⌂</span>
          <div>
            <strong>Habitat Capacity</strong>
            <small>{rates.habitatCapacity} / 4 CREW SHELTERED</small>
          </div>
          <i
            className={rates.habitatCapacity >= 4 ? "status-good" : "status-warning"}
          />
        </div>

        <div className="credits">
          <small>AVAILABLE MATERIALS</small>
          <strong>
            <span>◈</span> {resources.materials} <small>MAT</small>
          </strong>
        </div>

        <div className="panel-divider" />

        <small className="eyebrow">CONSTRUCTION</small>
        <label htmlFor="building-select">SELECT STRUCTURE</label>
        <select
          id="building-select"
          value={selectedBuilding}
          onChange={(event) =>
            setSelectedBuilding(event.target.value as StructureId)
          }
          disabled={missionStatus !== "playing"}
        >
          {buildCatalogue.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name} — {building.buildCost.materials} MAT
            </option>
          ))}
        </select>

        {selectedDef && (
          <>
            <p>{selectedDef.description}</p>
            <small style={{ color: "#79e7ae", display: "block", marginBottom: "8px" }}>
              Effects:{" "}
              {Object.entries(selectedDef.effects)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            </small>
          </>
        )}

        <button
          type="button"
          onClick={toggleBuildMode}
          disabled={missionStatus !== "playing"}
        >
          {buildMode ? "EXIT BUILD MODE" : "ENTER BUILD MODE"}
        </button>

        <div className="sim-controls">
          <button
            type="button"
            className={simulationStatus === "paused" ? "active" : ""}
            onClick={togglePaused}
          >
            {simulationStatus === "paused" ? "▶ RESUME" : "❚❚ PAUSE"}
          </button>
          <button
            type="button"
            className={speed === 1 && simulationStatus === "running" ? "active" : ""}
            onClick={() => {
              setSpeed(1);
              setPaused(false);
            }}
          >
            1×
          </button>
          <button
            type="button"
            className={speed === 3 && simulationStatus === "running" ? "active" : ""}
            onClick={() => {
              setSpeed(3);
              setPaused(false);
            }}
          >
            3×
          </button>
        </div>

        {buildMode && (
          <small style={{ marginTop: "10px" }}>
            CLICK GROUND TO PLACE · R TO ROTATE · ESC TO CANCEL
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

      <footer className="bottom-bar">
        <div className="controls">
          <span>
            <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> / <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> MOVE
          </span>
          <span><kbd>SPACE</kbd> JUMP</span>
          <span><kbd>E</kbd> JETPACK / FLY</span>
          <span><kbd>SHIFT</kbd> SPRINT</span>
          <span><kbd>MOUSE</kbd> LOOK AROUND</span>
          <span><kbd>ESC</kbd> RELEASE MOUSE</span>
          <span><kbd>K</kbd> SKIP SOL (DEV)</span>
        </div>
        <div className="build-label">
          OUTPOST ZERO <span>·</span> RELEASE CANDIDATE 1.0
        </div>
      </footer>

      {/* End-Game Debrief Modal (Victory / Defeat) */}
      {missionStatus !== "playing" && (
        <div className="mission-modal-overlay">
          <div className={`mission-modal ${missionStatus}`}>
            <h2>
              {missionStatus === "victory"
                ? "MISSION ACCOMPLISHED"
                : "MISSION COMPROMISED"}
            </h2>
            <p>
              {missionStatus === "victory"
                ? "Junior Astronaut Certification Achieved! You sustained all essential life support, power, and communications through 5 Martian Sols."
                : failureReason || "The colony sustained critical resource depletion."}
            </p>

            <div className="modal-details">
              <strong>MISSION TELEMETRY SUMMARY</strong>
              <ul>
                <li>Sols Survived: {sol} of 05</li>
                <li>Final Oxygen: {Math.round(resources.oxygen)} kg</li>
                <li>Final Power: {Math.round(resources.energy)} kW</li>
                <li>Final Food: {Math.round(resources.food)} rations</li>
                <li>Remaining Materials: {Math.round(resources.materials)} MAT</li>
                <li>Total Structures Built: {structures.length}</li>
              </ul>
              {alertHistory.length > 0 && (
                <>
                  <strong style={{ display: "block", marginTop: "10px" }}>
                    MISSION INCIDENT LOG
                  </strong>
                  <ul>
                    {alertHistory.map((h) => (
                      <li key={h.id}>
                        [{h.severity.toUpperCase()}] {h.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  resetMission();
                  setBuildMode(false);
                }}
              >
                RETRY MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Help Modal */}
      {showHelp && (
        <div className="mission-modal-overlay" onClick={() => setShowHelp(false)}>
          <div
            className="mission-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <h2>ASTRONAUT FIELD MANUAL</h2>
            <p>
              Junior Astronaut Mission Trainer keyboard & mouse reference.
            </p>

            <table className="controls-table">
              <tbody>
                <tr>
                  <td>W / A / S / D or ARROWS</td>
                  <td>Surface traversal & exploration</td>
                </tr>
                <tr>
                  <td>SHIFT</td>
                  <td>Sprint booster</td>
                </tr>
                <tr>
                  <td>SPACE</td>
                  <td>EVA suit thruster jump</td>
                </tr>
                <tr>
                  <td>E (Hold)</td>
                  <td>Continuous flight / aerial survey</td>
                </tr>
                <tr>
                  <td>MOUSE (Left Click)</td>
                  <td>Engage camera look / Place structure in build mode</td>
                </tr>
                <tr>
                  <td>R</td>
                  <td>Rotate structure 90° during placement</td>
                </tr>
                <tr>
                  <td>ESC</td>
                  <td>Release mouse look / Cancel placement</td>
                </tr>
                <tr>
                  <td>K</td>
                  <td>Skip 1 Sol (Trainer Dev Tool)</td>
                </tr>
              </tbody>
            </table>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowHelp(false)}
              >
                RESUME MISSION
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Resource({
  label,
  value,
  delta,
  deltaClass,
  percent,
  color,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaClass?: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="resource">
      <div className="resource-label">
        <span>{label}</span>
        <div>
          <strong>{value}</strong>
          {delta && (
            <span className={`resource-delta ${deltaClass ?? "neutral"}`}>
              {delta}
            </span>
          )}
        </div>
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
