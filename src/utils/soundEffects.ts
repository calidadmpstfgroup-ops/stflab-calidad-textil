/**
 * Generador de Sonidos de Notificación para STFLab 2.0
 * Utiliza Web Audio API nativo del navegador (sin necesidad de archivos de audio externos).
 */

export type TipoSonido = 'solicitud' | 'patronaje' | 'corte' | 'aprobado' | 'alerta' | 'chat';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public sonidoHabilitado: boolean = true;

  public getMuted(): boolean {
    return !this.sonidoHabilitado;
  }

  public setMuted(muted: boolean): void {
    this.sonidoHabilitado = !muted;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('Web Audio API no soportado o bloqueado por el navegador:', e);
      return null;
    }
  }

  public reproducir(tipo: TipoSonido) {
    if (!this.sonidoHabilitado) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (tipo) {
      case 'chat': {
        // Tono doble tipo "Ding-Dong" cristalino para Chat Inter-Áreas
        this.tocarTono(ctx, 659.25, now, 0.12, 'sine', 0.35);        // E5
        this.tocarTono(ctx, 880.00, now + 0.12, 0.25, 'sine', 0.4);   // A5
        break;
      }

      case 'solicitud': {
        // Tono ascendente dinámico "Ding-Ding-Dong" (Compras -> Laboratorio)
        this.tocarTono(ctx, 523.25, now, 0.12, 'sine', 0.25);        // C5
        this.tocarTono(ctx, 659.25, now + 0.1, 0.14, 'sine', 0.28);  // E5
        this.tocarTono(ctx, 783.99, now + 0.22, 0.25, 'triangle', 0.35); // G5
        break;
      }

      case 'patronaje': {
        // Tono armónico geométrico / regla (Patronaje - Moldería)
        this.tocarTono(ctx, 440.00, now, 0.1, 'triangle', 0.3);       // A4
        this.tocarTono(ctx, 554.37, now + 0.08, 0.1, 'sine', 0.3);   // C#5
        this.tocarTono(ctx, 659.25, now + 0.16, 0.2, 'sine', 0.35);  // E5
        this.tocarTono(ctx, 880.00, now + 0.25, 0.3, 'sine', 0.4);   // A5
        break;
      }

      case 'corte': {
        // Doble pulso metálico / tijera suave (Corte & Tendido)
        this.tocarTono(ctx, 800, now, 0.08, 'square', 0.15);
        this.tocarTono(ctx, 1200, now + 0.06, 0.1, 'triangle', 0.25);
        this.tocarTono(ctx, 600, now + 0.16, 0.08, 'square', 0.15);
        this.tocarTono(ctx, 950, now + 0.22, 0.25, 'sine', 0.35);
        break;
      }

      case 'aprobado': {
        // Acorde triunfal de Aprobación
        this.tocarTono(ctx, 523.25, now, 0.15, 'sine', 0.25);       // C5
        this.tocarTono(ctx, 659.25, now + 0.08, 0.15, 'sine', 0.25); // E5
        this.tocarTono(ctx, 783.99, now + 0.16, 0.18, 'sine', 0.3); // G5
        this.tocarTono(ctx, 1046.50, now + 0.24, 0.4, 'sine', 0.4); // C6
        break;
      }

      case 'alerta': {
        // Tono de atención / hallazgo
        this.tocarTono(ctx, 587.33, now, 0.12, 'sawtooth', 0.2);     // D5
        this.tocarTono(ctx, 587.33, now + 0.15, 0.2, 'sawtooth', 0.25);
        break;
      }
    }
  }

  public playSendChime() {
    this.reproducir('solicitud');
  }

  public playAlertBell() {
    this.reproducir('alerta');
  }

  public playSuccessTone() {
    this.reproducir('aprobado');
  }

  private tocarTono(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envolvente de volumen (Attack - Decay)
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      console.warn('Error emitiendo tono:', e);
    }
  }
}

export const soundEffects = new SoundEffectsManager();
