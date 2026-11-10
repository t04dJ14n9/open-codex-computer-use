## Computer audio

Use `cua.computer` to record computer audio while other actions continue.

```ts
interface ComputerAudio {
  start_audio_recording(input?: StartAudioRecordingInput): Promise<void>; // Start recording loopback audio while other desktop actions continue.
  stop_audio_recording(): Promise<Audio>; // Stop the active computer audio recording and return a 24 kHz stereo WAV.
}

type StartAudioRecordingInput = {
  max_duration_ms?: number; // Stop automatically after this many milliseconds (default 60000, maximum 300000).
};

type Audio = {
  bytes: Uint8Array; // Raw WAV bytes captured at 24 kHz
  data_url: string; // Base64-encoded WAV data URL
  filepath: string; // Local file path
};
```

```js
await cua.computer.start_audio_recording({ max_duration_ms: 5000 });
// Perform desktop actions while recording.
var audio = await cua.computer.stop_audio_recording();
await nodeRepl.emitAudio(audio.data_url);
```
