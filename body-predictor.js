// RECOMP OS PRO - Body Composition Predictor
// Predict muscle gains, fat loss, and body changes based on protocol

class BodyPredictor {
  constructor() {
    this.drugEfficiencyRatings = {
      testosterone: 1.0,
      primobolan: 0.7,
      trenbolone: 1.8,
      anavar: 0.5,
      deca: 1.2,
      masteron: 0.6,
      winstrol: 0.4,
      hgh: 0.8
    };
  }

  // Predict body composition changes
  predictCycle(protocol, currentStats, cycleLengthWeeks = 12) {
    const { bodyweight, bodyfat, height, age, experience } = currentStats;
    
    // Calculate compound power
    let compoundPower = 0;
    protocol.compounds.forEach(compound => {
      const rating = this.drugEfficiencyRatings[compound.drug] || 0.5;
      compoundPower += rating;
    });

    // Calculate base gains (experience dependent)
    const experienceMultiplier = {
      beginner: 1.5,
      intermediate: 1.2,
      advanced: 1.0,
      expert: 0.8
    }[experience] || 1.0;

    // Weekly muscle gain potential (lbs)
    const weeklyMuscleGain = (0.5 * compoundPower * experienceMultiplier);
    
    // Total cycle predictions
    const totalMuscleGain = weeklyMuscleGain * cycleLengthWeeks;
    const totalFatChange = this.calculateFatChange(protocol, cycleLengthWeeks);
    const totalWeightChange = totalMuscleGain + totalFatChange;

    const finalWeight = bodyweight + totalWeightChange;
    const finalLeanMass = (bodyweight * (1 - bodyfat/100)) + totalMuscleGain;
    const finalFatMass = (bodyweight * (bodyfat/100)) + totalFatChange;
    const finalBodyfat = (finalFatMass / finalWeight) * 100;

    return {
      current: {
        weight: bodyweight,
        bodyfat: bodyfat,
        leanMass: bodyweight * (1 - bodyfat/100),
        fatMass: bodyweight * (bodyfat/100)
      },
      predicted: {
        weight: finalWeight,
        bodyfat: finalBodyfat,
        leanMass: finalLeanMass,
        fatMass: finalFatMass
      },
      changes: {
        totalWeight: totalWeightChange,
        muscle: totalMuscleGain,
        fat: totalFatChange,
        weeklyMuscle: weeklyMuscleGain
      },
      timeline: this.generateTimeline(currentStats, totalMuscleGain, totalFatChange, cycleLengthWeeks)
    };
  }

  calculateFatChange(protocol, weeks) {
    // Compounds like Tren, Masteron, Anavar promote fat loss
    const fatLossCompounds = ['trenbolone', 'masteron', 'anavar', 'winstrol'];
    const hasFatLossCompounds = protocol.compounds.some(c => 
      fatLossCompounds.includes(c.drug)
    );

    if (hasFatLossCompounds) {
      return -(weeks * 0.5); // Lose 0.5 lbs fat per week
    }
    return weeks * 0.25; // Gain slight fat on bulk
  }

  generateTimeline(currentStats, totalMuscle, totalFat, weeks) {
    const timeline = [];
    const { bodyweight, bodyfat } = currentStats;
    
    for (let week = 0; week <= weeks; week++) {
      const progress = week / weeks;
      const muscleGained = totalMuscle * progress;
      const fatChanged = totalFat * progress;
      
      const currentWeight = bodyweight + muscleGained + fatChanged;
      const currentLean = (bodyweight * (1 - bodyfat/100)) + muscleGained;
      const currentFat = (bodyweight * (bodyfat/100)) + fatChanged;
      const currentBF = (currentFat / currentWeight) * 100;

      timeline.push({
        week,
        weight: Math.round(currentWeight * 10) / 10,
        bodyfat: Math.round(currentBF * 10) / 10,
        leanMass: Math.round(currentLean * 10) / 10,
        muscleGained: Math.round(muscleGained * 10) / 10
      });
    }

    return timeline;
  }

  // Calculate ideal protocol based on goal
  calculateIdealProtocol(currentStats, goalStats) {
    const { bodyweight: currentWeight, bodyfat: currentBF } = currentStats;
    const { bodyweight: goalWeight, bodyfat: goalBF } = goalStats;

    const weightDiff = goalWeight - currentWeight;
    const currentLean = currentWeight * (1 - currentBF/100);
    const goalLean = goalWeight * (1 - goalBF/100);
    const muscleToBuild = goalLean - currentLean;

    return {
      muscleToBuild,
      weightToGain: weightDiff,
      fatToLose: (currentWeight * (currentBF/100)) - (goalWeight * (goalBF/100)),
      estimatedWeeks: Math.ceil(muscleToBuild / 1.5),
      recommendedApproach: this.getRecommendedApproach(muscleToBuild, weightDiff)
    };
  }

  getRecommendedApproach(muscleToBuild, weightDiff) {
    if (muscleToBuild > 15 && weightDiff > 0) {
      return {
        phase: 'Bulk',
        compounds: ['testosterone', 'primobolan'],
        duration: '16-20 weeks',
        surplus: '+500 calories'
      };
    } else if (weightDiff < 0) {
      return {
        phase: 'Cut',
        compounds: ['testosterone', 'anavar', 'masteron'],
        duration: '12-16 weeks',
        deficit: '-500 calories'
      };
    } else {
      return {
        phase: 'Recomp',
        compounds: ['testosterone', 'primobolan', 'hgh'],
        duration: '20+ weeks',
        maintenance: 'At maintenance calories'
      };
    }
  }
}

window.BodyPredictor = BodyPredictor;
