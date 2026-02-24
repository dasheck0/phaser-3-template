import { clamp } from "@/utils/math";
import { BaseObject } from "../base-object";

export type AudioTrackType = "music" | "sfx";

export interface AudioTrack {
	key: string;
	type: AudioTrackType;
	sound: Phaser.Sound.BaseSound;
}

/**
 * Audio prefab for music and sound effects
 *
 * Manages two separate channels:
 * - music: Looping background tracks, one active at a time
 * - sfx:   One-shot sound effects, multiple can play simultaneously
 *
 * options:
 *   musicVolume  - Initial music volume  (0–1, default 1)
 *   sfxVolume    - Initial sfx volume    (0–1, default 1)
 */
export class Audio extends BaseObject {
	private musicChannel: Phaser.Sound.BaseSound | null = null;
	private musicVolume: number = 1;
	private sfxVolume: number = 1;

	create(): void {
		this.musicVolume = this.getOption("musicVolume", 1);
		this.sfxVolume = this.getOption("sfxVolume", 1);
	}

	// ---------------------------------------------------------------------------
	// Music
	// ---------------------------------------------------------------------------

	/**
	 * Play a music track.
	 * Stops and replaces any currently playing track.
	 * @throws Error if key is not loaded in the Phaser cache
	 */
	playMusic(key: string, volume: number = this.musicVolume): void {
		this.assertKeyLoaded(key);

		this.stopMusic();

		this.musicChannel = this.scene.sound.add(key, {
			loop: true,
			volume,
		});

		this.musicChannel.play();
	}

	/** Pause the current music track (resumes from same position). */
	pauseMusic(): void {
		if (this.musicChannel && this.musicChannel.isPlaying) {
			(this.musicChannel as Phaser.Sound.WebAudioSound).pause();
		}
	}

	/** Resume a paused music track. */
	resumeMusic(): void {
		if (
			this.musicChannel &&
			(this.musicChannel as Phaser.Sound.WebAudioSound).isPaused
		) {
			(this.musicChannel as Phaser.Sound.WebAudioSound).resume();
		}
	}

	/** Stop the current music track and release it. */
	stopMusic(): void {
		if (this.musicChannel) {
			this.musicChannel.stop();
			this.musicChannel.destroy();
			this.musicChannel = null;
		}
	}

	/**
	 * Fade music volume to target over duration (ms).
	 * Uses Phaser tweens so it is frame-rate independent.
	 */
	fadeMusicTo(targetVolume: number, duration: number = 1000): void {
		if (!this.musicChannel) return;

		this.scene.tweens.add({
			targets: this.musicChannel,
			volume: targetVolume,
			duration,
			onComplete: () => {
				if (targetVolume === 0) this.stopMusic();
			},
		});
	}

	/** Set music volume immediately (0–1). */
	setMusicVolume(volume: number): void {
		this.musicVolume = clamp(volume);
		if (this.musicChannel) {
			(this.musicChannel as Phaser.Sound.WebAudioSound).setVolume(
				this.musicVolume,
			);
		}
	}

	getMusicVolume(): number {
		return this.musicVolume;
	}

	isMusicPlaying(): boolean {
		return this.musicChannel?.isPlaying ?? false;
	}

	// ---------------------------------------------------------------------------
	// Sound Effects
	// ---------------------------------------------------------------------------

	/**
	 * Play a sound effect once.
	 * Multiple calls stack – each plays independently.
	 * @throws Error if key is not loaded in the Phaser cache
	 */
	playSfx(key: string, volume: number = this.sfxVolume): void {
		this.assertKeyLoaded(key);

		this.scene.sound.play(key, { volume });
	}

	/** Set default sfx volume for subsequent playSfx calls (0–1). */
	setSfxVolume(volume: number): void {
		this.sfxVolume = clamp(volume);
	}

	getSfxVolume(): number {
		return this.sfxVolume;
	}

	// ---------------------------------------------------------------------------
	// Global
	// ---------------------------------------------------------------------------

	/** Mute / unmute all sounds through the Phaser SoundManager. */
	setMuted(muted: boolean): void {
		this.scene.sound.mute = muted;
	}

	isMuted(): boolean {
		return this.scene.sound.mute;
	}

	// ---------------------------------------------------------------------------
	// Lifecycle
	// ---------------------------------------------------------------------------

	destroy(): void {
		this.stopMusic();
		super.destroy();
	}

	// ---------------------------------------------------------------------------
	// Private helpers
	// ---------------------------------------------------------------------------

	private assertKeyLoaded(key: string): void {
		if (!this.scene.cache.audio.has(key)) {
			throw new Error(
				`Audio: audio key "${key}" not found in cache. ` +
					`Did you load it in preload()? Available keys: ` +
					`${this.scene.cache.audio.getKeys().join(", ")}`,
			);
		}
	}
}
