// RECOMP OS PRO - Comprehensive Drug Database
// Steroids, Peptides, HGH, Supplements with Complete Dosing Information

const DRUG_DATABASE = {
  steroids: {
    testosterone: {
      name: "Testosterone",
      variants: ["Enanthate", "Cypionate", "Propionate"],
      dosing: {
        trt: "100-200mg/week",
        beginner: "300-500mg/week",
        intermediate: "500-750mg/week",
        advanced: "750-1000mg/week"
      },
      benefits: ["Muscle mass", "Strength", "Recovery", "Libido"],
      sideEffects: ["Gyno risk", "Water retention", "Acne"],
      stacksWith: ["Primobolan", "Anavar", "Deca", "Masteron"],
      pct: true,
      aromatizes: true
    },
    primobolan: {
      name: "Primobolan",
      dosing: {
        beginner: "400-600mg/week",
        intermediate: "600-800mg/week",
        advanced: "800-1200mg/week"
      },
      benefits: ["Lean muscle", "Fat loss", "Low sides"],
      sideEffects: ["Hair loss risk"],
      stacksWith: ["Test", "Anavar", "Masteron"],
      pct: true,
      aromatizes: false
    },
    trenbolone: {
      name: "Trenbolone",
      dosing: {
        intermediate: "200-400mg/week",
        advanced: "400-700mg/week"
      },
      benefits: ["Extreme hardness", "Strength", "Fat loss"],
      sideEffects: ["Night sweats", "Insomnia", "Aggression"],
      warning: "Advanced only - harsh compound",
      stacksWith: ["Test", "Masteron"],
      pct: true
    },
    anavar: {
      name: "Anavar",
      dosing: {
        male: "50-100mg/day",
        female: "10-20mg/day"
      },
      benefits: ["Lean gains", "Strength", "Fat loss"],
      sideEffects: ["Mild liver stress"],
      stacksWith: ["Test", "Primo", "Masteron"],
      oral: true,
      hepatotoxic: true
    }
  },
  peptides: {
    hgh: {
      name: "Human Growth Hormone",
      dosing: {
        antiAging: "2-3 IU/day",
        fatLoss: "4-6 IU/day",
        muscle: "6-10 IU/day"
      },
      benefits: ["Fat loss", "Muscle", "Recovery", "Anti-aging"],
      sideEffects: ["Water retention", "Blood sugar"],
      stacksWith: ["Insulin", "T3", "Steroids"]
    },
    bpc157: {
      name: "BPC-157",
      dosing: "200-500mcg/day",
      benefits: ["Healing", "Tendon repair", "Gut health"],
      stacksWith: ["TB-500", "HGH"]
    },
    mk677: {
      name: "MK-677",
      dosing: "12.5-25mg/day",
      benefits: ["GH boost", "Sleep", "Appetite"],
      oral: true
    }
  },
  ancillaries: {
    arimidex: {
      name: "Arimidex",
      dosing: "0.5-1mg EOD",
      use: "Estrogen control"
    },
    nolvadex: {
      name: "Nolvadex",
      dosing: "20-40mg/day",
      use: "PCT and gyno prevention"
    },
    hcg: {
      name: "HCG",
      dosing: "250-500 IU 2x/week",
      use: "Testicular function"
    }
  },
  supplements: {
    glutathione: {
      name: "Glutathione",
      dosing: "500-1000mg/day",
      benefits: ["Antioxidant", "Liver support", "Detox"]
    }
  }
};

window.DRUG_DATABASE = DRUG_DATABASE;
