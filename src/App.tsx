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
import { WORLD_BOUND, useColonyStore } from "./game/useColonyStore";
import { MISSION_OBJECTIVES } from "./game/missionObjectives";
import { accumulateFixedSteps } from "./game/fixedStep";
import { landFlight, stepFlightAltitude, toggleFlight } from "./game/flightControls";
import { MissionBriefing, MissionIntro, MissionTutorial } from "./game/MissionIntro";

const MAX_FLIGHT_ALTITUDE = 120;
const INTRO_SEEN_KEY = "outpost-zero-intro-seen";
const TUTORIAL_COMPLETE_KEY = "outpost-zero-tutorial-complete";

function readSessionFlag(key: string) {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string) {
  try {
    window.localStorage.setItem(key, "true");
  } catch {
    // The launch sequence still works when browser storage is unavailable.
  }
}

function SceneFallback({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);

  return (
    <div className="scene-loader scene-error" role="alert">
      3D rendering is unavailable in this browser.
    </div>
  );
}

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

function Rocks() {
  const rocks = Array.from({ length: 180 }, (_, i) => {
    const angle = i * 2.399;
    const radius = i < 90
      ? 12 + (i % 9) * 2.4
      : 55 + ((i - 90) % 10) * 20;

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
        <planeGeometry args={[6000, 6000, 100, 100]} />
        <meshStandardMaterial color="#986b60" roughness={1} />
      </mesh>

      {Array.from({ length: 15 }, (_, i) => {
        const angle = i * 2.399;
        const radius = 110 + (i % 4) * 28;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              2 + (i % 4) * 1.4,
              Math.sin(angle) * radius,
            ]}
            scale={[8 + (i % 3) * 4, 5 + (i % 4) * 2, 6]}
            rotation={[0, angle, 0]}
          >
            <dodecahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color="#704c50" roughness={1} flatShading />
          </mesh>
        );
      })}

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

function FollowCamera({
  buildMode,
  controlsEnabled,
  onOpenHelp,
}: {
  buildMode: boolean;
  controlsEnabled: boolean;
  onOpenHelp: () => void;
}) {
  const { camera, gl } = useThree();
  const player = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(0.12);
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const flightMode = useRef(false);
  const programmaticUnlock = useRef(false);

  // The player is moved imperatively in useFrame. Do not put a changing
  // position prop on its JSX node; parent renders would reset movement.
  useEffect(() => {
    player.current?.position.set(0, 0, 4);
  }, []);

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

    const landSafely = () => {
      const landed = landFlight();
      flightMode.current = landed.enabled;
      verticalVelocity.current = 0;
      isGrounded.current = true;
      if (player.current) player.current.position.y = landed.altitude;
    };

    const releasePointerLock = () => {
      if (document.pointerLockElement === canvas) {
        programmaticUnlock.current = true;
        document.exitPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      clearKeys();
      if (document.pointerLockElement !== canvas) {
        const browserReleasedCapture = !programmaticUnlock.current;
        programmaticUnlock.current = false;
        landSafely();
        canvas.blur();
        if (
          browserReleasedCapture &&
          controlsEnabled &&
          !buildMode &&
          !document.hidden &&
          document.hasFocus()
        ) {
          onOpenHelp();
        }
      } else {
        programmaticUnlock.current = false;
      }
    };

    const handlePointerLockError = () => {
      programmaticUnlock.current = false;
      clearKeys();
      landSafely();
    };

    const handleBlur = () => {
      clearKeys();
      landSafely();
      canvas.blur();
      releasePointerLock();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearKeys();
        landSafely();
        canvas.blur();
        releasePointerLock();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (buildMode || !controlsEnabled) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) return;

      if (event.code === "Escape") {
        clearKeys();
        landSafely();
        canvas.blur();
        releasePointerLock();
        return;
      }

      if (!controlledKeys.includes(event.code)) return;

      event.preventDefault();

      // A ground jump consumes one physical press. Ignore OS key-repeat events
      // so holding Space cannot re-arm another jump after touching down. In
      // flight, the initial keydown remains held until keyup for continuous ascent.
      if (event.code === "Space" && event.repeat) return;

      if (event.code === "KeyE" && !event.repeat && !keys.current.KeyE) {
        const next = toggleFlight({
          enabled: flightMode.current,
          altitude: player.current?.position.y ?? 0,
        });

        flightMode.current = next.enabled;

        if (player.current) {
          player.current.position.y = next.altitude;
        }

        verticalVelocity.current = 0;
        isGrounded.current = !next.enabled;
      }

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
    document.addEventListener("pointerlockerror", handlePointerLockError);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onCanvasClick);

    if (buildMode || !controlsEnabled) {
      clearKeys();
      landSafely();
      canvas.blur();
      releasePointerLock();
    }

    return () => {
      clearKeys();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, [gl, buildMode, controlsEnabled, onOpenHelp]);

  useFrame((_, delta) => {
    const astronaut = player.current;

    if (!astronaut || buildMode || !controlsEnabled) return;
   

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

      const speed = sprinting && !flightMode.current ? 9 : 5;

      astronaut.position.addScaledVector(
        movement,
        speed * dt,
      );

      astronaut.rotation.y = Math.atan2(
        -movement.x,
        -movement.z,
      );
    }

    if (flightMode.current) {
      isGrounded.current = false;
      verticalVelocity.current = 0;
      astronaut.position.y = stepFlightAltitude(
        astronaut.position.y,
        keys.current.Space,
        keys.current.ShiftLeft || keys.current.ShiftRight,
        dt,
        MAX_FLIGHT_ALTITUDE,
      );
    } else {
      // Space jumps once while grounded outside flight mode.
      if (keys.current.Space && isGrounded.current) {
        verticalVelocity.current = 7;
        isGrounded.current = false;
        keys.current.Space = false;
      }

      // Gravity applies only outside flight mode.
      verticalVelocity.current = Math.max(
        verticalVelocity.current - 18 * dt,
        -8,
      );
    }

      astronaut.position.y += verticalVelocity.current * dt;

    if (astronaut.position.y > MAX_FLIGHT_ALTITUDE) {
      astronaut.position.y = MAX_FLIGHT_ALTITUDE;
      verticalVelocity.current = 0;
    }

    // Ground collision
    if (astronaut.position.y <= 0) {
      astronaut.position.y = 0;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    // World boundaries
    astronaut.position.x = THREE.MathUtils.clamp(
      astronaut.position.x,
      -WORLD_BOUND,
      WORLD_BOUND,
    );

    astronaut.position.z = THREE.MathUtils.clamp(
      astronaut.position.z,
      -WORLD_BOUND,
      WORLD_BOUND,
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
    <group ref={player} name="astronaut">
      <Astronaut />
    </group>
  );
}

type WorldProps = {
  buildMode: boolean;
  controlsEnabled: boolean;
  onOpenHelp: () => void;
  selectedBuilding: StructureId;
  onPlaceBuilding: (type: StructureId, x: number, z: number, rotation: number) => void;
};

function World({
  buildMode,
  controlsEnabled,
  onOpenHelp,
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

      <Rocks />
      <FollowCamera buildMode={buildMode} controlsEnabled={controlsEnabled} onOpenHelp={onOpenHelp} />

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
  const openHelp = useCallback(() => setShowHelp(true), []);
  const [missionStage, setMissionStage] = useState<"briefing" | "intro" | "tutorial" | "game">(() => {
    if (typeof window === "undefined") return "intro";
    return "briefing";
  });
  const [showDevControls, setShowDevControls] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [objectiveIdleSeconds, setObjectiveIdleSeconds] = useState(0);
  const [placementFeedback, setPlacementFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const placementTimeout = useRef<number | null>(null);
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const simulationAccumulator = useRef(0);

  // Fixed one-second simulation steps, independent of render frame rate.
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (
        !document.hidden &&
        simulationStatus === "running" &&
        missionStatus === "playing" &&
        missionStage === "game" &&
        !showHelp &&
        !buildMode
      ) {
        const fixedSteps = accumulateFixedSteps(simulationAccumulator.current, rawDt, speed);
        simulationAccumulator.current = fixedSteps.remainder;
        for (let i = 0; i < fixedSteps.steps; i += 1) {
          tick(1);
        }
      } else if (missionStatus !== "playing") {
        simulationAccumulator.current = 0;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulationStatus, missionStatus, speed, tick, showHelp, buildMode, missionStage]);

  // Hidden development tools are only exposed after pressing K.
  useEffect(() => {
    const onDevKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) return;

      if (e.code === "Escape" && !buildMode && missionStatus === "playing") {
        setShowHelp((visible) => !visible);
      } else if (e.code === "KeyK") {
        setShowDevControls((visible) => !visible);
      } else if (e.code === "KeyH") {
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onDevKeyDown);
    return () => window.removeEventListener("keydown", onDevKeyDown);
  }, [skipSol, buildMode, missionStatus]);

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
      if (
        !document.hidden &&
        !showHelp &&
        !buildMode &&
        simulationStatus === "running" &&
        missionStatus === "playing"
      ) {
        setObjectiveIdleSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentObjectiveIndex, simulationStatus, missionStatus, showHelp, buildMode]);

  const placeBuilding = useCallback(
    (type: StructureId, x: number, z: number, rotation: number) => {
      const result = placeStructure(type, x, z, rotation);
      setPlacementFeedback({
        ok: result.ok,
        message: result.ok ? `${STRUCTURE_CATALOGUE[type].name} installed.` : result.reason ?? "Placement rejected.",
      });
      if (placementTimeout.current !== null) window.clearTimeout(placementTimeout.current);
      placementTimeout.current = window.setTimeout(() => setPlacementFeedback(null), 3500);
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
  const simulationPaused = simulationStatus === "paused" || showHelp || buildMode;
  const controlsEnabled = missionStatus === "playing" && simulationStatus === "running" && !showHelp && !buildMode;
  const buildCatalogue = Object.values(STRUCTURE_CATALOGUE).filter(
    (s) => s.visibleInMenu,
  );

  const resourcePercent = (value: number, max = 500) =>
    Math.max(0, Math.min(100, (value / max) * 100));

  const beginMission = () => {
    writeSessionFlag(INTRO_SEEN_KEY);
    writeSessionFlag(TUTORIAL_COMPLETE_KEY);
    setMissionStage("game");
    setShowHelp(false);
    setPaused(false);
  };

  const finishIntro = () => {
    writeSessionFlag(INTRO_SEEN_KEY);
    setMissionStage(readSessionFlag(TUTORIAL_COMPLETE_KEY) ? "game" : "tutorial");
  };

  if (missionStage === "briefing") {
    return <MissionBriefing onBegin={() => setMissionStage("intro")} />;
  }
  if (missionStage === "intro") {
    return <MissionIntro onComplete={finishIntro} />;
  }
  if (missionStage === "tutorial") {
    return <MissionTutorial
      onStartMission={beginMission}
      onSkipTutorial={beginMission}
      onReplayIntro={() => setMissionStage("intro")}
    />;
  }

  return (
    <main className="game">
      <Canvas
        tabIndex={0}
        style={{ outline: "none" }}
        onCreated={({ gl }) => {
          gl.domElement.tabIndex = 0;
          markSceneReady();
        }}
        fallback={<SceneFallback onReady={markSceneReady} />}
        shadows="percentage"
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 12], fov: 65, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <World
          buildMode={buildMode}
          controlsEnabled={controlsEnabled}
          onOpenHelp={openHelp}
          selectedBuilding={selectedBuilding}
          onPlaceBuilding={placeBuilding}
        />
      </Canvas>

      {!sceneReady && (
        <div className="scene-loader" role="status" aria-live="polite">
          <span className="scene-loader-mark" aria-hidden="true" />
          <strong>INITIALIZING SURFACE OPERATIONS</strong>
          <small>Preparing the Mars landing zone...</small>
        </div>
      )}

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
            ({simulationPaused ? "PAUSED" : `${speed}× SPEED`})
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

      {placementFeedback && (
        <div
          className={`placement-feedback ${placementFeedback.ok ? "success" : "error"}`}
          role="status"
          aria-live="polite"
        >
          {placementFeedback.message}
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
          delta={`${rates.energyProduction >= 0 ? "+" : ""}${Math.round(rates.energyProduction)} IN / -${Math.round(rates.energyDemand)} USE / NET ${rates.netEnergyPerSol >= 0 ? "+" : ""}${Math.round(rates.netEnergyPerSol)} /SOL`}
          deltaClass={rates.netEnergyPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.energy, 300)}
          color="#65eaff"
        />
        <Resource
          label="OXYGEN"
          value={`${Math.round(resources.oxygen)} kg`}
          delta={`+${Math.round(rates.oxygenProduction)} MAKE / -${rates.crewOxygenDemand} CREW / NET ${rates.netOxygenPerSol >= 0 ? "+" : ""}${Math.round(rates.netOxygenPerSol)} kg/SOL`}
          deltaClass={rates.netOxygenPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.oxygen, 500)}
          color="#a8a0ff"
        />
        <Resource
          label="FOOD"
          value={`${Math.round(resources.food)} rations`}
          delta={`+${Math.round(rates.foodProduction)} GROW / -${rates.crewFoodDemand} CREW / NET ${rates.netFoodPerSol >= 0 ? "+" : ""}${Math.round(rates.netFoodPerSol)} /SOL`}
          deltaClass={rates.netFoodPerSol >= 0 ? "positive" : "negative"}
          percent={resourcePercent(resources.food, 500)}
          color="#79e7ae"
        />
        <Resource
          label="MATERIALS"
          value={`${Math.round(resources.materials)} MAT`}
          delta="STOCK"
          deltaClass="neutral"
          percent={resourcePercent(resources.materials, 3000)}
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
          <span className="system-icon">04</span>
          <div>
            <strong>Crew Complement</strong>
            <small>4 JUNIOR ASTRONAUTS</small>
          </div>
          <i className="status-good" />
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
            className={simulationPaused ? "active" : ""}
            onClick={togglePaused}
          >
            {simulationPaused ? "▶ RESUME" : "❚❚ PAUSE"}
          </button>
          <button
            type="button"
            className={speed === 1 && !simulationPaused ? "active" : ""}
            onClick={() => {
              setSpeed(1);
              setPaused(false);
            }}
          >
            1×
          </button>
          <button
            type="button"
            className={speed === 3 && !simulationPaused ? "active" : ""}
            onClick={() => {
              setSpeed(3);
              setPaused(false);
            }}
          >
            3×
          </button>
        </div>

        {showDevControls && (
          <button type="button" onClick={skipSol} disabled={missionStatus !== "playing"}>
            DEV: SKIP ONE SOL
          </button>
        )}

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
          <span><kbd>SPACE</kbd> ASCEND / JUMP</span>
          
          <span><kbd>SHIFT</kbd> DESCEND / SPRINT</span>
          
          <span><kbd>ESC</kbd> RELEASE MOUSE / FIELD MANUAL</span>
          
          
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
        <MissionTutorial
          helpMode
          onStartMission={() => {
            setShowHelp(false);
            setPaused(false);
          }}
          onSkipTutorial={() => setShowHelp(false)}
          onReplayIntro={() => {
            setShowHelp(false);
            setMissionStage("intro");
            setBuildMode(false);
            setPaused(true);
          }}
        />
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
