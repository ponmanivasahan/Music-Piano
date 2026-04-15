# Melodify -- Virtual Piano Studio

A hand crafted virtual piano that runs entirely in the browser. No installs, no dependencies, no server -- Just open the HTML file and play.

## What It Does:

Melodify is a fully interactive virtual piano with:

- . Real time sound using the Web Audio API(no audio files needed)
- . Drag-to-paly  -- Click and slide across keys to play notes continuously
- .Full keyboard support -- use your computer keyboard like piano keys
- .Touch support --Drag your fingers across keys on mobile
- .Polyphonic -- Multiple notes play at the same time, Nothing cuts off
- .Recording -- record what you play and save it locally.
- .Playback -- replay saved recordings with exact timing.
- .Disco mode -- animated colorful background that pulses and shifts
- . Volume control -- smooth gain slider with live readout.

## How to play:

### Using Your Keyboard

The keyboard maps directly to piano keys:

| Key | Note | Color |
| --- | --- | --- |
| A   | C4   | White |
| W   | C#4  | Black |
| S   | D4   | White |
| E   | D#4  | Black |
| D   | E4   | White |
| F   | F4   | White |
| T   | F#4  | Black |
| G   | G4   | White |
| Y   | G#4  | Black |
| H   | A4   | White |
| U   | A#4  | Black |
| J   | B4   | White |
| K   | C5   | White |
| O   | C#5  | Black |
| L   | D5   | White |
| P   | D#5  | Black |
| ;   | E5   | White |

Hold multiple keys at the same time to play chords.

### Using Your Mouse

- . Click a key to play a note
- . Click and drag horizontally across keys to play notes in a sweep
- . Hold and move as long as the mouse button is held, every key you hover over will sound

### On Mobile/Touch

- . Tap any key to play it
- . Slide your fingers across the keys to play notes continuously works like a real glissando.

## 🎙️ Recording

The recorder panel sits below the piano. Here is how it works:

1. Start recording
Click the Record button (red circle icon). The LED indicator turns red and blinks. The timer starts counting up. Play whatever you like on the piano.

2. Stop recording
Click Stop (the same button). The LED turns green. The note count appears next to the timer.

3. Play it back
Click the Play button (triangle icon). A progress bar shows playback position. Click Stop again to cancel playback early.

4. Save it
Click the Save button (download icon). The recording is saved to your browser's localStorage with a name, note count, duration, and timestamp. It will still be there the next time you open the app.

5. Manage recordings
Saved recordings appear in the list below the recorder. Each has:

A play button — click to hear it, click again to stop
A delete button — removes it permanently
Clear All link at the top right — wipes everything

Recordings are stored in localStorage under the key melodify. They persist across browser sessions but are tied to that specific browser on that device.

## 🕹️ Controls

### Volume

The slider in the top right controls the master gain. The number next to it shows the current level (0–100). The green fill tracks your position.

### Show Keys

Toggle switch that shows or hides the letter labels on each piano key. Useful once you have memorized the layout.

### Disco

Toggle switch that activates the animated background. When on, large colorful blobs move and pulse across a white canvas behind the app. The toggle itself cycles through colors while active.

## 🔊 Sound Engine Details

Melodify uses the Web Audio API — no audio files are required.
Each key press creates:

Triangle oscillator at the key's frequency (e.g. A4 = 440 Hz)
Gain envelope — fast 7ms attack, then exponential decay over ~2.4 seconds (like a real piano)
Convolution reverb — a synthetic room impulse response adds natural space (12% wet)
Master gain node — all sound passes through here, controlled by the volume slider

Polyphony is handled by giving each key its own independent oscillator chain. Notes do not cut each other off.

## Getting Started

### Option A — Just open the file

Open index.html in any modern browser.
No build step. No server. No npm. It works offline.

Then visit http://localhost:3000

## Browser support

Works in any browser that supports the Web Audio API:

Chrome / Edge — full support
Firefox — full support
Safari — full support (iOS 14.5+)

## 🐛 Common Issues

### No sound on first click

Browsers block audio until the user interacts with the page. Click anywhere first — after that, audio will start normally.

### Safari / iOS: audio is quiet

Check that your device is not on silent mode. The Web Audio API respects hardware mute switches on iOS.

### Recordings disappeared

Recordings are stored in localStorage. Clearing browser data, using private/incognito mode, or opening the file from a different path will result in a fresh store.

### Keys feel unresponsive on mobile

Make sure touch-action: none is set on the .keys-wrap element in CSS — this prevents the browser from scrolling while you play.

## 🎨 Design Notes

The UI is intentionally crafted to feel physical rather than flat:

Neumorphic shadows — surfaces appear to press in and out like real buttons
Piano keys have a gradient (top is brighter, bottom is warmer), layered box shadows for depth, and a translateY press animation
Black keys use a 3-stop dark gradient with a strong floor shadow to simulate gloss
Wood rail above the keyboard is a ::before pseudo-element with a warm amber gradient
Recorder panel is structured like a small hardware unit — status strip on top, action strip on the bottom
Toggle switches are physical sliders, not colored borders
Took little help from copilot to ui and structuring readme.

## 📄 License

MIT — free to use, modify, and share.

Built with Web Audio API, vanilla JS, and a lot of attention to detail.
