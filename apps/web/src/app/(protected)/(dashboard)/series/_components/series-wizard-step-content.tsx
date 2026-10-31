"use client";

import * as React from "react";

import { useSeriesWizard } from "../_context/series-wizard-context";
import { StepEightDetails } from "./step-eight-details";
import { StepFiveCaptionStyle } from "./step-five-caption-style";
import { StepFourArtStyle } from "./step-four-art-style";
import { StepOneNiche } from "./step-one-niche";
import { StepSevenSocialAccounts } from "./step-seven-social-accounts";
import { StepSixEffects } from "./step-six-effects";
import { StepThreeMusic } from "./step-three-music";
import { StepTwoVoice } from "./step-two-voice";

export const SeriesWizardStepContent = () => {
  const { currentStep } = useSeriesWizard();

  switch (currentStep) {
    case 1: {
      return <StepOneNiche />;
    }

    case 2: {
      return <StepTwoVoice />;
    }

    case 3: {
      return <StepThreeMusic />;
    }

    case 4: {
      return <StepFourArtStyle />;
    }

    case 5: {
      return <StepFiveCaptionStyle />;
    }

    case 6: {
      return <StepSixEffects />;
    }

    case 7: {
      return <StepSevenSocialAccounts />;
    }

    case 8: {
      return <StepEightDetails />;
    }

    default: {
      return null;
    }
  }
};
