import EventEmitter from "events";

import Phaser from "phaser";

import { CONTROL_KEY } from "@const/controls";
import { DIFFICULTY } from "@const/world/difficulty";
import { ENEMIES } from "@const/world/entities/enemies";
import { ENEMY_BOSS_SPAWN_WAVE_RATE } from "@const/world/entities/enemy";
import { WAVE_TIMELEFT_ALARM } from "@const/world/wave";
import { registerAudioAssets } from "@lib/assets";
import {
  progressionLinear,
  progressionQuadratic,
  progressionQuadraticMixed,
} from "@lib/difficulty";
import { eachEntries } from "@lib/utils";
import { NoticeType } from "@type/screen";
import { TutorialStep } from "@type/tutorial";
import { IWorld } from "@type/world";
import { EntityType } from "@type/world/entities";
import { EnemyVariant } from "@type/world/entities/npc/enemy";
import { IWave, WaveAudio, WaveEvents } from "@type/world/wave";

export class Wave extends EventEmitter implements IWave {
  readonly scene: IWorld;

  private _isGoing: boolean = false;

  public get isGoing() {
    return this._isGoing;
  }

  private set isGoing(v) {
    this._isGoing = v;
  }

  private _isPeaceMode: boolean = false;

  public get isPeaceMode() {
    return this._isPeaceMode;
  }

  private set isPeaceMode(v) {
    this._isPeaceMode = v;
  }

  private _number: number = 1;

  public get number() {
    return this._number;
  }

  private set number(v) {
    this._number = v;
  }

  private spawnedEnemiesCount: number = 0;

  private enemiesMaxCount: number = 0;

  private lastSpawnedEnemyVariant: Nullable<EnemyVariant> = null;

  private nextWaveTimestamp: number = 0;

  private nextSpawnTimestamp: number = 0;

  private alarmInterval: Nullable<NodeJS.Timeout> = null;

  constructor(scene: IWorld) {
    super();

    this.scene = scene;

    this.setMaxListeners(0);
    this.handleKeyboard();
    this.runTimeleft();
  }

  public destroy() {
    this.removeAllListeners();
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
    }
  }

  public getTimeleft() {
    const now = this.scene.getTime();

    return Math.max(0, this.nextWaveTimestamp - now);
  }

  public update() {
    const now = this.scene.getTime();

    if (this.isGoing) {
      if (this.spawnedEnemiesCount < this.enemiesMaxCount) {
        if (this.nextSpawnTimestamp <= now) {
          this.spawnEnemy();
        }
      } else if (
        this.scene.getEntitiesGroup(EntityType.ENEMY).getTotalUsed() === 0
      ) {
        this.complete();
      }
    } else if (!this.isPeaceMode) {
      const left = this.nextWaveTimestamp - now;

      if (left <= 0) {
        this.start();
      } else if (
        left <= WAVE_TIMELEFT_ALARM &&
        !this.scene.isTimePaused() &&
        !this.alarmInterval
      ) {
        this.scene.sound.play(WaveAudio.TICK);
        this.alarmInterval = setInterval(() => {
          this.scene.sound.play(WaveAudio.TICK);
        }, 1000);
      }
    }
  }

  public getEnemiesLeft() {
    const currentEnemies = this.scene
      .getEntitiesGroup(EntityType.ENEMY)
      .getTotalUsed();
    const killedEnemies = this.spawnedEnemiesCount - currentEnemies;

    return this.enemiesMaxCount - killedEnemies;
  }

  public skipTimeleft() {
    if (this.isGoing || this.scene.isTimePaused()) {
      return;
    }

    const now = this.scene.getTime();
    const skipedTime = this.nextWaveTimestamp - now;
    const resources = Math.floor(
      this.scene.getResourceExtractionSpeed() * (skipedTime / 1000)
    );

    this.scene.player.giveResources(resources);

    this.nextWaveTimestamp = now;
  }

  private runTimeleft() {
    const pause = progressionLinear({
      defaultValue: DIFFICULTY.WAVE_TIMELEFT,
      scale: DIFFICULTY.WAVE_TIMELEFT_GROWTH,
      level: this.number,
      roundTo: 1000,
    });

    this.nextWaveTimestamp = this.scene.getTime() + pause;
  }

  private start() {
    // Set the wave as ongoing
    this.isGoing = true;

    // Reset the spawn timers and counters
    this.nextSpawnTimestamp = 0;
    this.spawnedEnemiesCount = 0;

    // Calculate the maximum number of enemies for this wave based on progression
    this.enemiesMaxCount = progressionQuadraticMixed({
      defaultValue: DIFFICULTY.WAVE_ENEMIES_COUNT,
      scale: DIFFICULTY.WAVE_ENEMIES_COUNT_GROWTH,
      level: this.number,
    });

    // Clear any existing alarm intervals
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }

    // close building preview
    this.scene.game.world.builder.unsetBuildingVariant();
    // Play the wave start sound
    this.scene.sound.play(WaveAudio.START);
    if (this.number >= DIFFICULTY.SUPERSKILL_ALLOW_BY_WAVE) {
      this.scene.game.screen.notice(NoticeType.INFO, `Superskill is ready!`);
    }
    // Emit an event indicating the start of the wave
    this.emit(WaveEvents.START, this.number);
  }

  public complete() {
    const prevNumber = this.number;

    // Mark the wave as completed
    this.isGoing = false;

    // Increment the wave number
    this.number++;

    // Run the remaining time logic
    this.runTimeleft();

    // Display a notice indicating the wave completion
    this.scene.game.screen.notice(
      NoticeType.INFO,
      `Wave ${prevNumber} completed`
    );

    // Play the wave completion sound
    this.scene.sound.play(WaveAudio.COMPLETE);

    // Emit an event indicating the completion of the wave
    this.emit(WaveEvents.COMPLETE, prevNumber);

    // Execute any level-specific effects upon wave completion
    this.scene.level.looseEffects();

    // Start specific tutorials based on the wave number
    if (this.number === 2) {
      this.scene.game.tutorial.start(TutorialStep.UPGRADE_SKILL);
      this.scene.game.tutorial.start(TutorialStep.UPGRADE_BUILDING);
    } else if (this.number === 3) {
      this.scene.game.tutorial.start(TutorialStep.BUILD_AMMUNITION);
    } else if (this.number === 6) {
      this.scene.game.world.setTimePause(true);
      this.scene.game.tutorial.start(TutorialStep.BUILD_STAIR);
    } else if (this.number === 8) {
      this.scene.game.tutorial.start(TutorialStep.BUILD_RADAR);
    }
  }

  private spawnEnemy() {
    const variant = this.getEnemyVariant();

    if (!variant) {
      return;
    }

    this.scene.spawnEnemy(variant);

    const pause = progressionQuadratic({
      defaultValue: DIFFICULTY.WAVE_ENEMIES_SPAWN_PAUSE,
      scale: DIFFICULTY.WAVE_ENEMIES_SPAWN_PAUSE_GROWTH,
      level: this.number,
    });

    this.nextSpawnTimestamp = this.scene.getTime() + Math.max(pause, 500);
    this.spawnedEnemiesCount++;
  }

  private getEnemyVariant() {
    if (
      this.number % ENEMY_BOSS_SPAWN_WAVE_RATE === 0 &&
      this.spawnedEnemiesCount <
        Math.ceil(this.number / ENEMY_BOSS_SPAWN_WAVE_RATE)
    ) {
      return EnemyVariant.BOSS;
    }

    const variants: EnemyVariant[] = [];

    eachEntries(ENEMIES, (variant, Instance) => {
      if (variant !== this.lastSpawnedEnemyVariant) {
        if (Instance.SpawnWaveRange) {
          const [min, max] = Instance.SpawnWaveRange;

          if (this.number >= min && (!max || this.number <= max)) {
            variants.push(variant);
          }
        }
      }
    });

    if (variants.length > 0) {
      this.lastSpawnedEnemyVariant = Phaser.Utils.Array.GetRandom(variants);
    }

    return this.lastSpawnedEnemyVariant;
  }

  private handleKeyboard() {
    this.scene.input.keyboard?.on(CONTROL_KEY.SKIP_WAVE_TIMELEFT, () => {
      this.skipTimeleft();
    });
  }
}

registerAudioAssets(WaveAudio);