# OUTPOST ZERO cinematic asset

## Status

The user-supplied cinematic is integrated at the required path. The player does not substitute generated animation or other footage if this file fails to load.

## Required integration asset

Provide one finished, continuous master file at:

`public/cinematics/outpost-zero-earth-to-mars.mp4`

The supplied 1920x1080 MP4 starts after the player selects BEGIN MISSION on the mission briefing. On the first run, the video leads to the tutorial; after tutorial completion, it leads directly to gameplay. Skip Intro remains available during playback. Replay Intro is available from the in-game field manual. A missing or corrupt file shows an unavailable screen with a working skip path. The MP4 contains one `mp4a` audio track; playback requests audible sound and offers a sound toggle and volume slider. If the browser rejects audible autoplay, a Play Cinematic With Sound action retries from the beginning after a user gesture.

## Production brief

The master film must be an original, photorealistic, AAA-quality cinematic with coherent camera continuity, physically consistent lighting, and realistic scale. It must contain these connected beats:

1. Interior of a realistic NASA-style Earth rocket preparation facility, with engineers and technicians preparing the spacecraft.
2. Rocket on its launchpad, followed by a cinematic launch.
3. A continuous camera-following ascent through Earth's atmosphere.
4. Deep-space travel, with Earth gradually receding and disappearing behind the spacecraft.
5. Mars growing in frame during approach.
6. Cinematic descent and landing at the Martian outpost.
7. A final composition and camera move that matches the opening view of the OUTPOST ZERO Mars gameplay scene, allowing the video to cut directly into play.

Deliver 16:9 video at 3840×2160 or higher, 24 or 30 fps, encoded as H.264 MP4 for ordinary laptop playback. Keep the file size practical for the submission host. Supply a source/provenance note and explicit usage rights for every footage, model, texture, voice, and sound element. Do not include copyrighted music or footage without verified permission. Prefer a silent master; the integration is muted by design.

The mission briefing appears on every app launch and requires a deliberate BEGIN MISSION action before the film starts. On the first run, when the film ends or is skipped, the tutorial opens and the player enters gameplay after finishing or skipping the tutorial. The completed tutorial is not shown automatically again. Later launches continue to gameplay after the film. Users can replay the film from the in-game field manual.
