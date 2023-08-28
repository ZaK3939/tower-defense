import { useGame, useScene, useSceneUpdate } from "phaser-react-ui";
import React, { useEffect, useState } from "react";

import { Hint } from "@scene/system/interface/hint";
import { IGame } from "@type/game";
import { TutorialStep } from "@type/tutorial";
import { BuildingVariant } from "@type/world/entities/building";

import { BuilderInfo } from "./info";
import { BuilderPreview } from "./preview";
import { Variant, Info, Wrapper } from "./styles";
import { WaveEvents } from "@type/world/wave";
import { GameScene } from "@type/game";
import { IWorld } from "@type/world";

export const Builder: React.FC = () => {
  const game = useGame<IGame>();
  const world = useScene<IWorld>(GameScene.WORLD);

  const [hint, setHint] = useState<
    Nullable<{
      variant: BuildingVariant;
      text: string;
    }>
  >(null);

  // check for wave is Going
  const [isGoing, setIsGoing] = useState<boolean>(false);

  const showHint = (step: TutorialStep) => {
    switch (step) {
      case TutorialStep.BUILD_STAKING: {
        return setHint({
          variant: BuildingVariant.STAKING,
          text: "Build staking tower to get ethereum",
        });
      }
      case TutorialStep.BUILD_RADAR: {
        return setHint({
          variant: BuildingVariant.RADAR,
          text: "Build radar to uncover enemies",
        });
      }
      case TutorialStep.BUILD_TOWER_FIRE: {
        return setHint({
          variant: BuildingVariant.TOWER_FIRE,
          text: "Build tower to attack enemies",
        });
      }
      case TutorialStep.BUILD_AMMUNITION: {
        return setHint({
          variant: BuildingVariant.AMMUNITION,
          text: "Build ammunition to reload towers",
        });
      }
    }
  };

  const hideHint = (step: TutorialStep) => {
    switch (step) {
      case TutorialStep.BUILD_STAKING:
      case TutorialStep.BUILD_RADAR:
      case TutorialStep.BUILD_TOWER_FIRE:
      case TutorialStep.BUILD_AMMUNITION: {
        return setHint(null);
      }
    }
  };

  useEffect(
    () =>
      game.tutorial.bindAll({
        beg: showHint,
        end: hideHint,
      }),
    []
  );

  useSceneUpdate(world, () => {
    const waveIsGoing = world.wave.isGoing;
    setIsGoing(waveIsGoing);
  });

  return !isGoing ? (
    <Wrapper>
      {Object.values(BuildingVariant).map((variant, index) => (
        <Variant key={variant}>
          {hint?.variant === variant && <Hint side="right">{hint.text}</Hint>}

          <Info>
            <BuilderInfo variant={variant} />
          </Info>

          <BuilderPreview variant={variant} number={index + 1} />
        </Variant>
      ))}
    </Wrapper>
  ) : null;
};
