// RECOMP OS PRO - Protocol Builder
// AI-Powered Protocol Generator with Drug Interaction Checking

class ProtocolBuilder {
  constructor() {
    this.currentProtocol = {
      goal: '',
      experience: '',
      compounds: [],
      duration: 0,
      ancillaries: [],
      pct: {}
    };
  }

  // Generate protocol based on goals
  generateProtocol(userProfile) {
    const { goal, experience, bodyweight, previousCycles } = userProfile;
    
    let protocol = {
      name: `${goal} Protocol - ${experience}`,
      compounds: [],
      ancillaries: [],
      pct: {}
    };

    // Base testosterone
    protocol.compounds.push({
      drug: 'testosterone',
      variant: 'enanthate',
      dose: this.calculateTestDose(experience),
      frequency: '2x per week'
    });

    // Add compounds based on goal
    if (goal === 'bulking') {
      if (experience === 'intermediate') {
        protocol.compounds.push({
          drug: 'primobolan',
          dose: '600mg/week',
          frequency: '2x per week'
        });
      }
    } else if (goal === 'cutting') {
      protocol.compounds.push({
        drug: 'anavar',
        dose: '50-75mg/day',
        frequency: 'daily'
      });
    } else if (goal === 'recomp') {
      protocol.compounds.push({
        drug: 'primobolan',
        dose: '400-600mg/week',
        frequency: '2x per week'
      });
    }

    // Add ancillaries
    protocol.ancillaries = this.calculateAncillaries(protocol.compounds);
    protocol.pct = this.generatePCT(protocol.compounds);
    
    return protocol;
  }

  calculateTestDose(experience) {
    const doses = {
      beginner: '300-500mg/week',
      intermediate: '500-750mg/week',
      advanced: '750-1000mg/week'
    };
    return doses[experience] || doses.beginner;
  }

  calculateAncillaries(compounds) {
    let ancillaries = [];
    
    // Check for aromatizing compounds
    const aromatizing = compounds.some(c => 
      window.DRUG_DATABASE.steroids[c.drug]?.aromatizes
    );
    
    if (aromatizing) {
      ancillaries.push({
        drug: 'arimidex',
        dose: '0.5mg EOD',
        purpose: 'Estrogen control'
      });
    }

    // Always add HCG
    ancillaries.push({
      drug: 'hcg',
      dose: '250 IU 2x per week',
      purpose: 'Testicular function'
    });

    return ancillaries;
  }

  generatePCT(compounds) {
    return {
      week1_2: 'Nolvadex 40mg/day',
      week3_4: 'Nolvadex 20mg/day',
      optional: 'Clomid 50mg/day for 4 weeks'
    };
  }

  // Check drug interactions
  checkInteractions(compounds) {
    let warnings = [];
    
    // Check for multiple 19-nors
    const nors = compounds.filter(c => 
      ['trenbolone', 'deca'].includes(c.drug)
    );
    if (nors.length > 1) {
      warnings.push({
        severity: 'high',
        message: 'Multiple 19-nor compounds detected - high prolactin risk'
      });
    }

    // Check for multiple orals
    const orals = compounds.filter(c => 
      window.DRUG_DATABASE.steroids[c.drug]?.oral
    );
    if (orals.length > 1) {
      warnings.push({
        severity: 'high',
        message: 'Multiple oral steroids - severe liver damage risk'
      });
    }

    return warnings;
  }

  // Predict muscle gains
  predictGains(protocol, userStats) {
    const { bodyweight, bodyfat, previousGains } = userStats;
    
    // Simple prediction model
    const baseGain = 1.5; // lbs per week
    const compoundMultiplier = protocol.compounds.length * 0.3;
    
    return {
      weeklyGain: baseGain + compoundMultiplier,
      totalGain: (baseGain + compoundMultiplier) * 12,
      muscleGain: ((baseGain + compoundMultiplier) * 12) * 0.7,
      fatGain: ((baseGain + compoundMultiplier) * 12) * 0.3
    };
  }
}

window.ProtocolBuilder = ProtocolBuilder;
