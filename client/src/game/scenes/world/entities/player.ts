import Phaser from "phaser";

import { CONTROL_KEY } from "@const/controls";
import { DIFFICULTY } from "@const/world/difficulty";
import {
  PLAYER_TILE_SIZE,
  PLAYER_MOVE_DIRECTIONS,
  PLAYER_MOVE_ANIMATIONS,
  PLAYER_SKILLS,
  PLAYER_SUPERSKILLS,
} from "@const/world/entities/player";
import { Crystal } from "@game/scenes/world/entities/crystal";
import { Stair } from "@game/scenes/world/entities/stair";
import { Sprite } from "@game/scenes/world/entities/sprite";
import { getAssetsPack, registerAudioAssets, registerSpriteAssets } from "@lib/assets";
import { progressionLinear, progressionQuadratic } from "@lib/difficulty";
import { Particles } from "@game/scenes/world/effects";
import { GameSettings } from "@type/game";
import { NoticeType } from "@type/screen";
import { TutorialStep, TutorialStepState } from "@type/tutorial";
import { IWorld, WorldEvents } from "@type/world";
import { IParticles, ParticlesTexture } from "@type/world/effects";
import { EntityType } from "@type/world/entities";
import { BuildingVariant } from "@type/world/entities/building";
import { IEnemy } from "@type/world/entities/npc/enemy";
import {
  PlayerTexture,
  MovementDirection,
  PlayerAudio,
  PlayerData,
  IPlayer,
  PlayerSkill,
  PlayerSuperskill,
  PlayerSkillAudio,
  PlayerDataPayload,
} from "@type/world/entities/player";
import { BiomeType, TileType, Vector2D } from "@type/world/level";
import { WaveEvents } from "@type/world/wave";
import { Level } from "../level";
import { Building } from "./building";
import { BuildingStair } from "./building/variants/stair";
import { eachEntries, isMobileDevice } from "@lib/utils";
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js";
import { getWawaTextureKey, registerWawaTexture } from "@lib/wawa-texture";

export class Player extends Sprite implements IPlayer {
  public joystick: VirtualJoystick;

  private _experience: number = 0;

  public get experience() {
    return this._experience;
  }

  private set experience(v) {
    this._experience = v;
  }

  private _resources: number = DIFFICULTY.PLAYER_START_RESOURCES;

  public get resources() {
    return this._resources;
  }

  private set resources(v) {
    this._resources = v;
  }

  private _score: number = 0;

  public get score() {
    return this._score;
  }

  private set score(v) {
    this._score = v;
  }

  private _kills: number = 0;

  public get kills() {
    return this._kills;
  }

  private set kills(v) {
    this._kills = v;
  }

  private _upgradeLevel: Record<PlayerSkill, number> = {
    [PlayerSkill.MAX_HEALTH]: 1,
    [PlayerSkill.SPEED]: 1,
    [PlayerSkill.BUILD_AREA]: 1,
    [PlayerSkill.ASSISTANT]: 1,
  };

  public get upgradeLevel() {
    return this._upgradeLevel;
  }

  private set upgradeLevel(v) {
    this._upgradeLevel = v;
  }

  private movementKeysState: Partial<
    Record<keyof typeof MovementDirection, boolean>
  > = {};

  private direction: number = 0;

  private isMoving: boolean = false;

  private dustEffect: Nullable<IParticles> = null;

  private _activeSuperskills: Partial<Record<PlayerSuperskill, boolean>> = {};

  private inactivityTimeout: NodeJS.Timeout | null = null;

  public get activeSuperskills() {
    return this._activeSuperskills;
  }

  private set activeSuperskills(v) {
    this._activeSuperskills = v;
  }

  private _coolDownSuperskills: Partial<Record<PlayerSuperskill, boolean>> = {};

  public get coolDownSuperskills() {
    return this._coolDownSuperskills;
  }

  private set coolDownSuperskills(v) {
    this._coolDownSuperskills = v;
  }

  constructor(scene: IWorld, data: PlayerData) {
    if (data.wawa) registerWawaTexture(scene, data.wawa);

    super(scene, {
      ...data,
      texture: data.wawa ? getWawaTextureKey(data.wawa) : PlayerTexture.PLAYER,
      health: DIFFICULTY.PLAYER_HEALTH,
      speed: DIFFICULTY.PLAYER_SPEED,
    });

    scene.add.existing(this);

    this.gamut = PLAYER_TILE_SIZE.gamut;
    this.registerAnimations();
    this.addDustEffect();
    if (!this.scene.game.joinGame) {
      this.handleKeyboard();
      if (isMobileDevice()) {
        const marginPercent = 7;
        const xMargin = (window.innerWidth * marginPercent) / 100;
        const yMargin = (window.innerHeight * marginPercent) / 100;
        this.joystick = new VirtualJoystick(this.scene.game.world, {
          x: xMargin,
          y: window.innerHeight - yMargin * 2,
          radius: 50,
          base: this.scene.game.world.add
            .circle(0, 0, 50, 0x888888)
            .setDepth(1000),
          thumb: this.scene.game.world.add
            .circle(0, 0, 20, 0xcccccc)
            .setDepth(1000),
          forceMin: 3,
        });
        this.joystick.setScrollFactor(0);
      }
    }
    this.addIndicator({
      color: 0xd0ff4f,
      value: () => this.live.health / this.live.maxHealth,
      size: 20,
    });

    // need to change player size to 14,26
    this.body.setSize(14, 26);

    this.setTilesGroundCollision(true);
    this.setTilesCollision(
      [TileType.MAP, TileType.BUILDING, TileType.CRYSTAL, TileType.STAIR],
      (tile) => {
        if (tile instanceof Crystal) {
          tile.pickup();
        } else if (tile instanceof Building) {
          if (tile.variant === BuildingVariant.STAIR) {
            if (this.scene.game.world.isTimePaused()) {
              // If the building is a stair, call the pickup method
              (tile as BuildingStair).pickup();
              this.scene.game.world.setTimePause(false);
            } else {
              this.scene.game.screen.notice(
                NoticeType.INFO,
                `You can't leave the level becase the boss is coming`
              );
            }
          }
        } else if (tile instanceof Stair)
          if (!this.scene.game.world.wave.isGoing) {
            // If the tile is a stair, call the pickup method
            tile.pickup();
          } else {
            this.scene.game.screen.notice(
              NoticeType.INFO,
              `You can't leave the level while the wave is going`
            );
          }
      }
    );

    this.addCollider(EntityType.ENEMY, "collider", (enemy: IEnemy) => {
      enemy.attack(this);
    });

    this.addCollider(EntityType.ENEMY, "overlap", (enemy: IEnemy) => {
      enemy.overlapTarget();
    });

    this.scene.wave.on(WaveEvents.COMPLETE, this.onWaveComplete.bind(this));
  }

  public update() {
    super.update();

    if (this.live.isDead()) {
      return;
    }
    if (this.dustEffect) {
      this.dustEffect.emitter.setDepth(this.depth - 1);
    }

    if (this.currentBiome?.type === BiomeType.MAGMA) {
      this.live.damage(this.live.maxHealth * 0.003);
      this.addFireEffect(100);
      this.setVelocity(0, 0);
    }

    if (isMobileDevice()) {
      this.handleJoystick();
    }
    this.updateDirection();
    this.updateVelocity();
  }

  public giveScore(amount: number) {
    if (this.live.isDead()) {
      return;
    }

    this.score += amount;
  }

  public giveExperience(amount: number) {
    if (this.live.isDead()) {
      return;
    }

    this.experience += Math.round(
      amount / this.scene.game.getDifficultyMultiplier()
    );
  }

  public giveResources(amount: number) {
    if (this.live.isDead()) {
      return;
    }

    this.resources += amount;

    if (
      this.scene.game.tutorial.state(TutorialStep.RESOURCES) ===
      TutorialStepState.IN_PROGRESS
    ) {
      this.scene.game.tutorial.complete(TutorialStep.RESOURCES);
    }
  }

  public changePosition(positionAtMatrix: Vector2D) {
    this.positionAtMatrix = positionAtMatrix;
    const positionOfTop = this.getTopCenter();

    const positionOnGround = Level.ToPositionAtWorld(positionAtMatrix);
    const depth = Level.GetDepth(positionOnGround.y, 1);
    this.currentBiome = this.scene.level.map.getAt(positionAtMatrix);

    this.setDepth(depth);

    this.container.setDepth(depth + 19);
    this.container.setPosition(positionOfTop.x, (positionOfTop?.y ?? 0) - 10);
    this.container.setAlpha(this.alpha);
    this.container.setVisible(this.visible);

    const positionAtWorld = Level.ToWorldPosition({
      ...positionAtMatrix,
      z: 0,
    });

    this.setPosition(positionAtWorld.x, positionAtWorld.y);
  }

  public takeResources(amount: number) {
    this.resources -= amount;

    if (
      this.resources < DIFFICULTY.BUILDING_STAKING_COST &&
      this.scene.builder.getBuildingsByVariant(BuildingVariant.STAKING)
        .length === 0
    ) {
      this.scene.game.tutorial.start(TutorialStep.RESOURCES);
    }
  }

  public incrementKills() {
    this.kills++;
  }

  public getSuperskillCost(type: PlayerSuperskill) {
    return progressionLinear({
      defaultValue: PLAYER_SUPERSKILLS[type].cost,
      scale: DIFFICULTY.SUPERSKILL_COST_GROWTH,
      level: this.scene.wave.number,
    });
  }

  private handleSuperskillKeyboard() {
    this.scene.input.keyboard?.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      (event: KeyboardEvent) => {
        if (!this.scene.game.world.wave.isGoing) {
          return;
        }
        if (Number(event.key)) {
          const skillIndex = Number(event.key) - 1;
          const selectedSkillType = Object.values(PlayerSuperskill)[skillIndex];

          if (selectedSkillType) {
            this.useSuperskill(selectedSkillType); // スキルを使用するメソッドを呼び出す
          }
        }
      }
    );
  }

  public useSuperskill(type: PlayerSuperskill) {
    if (
      this.activeSuperskills[type] ||
      this.coolDownSuperskills[type] ||
      !this.scene.wave.isGoing ||
      this.scene.wave.number < DIFFICULTY.SUPERSKILL_ALLOW_BY_WAVE
    ) {
      return;
    }

    const cost = this.getSuperskillCost(type);

    if (this.resources < cost) {
      this.scene.game.screen.notice(NoticeType.ERROR, "Not enough ethereum");

      return;
    }

    this.activeSuperskills[type] = true;

    this.takeResources(cost);

    this.scene.events.emit(WorldEvents.USE_SUPERSKILL, type);

    this.scene.time.addEvent({
      delay: PLAYER_SUPERSKILLS[type].duration,
      callback: () => {
        delete this.activeSuperskills[type];
        this.coolDownSuperskills[type] = true;
        this.scene.time.addEvent({
          delay: PLAYER_SUPERSKILLS[type].cooltime,
          callback: () => {
            delete this.coolDownSuperskills[type];
          },
        });
      },
    });
    this.scene.game.sound.play(PlayerSkillAudio[type]);
  }

  public getExperienceToUpgrade(type: PlayerSkill) {
    return progressionQuadratic({
      defaultValue: PLAYER_SKILLS[type].experience,
      scale: DIFFICULTY.PLAYER_EXPERIENCE_TO_UPGRADE_GROWTH,
      level: this.upgradeLevel[type],
      roundTo: 10,
    });
  }

  private getUpgradeNextValue(type: PlayerSkill, level?: number): number {
    const nextLevel = level ?? this.upgradeLevel[type] + 1;

    switch (type) {
      case PlayerSkill.MAX_HEALTH: {
        return progressionQuadratic({
          defaultValue: DIFFICULTY.PLAYER_HEALTH,
          scale: DIFFICULTY.PLAYER_HEALTH_GROWTH,
          level: nextLevel,
          roundTo: 10,
        });
      }
      case PlayerSkill.SPEED: {
        return progressionQuadratic({
          defaultValue: DIFFICULTY.PLAYER_SPEED,
          scale: DIFFICULTY.PLAYER_SPEED_GROWTH,
          level: nextLevel,
        });
      }
      case PlayerSkill.BUILD_AREA: {
        return progressionQuadratic({
          defaultValue: DIFFICULTY.BUILDER_BUILD_AREA,
          scale: DIFFICULTY.BUILDER_BUILD_AREA_GROWTH,
          level: nextLevel,
        });
      }
      case PlayerSkill.ASSISTANT: {
        return nextLevel;
      }
    }
  }

  public upgrade(type: PlayerSkill) {
    const experience = this.getExperienceToUpgrade(type);

    if (this.experience < experience) {
      this.scene.game.screen.notice(NoticeType.ERROR, "Not enough experience");

      return;
    }

    const nextValue = this.getUpgradeNextValue(type);

    switch (type) {
      case PlayerSkill.MAX_HEALTH: {
        const addedHealth = nextValue - this.live.maxHealth;

        this.live.setMaxHealth(nextValue);
        this.live.addHealth(addedHealth);
        if (this.scene.assistant) {
          this.scene.assistant.live.setMaxHealth(nextValue);
          this.scene.assistant.live.addHealth(addedHealth);
        }
        break;
      }
      case PlayerSkill.SPEED: {
        this.speed = nextValue;
        if (this.scene.assistant) {
          this.scene.assistant.speed = nextValue;
        }
        break;
      }
      case PlayerSkill.BUILD_AREA: {
        this.scene.builder.setBuildAreaRadius(nextValue);
        break;
      }
      case PlayerSkill.ASSISTANT: {
        if (this.scene.assistant) {
          this.scene.assistant.level = nextValue;
        }
        break;
      }
    }

    this.setSkillUpgrade(type, this.upgradeLevel[type] + 1);

    this.experience -= experience;

    this.scene.sound.play(PlayerAudio.UPGRADE);

    this.scene.game.tutorial.complete(TutorialStep.UPGRADE_SKILL);
  }

  private setSkillUpgrade(type: PlayerSkill, level: number) {
    const nextValue = this.getUpgradeNextValue(type, level);

    switch (type) {
      case PlayerSkill.MAX_HEALTH: {
        const addedHealth = nextValue - this.live.maxHealth;
        this.live.setMaxHealth(nextValue);
        this.live.addHealth(addedHealth);
        if (this.scene.assistant) {
          this.scene.assistant.live.setMaxHealth(nextValue);
          this.scene.assistant.live.addHealth(addedHealth);
        }
        break;
      }
      case PlayerSkill.SPEED: {
        this.speed = nextValue;
        if (this.scene.assistant) {
          this.scene.assistant.speed = nextValue;
        }
        break;
      }
      case PlayerSkill.BUILD_AREA: {
        this.scene.builder.setBuildAreaRadius(nextValue);
        break;
      }
      case PlayerSkill.ASSISTANT: {
        if (this.scene.assistant) {
          this.scene.assistant.level = nextValue;
        }
        break;
      }
    }
    this.upgradeLevel[type] = level;
  }

  public getDataPayload(): PlayerDataPayload {
    return {
      position: this.positionAtMatrix,
      score: this.score,
      experience: this.experience,
      resources: this.resources,
      kills: this.kills,
      health: this.live.health,
      upgradeLevel: this.upgradeLevel,
    };
  }

  public loadDataPayload(data: PlayerDataPayload) {
    this.score = data.score;
    this.experience = data.experience;
    this.resources = data.resources;
    this.kills = data.kills;

    eachEntries(data.upgradeLevel, (type, level) => {
      if (level > 1) {
        this.setSkillUpgrade(type, level);
      }
    });

    this.live.setHealth(data.health);
  }

  public onDamage() {
    this.scene.camera.shake();

    const audio = Phaser.Utils.Array.GetRandom([
      PlayerAudio.DAMAGE_1,
      PlayerAudio.DAMAGE_2,
      PlayerAudio.DAMAGE_3,
    ]);

    if (this.scene.game.sound.getAll(audio).length === 0) {
      this.scene.game.sound.play(audio);
    }

    super.onDamage();
  }

  public onDead() {
    this.scene.sound.play(PlayerAudio.DEAD);

    this.setVelocity(0, 0);
    this.stopMovement();

    this.scene.tweens.add({
      targets: [this, this.container],
      alpha: 0.0,
      duration: 250,
    });
  }

  private onWaveComplete(number: number) {
    const experience = progressionQuadratic({
      defaultValue: DIFFICULTY.WAVE_EXPERIENCE,
      scale: DIFFICULTY.WAVE_EXPERIENCE_GROWTH,
      level: number,
    });

    this.giveExperience(experience);
    this.giveScore(number * 10);
    this.live.heal();
  }

  private handleKeyboard() {
    const keysMap: Record<string, keyof typeof MovementDirection> = {
      w: "UP",
      ArrowUp: "UP",
      s: "DOWN",
      ArrowDown: "DOWN",
      a: "LEFT",
      ArrowLeft: "LEFT",
      d: "RIGHT",
      ArrowRight: "RIGHT",
    };

    this.scene.input.keyboard?.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (event: KeyboardEvent) => {
        if (keysMap[event.key]) {
          this.movementKeysState[keysMap[event.key]] = true;
        }
      }
    );

    this.scene.input.keyboard?.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      (event: KeyboardEvent) => {
        if (keysMap[event.key]) {
          this.movementKeysState[keysMap[event.key]] = false;
        }
      }
    );
    this.handleSuperskillKeyboard();
  }

  private handleJoystick() {
    type DirectionRange = {
      min: number;
      max: number;
      directions: (keyof typeof MovementDirection)[];
    };

    const angle = this.joystick.angle;
    const force = this.joystick.force;
    console.log(angle, force);

    const allDirections: (keyof typeof MovementDirection)[] = [
      "UP",
      "DOWN",
      "LEFT",
      "RIGHT",
    ];
    const angleToDirectionMap: DirectionRange[] = [
      { min: -67.5, max: -22.5, directions: ["UP", "RIGHT"] },
      { min: -112.5, max: -67.5, directions: ["UP"] },
      { min: -157.5, max: -112.5, directions: ["UP", "LEFT"] },
      { min: -180, max: -157.5, directions: ["LEFT"] },
      { min: 157.5, max: 180, directions: ["LEFT"] },
      { min: 112.5, max: 157.5, directions: ["DOWN", "LEFT"] },
      { min: 67.5, max: 112.5, directions: ["DOWN"] },
      { min: 22.5, max: 67.5, directions: ["DOWN", "RIGHT"] },
      { min: -22.5, max: 22.5, directions: ["RIGHT"] },
    ];
    // Reset all directions to false initially
    for (const direction of allDirections) {
      this.movementKeysState[direction] = false;
    }

    if (force > 3) {
      for (const { min, max, directions } of angleToDirectionMap) {
        if (angle >= min && angle < max) {
          for (const direction of directions) {
            this.movementKeysState[direction] = true;
          }
          break; // No need to check other ranges once we've found our match
        }
      }
    }
  }

  private updateVelocity() {
    if (!this.isMoving) {
      this.setVelocity(0, 0);

      return;
    }

    const collide = this.handleCollide(this.direction);

    if (collide) {
      this.setVelocity(0, 0);

      return;
    }

    const friction = this.currentBiome?.friction ?? 1;
    const speed = this.speed / friction;
    const velocity = this.scene.physics.velocityFromAngle(
      this.direction,
      speed
    );

    this.setVelocity(velocity.x, velocity.y);
  }

  private updateDirection() {
    const x = this.getKeyboardSingleDirection(["LEFT", "RIGHT"]);
    const y = this.getKeyboardSingleDirection(["UP", "DOWN"]);
    const key = `${x}|${y}`;

    const oldMoving = this.isMoving;
    const oldDirection = this.direction;
    if (x !== 0 || y !== 0) {
      // Clear the timeout if there's any activity
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = null;
      }

      this.isMoving = true;
      this.direction = PLAYER_MOVE_DIRECTIONS[key];
    } else {
      if (
        this.inactivityTimeout === null &&
        this.scene.game.isPVP &&
        !this.scene.game.joinGame
      ) {
        this.inactivityTimeout = setTimeout(() => {
          console.log("No activity for a while"); // Replace with your own logic
          this.scene.game.stopGame();
        }, 300000); // 5 minutes (300,000 milliseconds) of no activity triggers the above logic
      }

      this.isMoving = false;
    }

    if (oldMoving !== this.isMoving || oldDirection !== this.direction) {
      if (this.isMoving) {
        this.anims.play(PLAYER_MOVE_ANIMATIONS[key]);

        if (!oldMoving) {
          if (this.dustEffect) {
            this.dustEffect.emitter.start();
          }

          this.scene.game.sound.play(PlayerAudio.WALK, {
            loop: true,
            rate: 1.8,
          });
        }
      } else {
        this.stopMovement();
      }
    }
  }

  private stopMovement() {
    this.isMoving = false;

    if (this.anims.currentAnim) {
      this.anims.setProgress(0);
      this.anims.stop();
    }

    if (this.dustEffect) {
      this.dustEffect.emitter.stop();
    }

    this.scene.sound.stopByKey(PlayerAudio.WALK);
  }

  private getKeyboardSingleDirection(
    directions: (keyof typeof MovementDirection)[]
  ) {
    const type =
      directions.find((direction) => this.movementKeysState[direction]) ??
      "NONE";

    return MovementDirection[type];
  }

  private addDustEffect() {
    if (!this.scene.game.isSettingEnabled(GameSettings.EFFECTS)) {
      return;
    }

    this.dustEffect = new Particles(this, {
      key: "dust",
      texture: ParticlesTexture.BIT,
      params: {
        follow: this,
        followOffset: {
          x: 0,
          y: -this.gamut * this.scaleY * 0.5,
        },
        lifespan: { min: 150, max: 300 },
        scale: 0.6,
        speed: 10,
        frequency: 150,
        alpha: { start: 0.75, end: 0.0 },
        emitting: false,
      },
    });
  }

  private registerAnimations() {
    // Object.values(PLAYER_MOVE_ANIMATIONS).forEach((key, index) => {
    //   this.anims.create({
    //     key,
    //     // frames: this.anims.generateFrameNumbers(PlayerTexture.PLAYER, {
    //     //   start: index * 4,
    //     //   end: (index + 1) * 4 - 1,
    //     // }),
    //     frames: this.anims.generateFrameNumbers(PlayerTexture.PLAYER, {}),
    //     frameRate: 8,
    //     repeat: -1,
    //   });
    // });
  }
  private addFireEffect(duration: number) {
    if (!this.scene.game.isSettingEnabled(GameSettings.EFFECTS)) {
      return;
    }

    new Particles(this, {
      key: "fire",
      texture: ParticlesTexture.GLOW,
      params: {
        follow: this,
        followOffset: this.getBodyOffset(),
        duration,
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
        colorEase: "quad.out",
        lifespan: this.displayWidth * 25,
        angle: {
          min: -100,
          max: -80,
        },
        scale: {
          start: (this.displayWidth * 1.25) / 100,
          end: 0,
          ease: "sine.out",
        },
        speed: 80,
        advance: 200,
        blendMode: "ADD",
      },
    });
  }
}

registerAudioAssets(PlayerAudio);
registerAudioAssets(PlayerSkillAudio);
registerSpriteAssets(PlayerTexture, PLAYER_TILE_SIZE);
