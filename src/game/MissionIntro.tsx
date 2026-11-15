import { useEffect, useRef, useState } from "react";

const CINEMATIC_URL = `${import.meta.env.BASE_URL}cinematics/outpost-zero-earth-to-mars.mp4`;

export function MissionIntro({ onComplete }: { onComplete: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const finishTimer = useRef<number | null>(null);
  const finishStarted = useRef(false);
  const playStarted = useRef(false);
  const [assetReady, setAssetReady] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => () => {
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
  }, []);

  const startPlayback = () => {
    const player = video.current;
    if (!player || finishing || playStarted.current) return;
    playStarted.current = true;
    void player.play().then(() => {
      setAssetReady(true);
      setAssetFailed(false);
    }).catch(() => setAssetFailed(true));
  };

  const finishIntro = () => {
    if (finishStarted.current) return;
    finishStarted.current = true;
    setFinishing(true);
    finishTimer.current = window.setTimeout(onComplete, 520);
  };

  return <section className={`mission-intro${finishing ? " finishing" : ""}`} aria-label="Earth to Mars mission introduction">
    <video
      ref={video}
      className={`intro-video${assetReady ? " ready" : ""}`}
      src={CINEMATIC_URL}
      autoPlay
      muted
      playsInline
      preload="auto"
      onCanPlay={startPlayback}
      onLoadedData={startPlayback}
      onError={() => setAssetFailed(true)}
      onEnded={finishIntro}
      onTimeUpdate={(event) => {
        const player = event.currentTarget;
        if (Number.isFinite(player.duration) && player.duration > 0) {
          setProgress(player.currentTime / player.duration * 100);
        }
      }}
    />
    {!assetReady && <div className={`intro-asset-screen ${assetFailed ? "failed" : "loading"}`}>
      <div className="intro-asset-orbit" aria-hidden="true"><span /><i /></div>
      <span className="eyebrow">ASTRAX SPACE PROGRAM · MARS 01</span>
      <h1>{assetFailed ? "CINEMATIC ASSET UNAVAILABLE" : "PREPARING MISSION FILM"}</h1>
      <p>{assetFailed
        ? "The Earth-to-Mars master film could not be loaded or played. Skip this introduction to continue to your field briefing."
        : "Preparing your Earth-to-Mars cinematic. Playback will begin automatically."}
      </p>
      {assetFailed && <><code>public/cinematics/outpost-zero-earth-to-mars.mp4</code>
      <small>No substitute footage is shown. Skip the introduction to continue.</small></>}
    </div>}
    <header className="intro-brand"><span>ASTRAX SPACE PROGRAM</span><b>OUTPOST <em>ZERO</em></b><small>HUMAN MISSION · MARS 01</small></header>
    <div className="intro-playback-status" aria-live="polite">
      {assetReady ? "MISSION FILM · EARTH TO MARS" : assetFailed ? "MISSION FILM UNAVAILABLE" : "CHECKING CINEMATIC ASSET"}
    </div>
    <button className="intro-skip" type="button" onClick={finishIntro} disabled={finishing}>SKIP INTRO <span>→</span></button>
    <div className="intro-progress"><i style={{ width: `${progress}%` }} /></div>
  </section>;
}

type TutorialStep = {
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  note: string;
  visual: "mars" | "move" | "flight" | "build" | "survival" | "objectives" | "pause";
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    label: "ARRIVAL",
    title: "WELCOME TO MARS",
    eyebrow: "MISSION BRIEF · ELYSIUM PLANITIA",
    description: "You have arrived at Outpost Zero. Establish a sustainable colony, protect the four-person crew, and keep the settlement operational through SOL 6.",
    note: "Your outpost begins without shelter or life-support structures. Build the systems the crew depends on.",
    visual: "mars",
  },
  {
    label: "MOVEMENT",
    title: "MOVE THROUGH THE OUTPOST",
    eyebrow: "EVA FIELD GUIDE · 01",
    description: "Use WASD to walk and the mouse to look around. Arrow keys also move. Click the Mars scene to capture the mouse for camera look.",
    note: "Outside Build Mode, ESC pauses, releases the camera, and opens this manual. In Build Mode, ESC cancels the placement preview. Click the scene to recapture the mouse.",
    visual: "move",
  },
  {
    label: "FLIGHT",
    title: "TAKE FLIGHT",
    eyebrow: "EVA FIELD GUIDE · 02",
    description: "Press E once to enter flight mode. Space ascends; Shift descends. Releasing either key holds your altitude. Press E again to land safely.",
    note: "On foot, Space jumps and Shift sprints. ESC, pointer-lock loss, Build Mode, or switching tabs clears held keys and lands you safely.",
    visual: "flight",
  },
  {
    label: "CONSTRUCTION",
    title: "BUILD THE SYSTEMS YOU NEED",
    eyebrow: "COLONY OPERATIONS · 01",
    description: "Choose ENTER BUILD MODE, select a structure, and review its material cost in the panel. Click suitable open ground to place it; press R to rotate the preview.",
    note: "Invalid or overlapping sites are rejected. Materials are charged only when a structure is successfully placed.",
    visual: "build",
  },
  {
    label: "SURVIVAL",
    title: "KEEP THE CREW SUPPLIED",
    eyebrow: "COLONY OPERATIONS · 02",
    description: "Starting stores: 3,000 MAT, 100 energy, 200 oxygen, and 150 food. Four crew consume 32 oxygen and 24 food each SOL.",
    note: "Solar Farms generate 40 energy/SOL. MOXIE makes 40 oxygen for 25 energy/SOL; a greenhouse makes 30 food for 15 energy/SOL. HAB-01 shelters four and uses 10 energy/SOL.",
    visual: "survival",
  },
  {
    label: "OBJECTIVES",
    title: "COMPLETE THE MISSION",
    eyebrow: "MISSION CONTROL · SOL 01—06",
    description: "Follow the eight guided objectives: open construction, build power and shelter, produce oxygen and food, balance the grid, establish communications, and sustain the outpost.",
    note: "Reach SOL 6 with crew shelter, an active Communications Tower, and every resource above zero. Set mission time to 1× or 3× from the HUD.",
    visual: "objectives",
  },
  {
    label: "PAUSE & HELP",
    title: "YOU CAN REVIEW THE FIELD MANUAL",
    eyebrow: "MISSION CONTROL · ALWAYS AVAILABLE",
    description: "Press ESC during play to pause and open this guide. Press H or choose CONTROLS in the HUD to reopen the field manual at any time.",
    note: "The game simulation pauses while this guide is open. Use REPLAY INTRO here to watch the Earth-to-Mars film again.",
    visual: "pause",
  },
];

function TutorialVisual({ visual }: { visual: TutorialStep["visual"] }) {
  if (visual === "move") {
    return <div className="tutorial-visual movement-visual" aria-label="WASD movement and mouse look diagram">
      <div className="wasd-diagram"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
      <div className="mouse-diagram"><span /><i /><b>MOUSE LOOK</b></div>
      <small>FIELD MOBILITY · DIRECTIONAL CONTROL</small>
    </div>;
  }
  if (visual === "flight") {
    return <div className="tutorial-visual flight-visual" aria-label="Flight toggle, ascend, and descend controls">
      <div className="flight-orbit"><i className="flight-dot" /><span>E</span></div>
      <div className="flight-controls"><kbd>E</kbd><b>TOGGLE FLIGHT</b><kbd>SPACE</kbd><b>ASCEND</b><kbd>SHIFT</kbd><b>DESCEND</b></div>
      <small>THRUSTER VECTOR · 120 M ALTITUDE LIMIT</small>
    </div>;
  }
  if (visual === "build") {
    return <div className="tutorial-visual build-visual" aria-label="Colony structure layout and placement controls">
      <div className="build-grid-lines" />
      <span className="module module-hab">HAB-01</span><span className="module module-solar">SOLAR</span><span className="module module-moxie">MOXIE</span>
      <div className="build-link build-link-one" /><div className="build-link build-link-two" />
      <div className="placement-reticle">+</div><small>VALID SITE · OPEN GROUND</small>
    </div>;
  }
  if (visual === "survival") {
    return <div className="tutorial-visual survival-visual" aria-label="Starting colony resource stores and operating rates">
      <div><span>O₂</span><i><b style={{ width: "40%" }} /></i><strong>200</strong><small>32 used / SOL</small></div>
      <div><span>POWER</span><i><b style={{ width: "34%" }} /></i><strong>100</strong><small>Solar +40 / SOL</small></div>
      <div><span>FOOD</span><i><b style={{ width: "30%" }} /></i><strong>150</strong><small>24 used / SOL</small></div>
      <div><span>MAT</span><i><b style={{ width: "100%" }} /></i><strong>3,000</strong><small>Build reserve</small></div>
    </div>;
  }
  if (visual === "objectives") {
    return <div className="tutorial-visual objectives-visual" aria-label="Mission objective timeline">
      {TUTORIAL_STEPS.slice(1, 6).map((step, index) => <div key={step.label} className={index < 3 ? "objective-node done" : "objective-node"}><i>{String(index + 1).padStart(2, "0")}</i><span>{step.label}</span></div>)}
      <strong>SOL 06 <span>·</span> CREW SUSTAINED</strong>
    </div>;
  }
  if (visual === "pause") {
    return <div className="tutorial-visual pause-visual" aria-label="Pause and help keyboard controls">
      <kbd>ESC</kbd><span>PAUSE / FIELD MANUAL</span>
      <div><b>H</b><small>REOPEN GUIDE</small><b>REPLAY</b><small>WATCH ARRIVAL FILM</small></div>
    </div>;
  }
  return <div className="tutorial-visual mars-visual" aria-label="Mars outpost arrival illustration">
    <div className="tutorial-mars"><i /><span /></div>
    <div className="tutorial-horizon"><span /><i /><b /></div>
    <small>ARCADIA EXPEDITION ZONE · SOL 01</small>
  </div>;
}

export function MissionTutorial({
  onStartMission,
  onSkipTutorial,
  onReplayIntro,
  helpMode = false,
}: {
  onStartMission: () => void;
  onSkipTutorial: () => void;
  onReplayIntro: () => void;
  helpMode?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const back = () => setCurrentStep((current) => Math.max(0, current - 1));
  const next = () => setCurrentStep((current) => Math.min(TUTORIAL_STEPS.length - 1, current + 1));

  return <section className="mission-tutorial" aria-label="Outpost Zero interactive field briefing">
    <header className="tutorial-header">
      <div className="tutorial-brand"><span className="tutorial-brand-mark">O</span><div><b>OUTPOST ZERO</b><small>ARRIVAL FIELD BRIEFING</small></div></div>
      <div className="tutorial-status"><span className="tutorial-live-dot" /> MARS SURFACE LINK <i /> {String(currentStep + 1).padStart(2, "0")} / {String(TUTORIAL_STEPS.length).padStart(2, "0")}</div>
      <div className="tutorial-header-actions">
        {helpMode && <button type="button" onClick={onReplayIntro}>↺ REPLAY INTRO</button>}
        <button type="button" className="tutorial-skip" onClick={onSkipTutorial}>{helpMode ? "CLOSE FIELD MANUAL" : "SKIP TUTORIAL"} <span>→</span></button>
      </div>
    </header>

    <div className="tutorial-progress-track" role="progressbar" aria-label="Tutorial progress" aria-valuemin={1} aria-valuemax={TUTORIAL_STEPS.length} aria-valuenow={currentStep + 1}><i style={{ width: `${progress}%` }} /></div>

    <div className="tutorial-layout">
      <nav className="tutorial-rail" aria-label="Tutorial sections">
        <div className="tutorial-rail-heading"><span>FIELD GUIDE</span><small>MISSION 01 · MARS</small></div>
        <ol>
          {TUTORIAL_STEPS.map((item, index) => <li key={item.label} className={index === currentStep ? "active" : index < currentStep ? "visited" : ""}>
            <button type="button" onClick={() => setCurrentStep(index)} aria-current={index === currentStep ? "step" : undefined}>
              <span className="tutorial-step-index">{String(index + 1).padStart(2, "0")}</span><span>{item.label}</span><i />
            </button>
          </li>)}
        </ol>
        <div className="tutorial-rail-footer"><span>CREW STATUS</span><b>4 ASTRONAUTS · READY</b><small>ELYSiUM PLANITIA / 18.4° N</small></div>
      </nav>

      <article className="tutorial-main" key={step.label} aria-labelledby="tutorial-step-title" aria-live="polite">
        <div className="tutorial-copy">
          <span className="tutorial-eyebrow"><i /> {step.eyebrow}</span>
          <h1 id="tutorial-step-title">{step.title}</h1>
          <p className="tutorial-description">{step.description}</p>
          <div className="tutorial-note"><span>MISSION CONTROL</span><p>{step.note}</p></div>
        </div>
        <TutorialVisual visual={step.visual} />
      </article>
    </div>

    <footer className="tutorial-footer">
      <div className="tutorial-footer-progress"><span>BRIEFING PROGRESS</span><div><i style={{ width: `${progress}%` }} /></div><b>{String(currentStep + 1).padStart(2, "0")} <small>/ {String(TUTORIAL_STEPS.length).padStart(2, "0")}</small></b></div>
      <div className="tutorial-navigation">
        <button className="tutorial-back" type="button" onClick={back} disabled={currentStep === 0}>← <span>BACK</span></button>
        {helpMode && <button className="tutorial-resume" type="button" onClick={onSkipTutorial}>RESUME MISSION <span>→</span></button>}
        {!isLastStep
          ? <button className="tutorial-next" type="button" onClick={next}>NEXT <span>→</span></button>
          : <button className="tutorial-start" type="button" onClick={onStartMission}>{helpMode ? "RESUME MISSION" : "START MISSION"} <span>→</span></button>}
      </div>
    </footer>
  </section>;
}
