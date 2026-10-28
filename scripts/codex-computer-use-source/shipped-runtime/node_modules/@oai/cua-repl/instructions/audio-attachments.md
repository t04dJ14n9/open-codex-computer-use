## Computer audio

Record system output across apps with `cua.computer`, not the microphone or a specific app. Only one recording can be active.

```javascript
await cua.computer.start_audio_recording({ max_duration_ms: 15000 });
// Start playback or perform other Computer Use actions while recording.
await cua.computer.stop_audio_recording();
```

`max_duration_ms` defaults to 60000 and ranges from 100 to 300000 milliseconds. Capture stops at this limit; call `stop_audio_recording()` to retrieve and attach the result.

Stopping automatically attaches the result to this chat as audio input.
