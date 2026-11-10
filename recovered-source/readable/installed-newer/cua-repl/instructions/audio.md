## Computer audio

Record system output across apps with `cua.computer`, not the microphone or a specific app. Only one recording can be active.

Preserve the user's system volume and mute state. Do not unmute or change system volume to capture audio.

```javascript
await cua.computer.start_audio_recording({ max_duration_ms: 15000 });
// Start playback or perform other Computer Use actions while recording.
var audio = await cua.computer.stop_audio_recording();
await nodeRepl.emitAudio(audio.data_url);
```

`max_duration_ms` defaults to 60000 and ranges from 100 to 300000 milliseconds. Capture stops at this limit; call `stop_audio_recording()` to retrieve the result.

`nodeRepl.emitAudio()` returns the recording as audio in the tool result. Do not print its bytes or data URL.
