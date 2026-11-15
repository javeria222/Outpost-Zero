import { useEffect, useRef, useState } from "react";

const CINEMATIC_URL = `${import.meta.env.BASE_URL}cinematics/outpost-zero-earth-to-mars.mp4`;

export function MissionBriefing({ onBegin }: { onBegin: () => void }) {
  return <main className="controls-briefing" aria-label="Outpost Zero mission briefing">
    <aside className="briefing-orbit" aria-label="Mars mission location">
      <div className="briefing-planet" aria-hidden="true" />
      <span>ASTRAX SPACE PROGRAM</span>
      <i>MISSION BRIEFING / MARS 01</i>
    </aside>
    <section className="briefing-content" aria-labelledby="briefing-title">
      <span className="eyebrow">MISSION CONTROL / ARCADIA PLANITIA</span>
      <h1 id="briefing-title">OUTPOST <em>ZERO</em></h1>
      <p>Establish a sustainable Mars colony, protect the four-person crew, and keep life support running through SOL 6.</p>
      <div className="control-grid" aria-label="Basic mission controls">
        <div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><b>MOVE / LOOK</b><small>WASD or arrows move immediately. Click the scene to capture the mouse for looking.</small></div>
        <div><kbd>E</kbd><b>MOVEMENT MODE</b><small>E toggles vertical movement. Space ascends; Shift descends.</small></div>
        <div><kbd>BUILD</kbd><b>CONSTRUCT</b><small>Open the build menu, choose and place structures.</small></div>
        <div><kbd>ESC</kbd><kbd>H</kbd><b>FIELD MANUAL</b><small>ESC releases the mouse and opens the paused field manual. H toggles it.</small></div>
      </div>
      <div className="briefing-actions">
        <button className="briefing-primary" type="button" onClick={onBegin}>BEGIN MISSION <span>→</span></button>
      </div>
    </section>
  </main>;
}

export function MissionIntro({ onComplete }: { onComplete: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const finishTimer = useRef<number | null>(null);
  const finishStarted = useRef(false);
  const playStarted = useRef(false);
  const playbackBlockedRef = useRef(false);
  const [assetReady, setAssetReady] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const markPlaybackStarted = () => {
    playbackBlockedRef.current = false;
    setPlaybackBlocked(false);
    setAssetFailed(false);
    setAssetReady(true);
  };

  useEffect(() => () => {
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
  }, []);

  const startPlayback = () => {
    const player = video.current;
    if (!player || finishing || playStarted.current || playbackBlockedRef.current) return;
    playStarted.current = true;
    player.volume = volume;
    player.muted = muted;
    void player.play().then(() => {
      markPlaybackStarted();
    }).catch((error: unknown) => {
      playStarted.current = false;
      if (error instanceof Error && error.name === "NotAllowedError") {
        playbackBlockedRef.current = true;
        setPlaybackBlocked(true);
        return;
      }
      setAssetFailed(true);
    });
  };

  const finishIntro = () => {
    if (finishStarted.current) return;
    finishStarted.current = true;
    setFinishing(true);
    finishTimer.current = window.setTimeout(onComplete, 520);
  };

  const toggleSound = () => {
    const nextMuted = !muted;
    if (video.current) video.current.muted = nextMuted;
    setMuted(nextMuted);
  };

  const changeVolume = (nextVolume: number) => {
    if (video.current) video.current.volume = nextVolume;
    setVolume(nextVolume);
  };

  const playWithSound = () => {
    const player = video.current;
    if (!player) return;
    const audibleVolume = volume > 0 ? volume : 0.8;
    playbackBlockedRef.current = false;
    playStarted.current = true;
    setPlaybackBlocked(false);
    setAssetFailed(false);
    setMuted(false);
    if (volume === 0) setVolume(audibleVolume);
    player.muted = false;
    player.volume = audibleVolume;
    player.currentTime = 0;
    void player.play().then(() => {
      markPlaybackStarted();
    }).catch((error: unknown) => {
      playStarted.current = false;
      if (error instanceof Error && error.name === "NotAllowedError") {
        playbackBlockedRef.current = true;
        setPlaybackBlocked(true);
        return;
      }
      setAssetFailed(true);
    });
  };

  return <section className={`mission-intro${finishing ? " finishing" : ""}`} aria-label="Earth to Mars mission introduction">
    <video
      ref={video}
      className={`intro-video${assetReady ? " ready" : ""}`}
      src={CINEMATIC_URL}
      autoPlay
      muted={muted}
      playsInline
      preload="auto"
      onCanPlay={startPlayback}
      onLoadedData={startPlayback}
      onPlaying={markPlaybackStarted}
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
      <h1>{assetFailed ? "CINEMATIC ASSET UNAVAILABLE" : playbackBlocked ? "SOUND PLAYBACK NEEDS YOUR OK" : "PREPARING MISSION FILM"}</h1>
      <p>{assetFailed
        ? "The Earth-to-Mars master film could not be loaded or played. Skip this introduction to continue to your field briefing."
        : playbackBlocked
          ? "This browser blocked autoplay with sound. Start the film from its opening with narration enabled."
          : "Preparing your Earth-to-Mars cinematic. Playback will begin automatically."}
      </p>
      {playbackBlocked && <button className="intro-play-with-sound" type="button" onClick={playWithSound}>PLAY CINEMATIC WITH SOUND <span>→</span></button>}
      {assetFailed && <><code>public/cinematics/outpost-zero-earth-to-mars.mp4</code>
      <small>No substitute footage is shown. Skip the introduction to continue.</small></>}
    </div>}
    <header className="intro-brand"><span>ASTRAX SPACE PROGRAM</span><b>OUTPOST <em>ZERO</em></b><small>HUMAN MISSION · MARS 01</small></header>
    <div className="intro-playback-status" aria-live="polite">
      {assetReady ? "MISSION FILM · EARTH TO MARS" : assetFailed ? "MISSION FILM UNAVAILABLE" : "CHECKING CINEMATIC ASSET"}
    </div>
    <div className="intro-top-actions">
      <div className="intro-audio-controls" role="group" aria-label="Cinematic sound controls">
        <button
          className="intro-sound-toggle"
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Enable cinematic sound" : "Mute cinematic sound"}
          aria-pressed={!muted}
        >{muted ? "SOUND OFF" : "SOUND ON"}</button>
        <label className="intro-volume-control">
          <span>VOLUME</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            aria-label="Cinematic volume"
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            onChange={(event) => changeVolume(Number(event.currentTarget.value))}
          />
        </label>
      </div>
      <button className="intro-skip" type="button" onClick={finishIntro} disabled={finishing}>SKIP INTRO <span>→</span></button>
    </div>
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
    eyebrow: "MISSION BRIEF ·ARCADIA PLANITIA",
    description: "You have arrived at Outpost Zero. Establish a sustainable colony, protect the four-person crew, and keep the settlement operational through SOL 6.",
    note: "Your outpost begins without shelter or life-support structures. Build the systems the crew depends on.",
    visual: "mars",
  },
  {
    label: "MOVEMENT",
    title: "MOVE THROUGH THE OUTPOST",
    eyebrow: "EVA FIELD GUIDE · 01",
    description: "WASD or the arrow keys move immediately; no scene click is needed. To look around, click the 3D Mars scene to capture the mouse, then move it.",
    note: "ESC releases the mouse and opens this manual, pausing mission time and astronaut movement. H toggles the manual. Click the scene again whenever you want mouse look.",
    visual: "move",
  },
  {
    label: "ALTITUDE",
    title: "CONTROL YOUR ALTITUDE",
    eyebrow: "EVA FIELD GUIDE · 02",
    description: "Press E to toggle Movement Mode. Space ascends; Shift descends. Releasing either key holds your altitude. Press E again to return safely to the surface.",
    note: "On foot, Space jumps and Shift sprints. Releasing a movement key stops it. Pausing, opening help, entering Build Mode, losing focus, or switching tabs clears held keys and lands you safely.",
    visual: "flight",
  },
  {
    label: "CONSTRUCTION",
    title: "BUILD THE SYSTEMS YOU NEED",
    eyebrow: "COLONY OPERATIONS · 01",
    description: "Choose ENTER BUILD MODE, select a structure, and review its material cost in the panel. Click suitable open ground to place it; press R to rotate the preview.",
    note: "ESC cancels the current placement preview. Invalid or overlapping sites are rejected; materials are charged only when a structure is successfully placed.",
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
    description: "Press ESC to release the mouse, pause mission time, and open this guide. Press H or choose CONTROLS in the HUD to toggle the field manual.",
    note: "Astronaut movement is suspended while the field manual or Pause state is active. Click the 3D scene to capture the mouse again for camera look. Use REPLAY INTRO here to watch the film again.",
    visual: "pause",
  },
];

function TutorialVisual({ visual }: { visual: TutorialStep["visual"] }) {
  if (visual === "move") {
    return <div className="tutorial-visual movement-visual" aria-label="WASD or arrow movement and captured mouse look diagram">
      <div className="wasd-diagram"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
      <div className="mouse-diagram"><span /><i /><b>MOUSE LOOK</b><small>CLICK SCENE TO CAPTURE</small></div>
      <small>WASD / ARROWS MOVE WITHOUT CLICKING</small>
    </div>;
  }
  if (visual === "flight") {
    return <div className="tutorial-visual flight-visual" aria-label="Movement mode toggle, ascend, and descend controls">
      <div className="flight-orbit"><i className="flight-dot" /><span>E</span></div>
      <div className="flight-controls"><kbd>E</kbd><b>MOVEMENT MODE</b><kbd>SPACE</kbd><b>ASCEND</b><kbd>SHIFT</kbd><b>DESCEND</b></div>
      <small>VERTICAL MOVEMENT · 120 M ALTITUDE LIMIT</small>
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
      <kbd>ESC</kbd><span>RELEASE MOUSE / PAUSE / FIELD MANUAL</span>
      <div><b>H</b><small>TOGGLE GUIDE</small><b>REPLAY</b><small>WATCH ARRIVAL FILM</small></div>
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
