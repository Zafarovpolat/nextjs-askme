/** Значение по умолчанию совпадает с User::getDefaultSettings() на бэкенде. */
export function isNotificationSoundEnabled(settings: unknown): boolean {
  if (!settings || typeof settings !== 'object') {
    return true
  }
  const site = (settings as { site?: { sound_enabled?: boolean } }).site
  if (!site || typeof site !== 'object') {
    return true
  }
  return site.sound_enabled !== false
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }
  const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) {
    return null
  }
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new Ctx()
  }
  return audioContext
}

/** Короткий двухтональный сигнал для push-уведомлений (Reverb / websocket). */
export async function playNotificationSound(): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.connect(ctx.destination)
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.015)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)

    const tone = (frequency: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, start)
      osc.connect(master)
      osc.start(start)
      osc.stop(start + duration)
    }

    tone(880, now, 0.11)
    tone(1174.66, now + 0.09, 0.22)
  } catch {
    // autoplay или AudioContext недоступен — без падения UI
  }
}
