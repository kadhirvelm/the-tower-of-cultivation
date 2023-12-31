import { Store } from "@reduxjs/toolkit";
import { State } from "../../store/configureStore";
import { WeaponSlotNumber } from "../../store/reducer/gameState";
import { AuraAttack } from "../attacks/AuraAttack";
import { RangedAttack } from "../attacks/RangedAttack";
import { RodAttack } from "../attacks/RodAttack";
import { Shield } from "../attacks/Shield";
import { SpearAttack } from "../attacks/SpearAttack";
import { SwordAttack } from "../attacks/SwordAttack";
import { Enforcement } from "../modifier/Enforcement";
import { getStore } from "../store/storeManager";
import { Player } from "./Player";

export class PlayerAttack {
  private reduxStore: Store<State>;

  public constructor(private playerSprite: Player) {
    this.reduxStore = getStore();
  }

  public handleKeyboardInput() {
    if (
      Phaser.Input.Keyboard.JustDown(
        this.playerSprite.playerInteractions.keyboard.ranged_attack,
      )
    ) {
      this.fireRangedAttack();
    }

    if (
      Phaser.Input.Keyboard.JustDown(
        this.playerSprite.playerInteractions.keyboard.aura_attack,
      )
    ) {
      this.fireAuraAttack();
    }

    if (
      Phaser.Input.Keyboard.JustDown(
        this.playerSprite.playerInteractions.keyboard.enforcement,
      )
    ) {
      this.fireEnforcement();
    }

    if (
      Phaser.Input.Keyboard.JustDown(
        this.playerSprite.playerInteractions.keyboard.slotA,
      )
    ) {
      return this.fireWeapon("slotA");
    }

    if (
      Phaser.Input.Keyboard.JustDown(
        this.playerSprite.playerInteractions.keyboard.slotB,
      )
    ) {
      return this.fireWeapon("slotB");
    }
  }

  private fireWeapon(slotNumber: WeaponSlotNumber) {
    const allWeaponSlot =
      this.reduxStore.getState().gameState.playerEquipment.weapons;
    const firedWeaponSlot = allWeaponSlot[slotNumber === "slotA" ? 0 : 1];
    if (firedWeaponSlot == null) {
      return;
    }

    switch (firedWeaponSlot.type) {
      case "rod":
        return this.fireRodAttack(slotNumber);
      case "spear":
        return this.fireSpearAttack(slotNumber);
      case "sword":
        return this.fireSwordAttack(slotNumber);
      case "shield":
        return this.fireShield(slotNumber);
      default:
        throw new Error(`Unknown weapon type ${firedWeaponSlot.type}`);
    }
  }

  private fireRangedAttack() {
    if (!this.playerSprite.playerStatsHandler.rangedAttack.canFire()) {
      this.playerSprite.noChi();
      return;
    }

    const maybeRangedAttack: RangedAttack | null =
      this.playerSprite.playerInteractions.rangedAttackGroup.get();
    if (maybeRangedAttack == null) {
      return;
    }

    maybeRangedAttack.fire(
      this.playerSprite.x,
      this.playerSprite.y,
      this.playerSprite.flipX ? "left" : "right",
      {
        damage: this.playerSprite.playerStatsHandler.rangedAttack.damage(),
        range: this.playerSprite.playerStatsHandler.rangedAttack.range(),
        velocity: this.playerSprite.playerStatsHandler.rangedAttack.velocity(),
        pushBack: {
          duration: 100,
          velocity: 10,
        },
      },
    );

    this.playerSprite.playerStatsHandler.rangedAttack.consumeChi();
  }

  private fireAuraAttack() {
    if (!this.playerSprite.playerStatsHandler.auraAttack.canFire()) {
      this.playerSprite.noChi();
      return;
    }

    const maybeAuraAttack: AuraAttack | null =
      this.playerSprite.playerInteractions.auraAttackGroup.get();
    if (maybeAuraAttack == null) {
      return;
    }

    maybeAuraAttack.fire(this.playerSprite.x, this.playerSprite.y, {
      damage: this.playerSprite.playerStatsHandler.auraAttack.damage(),
      duration: this.playerSprite.playerStatsHandler.auraAttack.duration(),
      scale: this.playerSprite.playerStatsHandler.auraAttack.scale(),
      pushBack: {
        duration: 0,
        velocity: 0,
      },
    });
    this.playerSprite.playerStatsHandler.auraAttack.consumeChi();
  }

  private fireEnforcement() {
    if (!this.playerSprite.playerStatsHandler.enforcement.canFire()) {
      this.playerSprite.noChi();
      return;
    }

    const maybeEnforcement: Enforcement | null =
      this.playerSprite.playerInteractions.enforcementGroup.get();
    if (maybeEnforcement == null) {
      return;
    }

    maybeEnforcement.fire(this.playerSprite, {
      duration: this.playerSprite.playerStatsHandler.enforcement.duration(),
      enforcement: {
        offensiveAttributes: {
          chiFocus: 5,
          efficiency: 5,
          weaponStrength: 5,
        },
      },
    });
    this.playerSprite.playerStatsHandler.auraAttack.consumeChi();
  }

  private fireSwordAttack(slotNumber: WeaponSlotNumber) {
    if (!this.playerSprite.playerStatsHandler.swordAttack.canFire()) {
      this.playerSprite.noStamina();
      return;
    }

    const maybeSwordAttack: SwordAttack | null =
      this.playerSprite.playerInteractions.swordAttackGroup.get(
        0,
        0,
        slotNumber,
      );
    if (maybeSwordAttack == null) {
      return;
    }

    maybeSwordAttack.fire(
      this.playerSprite,
      this.playerSprite.flipX ? "left" : "right",
      {
        damage: this.playerSprite.playerStatsHandler.swordAttack.damage(),
        pushBack: {
          duration: 0,
          velocity: 0,
        },
      },
    );
    this.playerSprite.playerStatsHandler.swordAttack.consumeStamina();
  }

  private fireSpearAttack(slotNumber: WeaponSlotNumber) {
    if (!this.playerSprite.playerStatsHandler.spearAttack.canFire()) {
      this.playerSprite.noStamina();
      return;
    }

    const maybeSpearAttack: SpearAttack | null =
      this.playerSprite.playerInteractions.spearAttackGroup.get(
        0,
        0,
        slotNumber,
      );
    if (maybeSpearAttack == null) {
      return;
    }

    maybeSpearAttack.fire(
      this.playerSprite.x,
      this.playerSprite.y,
      this.playerSprite.flipX ? "left" : "right",
      {
        damage: this.playerSprite.playerStatsHandler.spearAttack.damage(),
        range: this.playerSprite.playerStatsHandler.spearAttack.range(),
        velocity: this.playerSprite.playerStatsHandler.spearAttack.velocity(),
        pushBack: {
          duration: 100,
          velocity: 10,
        },
      },
    );
    this.playerSprite.playerStatsHandler.spearAttack.consumeStamina();
  }

  private fireRodAttack(slotNumber: WeaponSlotNumber) {
    if (!this.playerSprite.playerStatsHandler.rodAttack.canFire()) {
      this.playerSprite.noStamina();
      return;
    }

    const maybeRodAttack: RodAttack | undefined =
      this.playerSprite.playerInteractions.rodAttackGroup.get(0, 0, slotNumber);
    if (maybeRodAttack == null) {
      return;
    }

    maybeRodAttack.fire(
      this.playerSprite,
      this.playerSprite.flipX ? "left" : "right",
      {
        damage: this.playerSprite.playerStatsHandler.rodAttack.damage(),
        pushBack: this.playerSprite.playerStatsHandler.rodAttack.pushBack(),
      },
    );
    this.playerSprite.playerStatsHandler.rodAttack.consumeStamina();
  }

  private fireShield(slotNumber: WeaponSlotNumber) {
    if (!this.playerSprite.playerStatsHandler.shield.canFire()) {
      this.playerSprite.noStamina();
      return;
    }

    const maybeShield: Shield | undefined =
      this.playerSprite.playerInteractions.shieldGroup.get(0, 0, slotNumber);
    if (maybeShield == null) {
      return;
    }

    maybeShield.fire(this.playerSprite.x, this.playerSprite.y, {
      duration: this.playerSprite.playerStatsHandler.shield.duration(),
      pushBack: this.playerSprite.playerStatsHandler.shield.pushBack(),
      direction: this.playerSprite.flipX ? "left" : "right",
      scale: this.playerSprite.playerStatsHandler.shield.scale(),
    });
    this.playerSprite.playerStatsHandler.shield.consumeStamina();
  }
}
