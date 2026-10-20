import { useRef, useState, useCallback, useEffect } from "react"
import type { Persona } from "@/types"

const MODEL = "gemini-3.1-flash-live-preview"
const WS_URL = (token: string) =>
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?access_token=${token}`

const INPUT_SAMPLE_RATE = 16000
const OUTPUT_SAMPLE_RATE = 24000

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error"

interface GeminiLiveState {
  status: CallStatus
  error: string | null
  isAiSpeaking: boolean
  userTranscript: string
  aiTranscript: string
}

export function useGeminiLive() {
  const [state, setState] = useState<GeminiLiveState>({
    status: "idle",
    error: null,
    isAiSpeaking: false,
    userTranscript: "",
    aiTranscript: "",
  })

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const outputAudioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoIntervalRef = useRef<number | null>(null)
  const isActiveRef = useRef(false)

  const updateState = useCallback((patch: Partial<GeminiLiveState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const playPcmAudio = useCallback((base64Data: string) => {
    const outputCtx = outputAudioContextRef.current
    if (!outputCtx) return

    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const dataView = new DataView(bytes.buffer)
    const numSamples = bytes.length / 2
    const float32 = new Float32Array(numSamples)
    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true)
      float32[i] = int16 / 32768
    }

    const audioBuffer = outputCtx.createBuffer(1, numSamples, OUTPUT_SAMPLE_RATE)
    audioBuffer.copyToChannel(float32, 0)

    const source = outputCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(outputCtx.destination)
    source.start()
  }, [])

  const startVideoCapture = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 240
    videoCanvasRef.current = canvas

    const video = document.createElement("video")
    video.autoplay = true
    video.playsInline = true
    video.muted = true

    if (videoStreamRef.current) {
      video.srcObject = videoStreamRef.current
      video.play().catch(() => {})
    }

    videoIntervalRef.current = window.setInterval(() => {
      if (!isActiveRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
      if (video.readyState < 2) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
          const reader = new FileReader()
          reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer
            const bytes = new Uint8Array(arrayBuffer)
            let binary = ""
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i])
            }
            const base64 = btoa(binary)
            wsRef.current?.send(
              JSON.stringify({
                realtimeInput: {
                  video: {
                    data: base64,
                    mimeType: "image/jpeg",
                  },
                },
              })
            )
          }
          reader.readAsArrayBuffer(blob)
        },
        "image/jpeg",
        0.6
      )
    }, 1000)
  }, [])

  const stopVideoCapture = useCallback(() => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current)
      videoIntervalRef.current = null
    }
    videoCanvasRef.current = null
  }, [])

  const startCall = useCallback(
    async (persona: Persona) => {
      let sessionToken: string
      try {
        const tokenRes = await fetch("/api/session-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (!tokenRes.ok) {
          updateState({
            status: "error",
            error: "Failed to get roaster credentials from server.",
          })
          return
        }
        const tokenData = await tokenRes.json()
        sessionToken = tokenData.token
        if (!sessionToken) {
          updateState({
            status: "error",
            error: "Roaster credentials not configured on the server.",
          })
          return
        }
      } catch {
        updateState({
          status: "error",
          error: "Could not reach roaster server. Check your connection.",
        })
        return
      }

      updateState({ status: "connecting", error: null })

      try {
        const [micStream, camStream] = await Promise.all([
          navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: INPUT_SAMPLE_RATE,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }),
          navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
          }),
        ])

        mediaStreamRef.current = micStream
        videoStreamRef.current = camStream

        const audioCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE })
        audioContextRef.current = audioCtx

        const outputCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE })
        outputAudioContextRef.current = outputCtx

        await audioCtx.audioWorklet.addModule(
          URL.createObjectURL(
            new Blob(
              [
                `
                class PCMProcessor extends AudioWorkletProcessor {
                  process(inputs) {
                    const input = inputs[0];
                    if (input && input[0]) {
                      const channelData = input[0];
                      const pcm16 = new Int16Array(channelData.length);
                      for (let i = 0; i < channelData.length; i++) {
                        const s = Math.max(-1, Math.min(1, channelData[i]));
                        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                      }
                      this.port.postMessage(pcm16.buffer);
                    }
                    return true;
                  }
                }
                registerProcessor('pcm-processor', PCMProcessor);
                `,
              ],
              { type: "application/javascript" }
            )
          )
        )

        const sourceNode = audioCtx.createMediaStreamSource(micStream)
        sourceNodeRef.current = sourceNode

        const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor")
        audioWorkletNodeRef.current = workletNode

        const ws = new WebSocket(WS_URL(sessionToken))
        wsRef.current = ws

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              setup: {
                model: `models/${MODEL}`,
                generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: persona.voice,
                      },
                    },
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: {
                  parts: [{ text: persona.system_message }],
                },
              },
            })
          )

          sourceNode.connect(workletNode)

          workletNode.port.onmessage = (e: MessageEvent) => {
            if (ws.readyState !== WebSocket.OPEN) return
            const pcmBuffer = e.data as ArrayBuffer
            const bytes = new Uint8Array(pcmBuffer)
            let binary = ""
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i])
            }
            const base64 = btoa(binary)
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  audio: {
                    data: base64,
                    mimeType: "audio/pcm;rate=16000",
                  },
                },
              })
            )
          }

          startVideoCapture()
          isActiveRef.current = true
          updateState({ status: "live" })
        }

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data)

          if (response.setupComplete) {
            return
          }

          if (response.serverContent) {
            const sc = response.serverContent

            if (sc.interrupted) {
              updateState({ isAiSpeaking: false })
            }

            if (sc.modelTurn?.parts) {
              for (const part of sc.modelTurn.parts) {
                if (part.inlineData) {
                  playPcmAudio(part.inlineData.data)
                  updateState({ isAiSpeaking: true })
                }
              }
            }

            if (sc.inputTranscription?.text) {
              updateState({
                userTranscript: sc.inputTranscription.text,
              })
            }

            if (sc.outputTranscription?.text) {
              updateState({
                aiTranscript: sc.outputTranscription.text,
                isAiSpeaking: true,
              })
            }

            if (sc.turnComplete) {
              updateState({ isAiSpeaking: false })
            }
          }
        }

        ws.onerror = () => {
          updateState({
            status: "error",
            error: "Connection to roaster engine lost.",
            isAiSpeaking: false,
          })
        }

        ws.onclose = () => {
          if (isActiveRef.current) {
            updateState({ status: "ended", isAiSpeaking: false })
          }
          isActiveRef.current = false
        }
      } catch (err) {
        updateState({
          status: "error",
          error:
            err instanceof Error
              ? `Failed to start: ${err.message}`
              : "Failed to access camera or microphone.",
        })
      }
    },
    [playPcmAudio, startVideoCapture, updateState]
  )

  const sendAudioStreamEnd = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          realtimeInput: { audioStreamEnd: true },
        })
      )
    }
  }, [])

  const endCall = useCallback(() => {
    isActiveRef.current = false

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect()
      audioWorkletNodeRef.current = null
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close()
      outputAudioContextRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop())
      videoStreamRef.current = null
    }

    stopVideoCapture()
    updateState({ status: "ended", isAiSpeaking: false })
  }, [stopVideoCapture, updateState])

  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (wsRef.current) wsRef.current.close()
      if (audioContextRef.current) audioContextRef.current.close()
      if (outputAudioContextRef.current) outputAudioContextRef.current.close()
      if (mediaStreamRef.current)
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      if (videoStreamRef.current)
        videoStreamRef.current.getTracks().forEach((t) => t.stop())
      stopVideoCapture()
    }
  }, [stopVideoCapture])

  return {
    ...state,
    videoStream: videoStreamRef,
    startCall,
    endCall,
    sendAudioStreamEnd,
  }
}
