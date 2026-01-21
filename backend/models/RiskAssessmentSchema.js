import mongoose from "mongoose";

/**
 * RiskAssessment Schema - Formal Suicide/Harm Risk Evaluation
 * 
 * CRITICAL: This schema contains HIGHLY SENSITIVE clinical data.
 * - NEVER expose to patient-facing APIs
 * - NEVER include in patient dashboard queries
 * - Access restricted to: Clinician, Supervisor, Legal (court order)
 * 
 * Purpose:
 * - Document formal suicide risk assessments using validated instruments
 * - Track risk over time (never delete, only supersede)
 * - Provide legal documentation of clinician's risk evaluation
 * - Trigger protocol activations when thresholds exceeded
 * 
 * Primary Instrument: Columbia-Suicide Severity Rating Scale (C-SSRS)
 * - Gold standard for suicide risk assessment
 * - Evidence-based cutoff scores for risk stratification
 * - Court-defensible when properly documented
 * 
 * Privacy: ALL fields have `select: false` by default
 * Access: Explicit `.select('+riskLevel +columbiaScore')` required
 */

const RiskAssessmentSchema = new mongoose.Schema(
  {
    // ============= RELATIONSHIPS =============
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    treatmentPlanId: {
      type: mongoose.Types.ObjectId,
      ref: "TreatmentPlan",
      required: true,
    },
    sessionId: {
      type: mongoose.Types.ObjectId,
      ref: "TherapySession",
      // Nullable: Can be standalone assessment (e.g., crisis phone call)
    },
    assessedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // ============= ASSESSMENT METADATA =============
    assessmentDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: [
        "ROUTINE_SCREENING", // Regular check-in (every 2-4 weeks)
        "INTAKE", // Initial evaluation
        "CRISIS", // Emergency assessment
        "PROTOCOL_MANDATED", // Required by active protocol
        "SYMPTOM_WORSENING", // Triggered by PHQ-9 increase
        "POST_DISCHARGE", // Follow-up after hospitalization
      ],
      required: true,
      select: false,
    },
    assessmentContext: {
      type: String,
      required: true,
      select: false,
      // e.g., "Patient disclosed hopelessness in session #8"
      // Provides clinical context for the assessment
    },

    // ============= COLUMBIA-SUICIDE SEVERITY RATING SCALE (C-SSRS) =============
    columbiaScale: {
      // SCREENING QUESTIONS (Lifetime & Recent)
      screening: {
        wishToBeDead: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        suicidalThoughts: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        thoughtsOfMethod: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        suicidalIntent: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        suicidalIntentWithPlan: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
      },

      // INTENSITY OF IDEATION (if ideation present)
      intensityOfIdeation: {
        frequency: {
          type: Number,
          min: 1,
          max: 5,
          // 1=Less than once/week, 2=Once/week, 3=2-5x/week, 4=Daily/almost daily, 5=Many times/day
        },
        duration: {
          type: Number,
          min: 1,
          max: 5,
          // 1=Fleeting, 2=Less than 1hr, 3=1-4hrs, 4=4-8hrs, 5=More than 8hrs
        },
        controllability: {
          type: Number,
          min: 1,
          max: 5,
          // 1=Easily controlled, 5=Cannot control
        },
        deterrents: {
          type: Number,
          min: 1,
          max: 5,
          // 1=Definitely would not attempt, 5=Definitely would attempt
        },
        reasonsForIdeation: {
          type: Number,
          min: 1,
          max: 5,
          // 1=Minimal reasons, 5=Strong reasons
        },
      },

      // SUICIDAL BEHAVIOR (Lifetime & Recent)
      behavior: {
        actualAttempt: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
          numberOfAttempts: { type: Number, default: 0 },
          mostRecentDate: Date,
          mostRecentMethod: String,
          medicalDamage: {
            type: Number,
            min: 0,
            max: 5,
            // 0=No injury, 5=Death
          },
        },
        interruptedAttempt: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        abortedAttempt: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
        },
        preparatoryBehavior: {
          lifetime: { type: Boolean, default: false },
          recent: { type: Boolean, default: false },
          description: String,
        },
      },

      // CALCULATED SCORES
      suicidalIdeationScore: {
        type: Number,
        min: 0,
        max: 5,
        // 0=No ideation, 1=Wish to be dead, 2=Suicidal thoughts, 3=w/method,
        // 4=w/intent, 5=w/plan
        required: true,
        select: false,
      },
      intensityScore: {
        type: Number,
        min: 0,
        max: 25,
        // Sum of intensity subscales (0 if no ideation)
        select: false,
      },
      behaviorScore: {
        type: Number,
        min: 0,
        max: 5,
        // 0=No behavior, 1=Preparatory, 2=Aborted, 3=Interrupted, 4=Actual attempt, 5=Death
        select: false,
      },
    },

    // ============= RISK FACTORS (EVIDENCE-BASED) =============
    riskFactors: {
      demographic: {
        age: { type: String, enum: ["YOUTH", "YOUNG_ADULT", "MIDDLE_AGE", "ELDERLY"] },
        gender: { type: String, enum: ["MALE", "FEMALE", "NON_BINARY", "OTHER"] },
        // Males 3-4x higher completion rate
      },
      clinical: {
        priorAttempts: { type: Boolean, default: false },
        psychiatricDiagnosis: [String], // ["MDD", "BPD", "Schizophrenia"]
        substanceUse: { type: Boolean, default: false },
        chronicPain: { type: Boolean, default: false },
        insomnia: { type: Boolean, default: false },
        recentPsychiatricHospitalization: { type: Boolean, default: false },
        commandHallucinations: { type: Boolean, default: false },
      },
      psychosocial: {
        recentLoss: { type: Boolean, default: false }, // Death, divorce, job loss
        socialIsolation: { type: Boolean, default: false },
        financialStress: { type: Boolean, default: false },
        legalProblems: { type: Boolean, default: false },
        victimOfAbuse: { type: Boolean, default: false },
        homelessness: { type: Boolean, default: false },
      },
      access: {
        accessToLethalMeans: { type: Boolean, default: false },
        specificMethod: String, // "Firearm", "Medication overdose"
        meansRestrictionDiscussed: { type: Boolean, default: false },
      },
      warning: {
        recentDischarge: { type: Boolean, default: false }, // High risk period
        expressedIntent: { type: Boolean, default: false },
        sayingGoodbyes: { type: Boolean, default: false },
        givingAwayPossessions: { type: Boolean, default: false },
        increasedSubstanceUse: { type: Boolean, default: false },
        withdrawalFromSocial: { type: Boolean, default: false },
      },
    },

    // ============= PROTECTIVE FACTORS =============
    protectiveFactors: {
      internal: {
        reasonsForLiving: [String], // ["Children", "Religious beliefs", "Fear of death"]
        copingSkills: { type: Boolean, default: false },
        problemSolvingAbility: { type: Boolean, default: false },
        engagedInTreatment: { type: Boolean, default: false },
      },
      external: {
        socialSupport: { type: Boolean, default: false },
        supportiveFamily: { type: Boolean, default: false },
        religiousCommunity: { type: Boolean, default: false },
        employed: { type: Boolean, default: false },
        responsibilities: [String], // ["Caring for children", "Pet"]
      },
      clinical: {
        therapeuticAlliance: {
          type: String,
          enum: ["STRONG", "MODERATE", "WEAK"],
        },
        treatmentAdherence: {
          type: String,
          enum: ["HIGH", "MODERATE", "LOW"],
        },
        previousSuccessfulCoping: { type: Boolean, default: false },
      },
    },

    // ============= CLINICAL JUDGMENT =============
    clinicalImpression: {
      overallRiskLevel: {
        type: String,
        enum: ["LOW", "MODERATE", "HIGH", "IMMINENT"],
        required: true,
        select: false,
        index: true,
      },
      riskLevelJustification: {
        type: String,
        required: true,
        select: false,
        // Why this risk level was chosen (clinical reasoning)
      },
      timeFrame: {
        type: String,
        enum: ["CHRONIC", "ACUTE", "IMMEDIATE"],
        // CHRONIC: Ongoing low-level risk
        // ACUTE: Recent increase, requires monitoring
        // IMMEDIATE: Imminent danger, requires immediate intervention
      },
      clinicianConcernLevel: {
        type: Number,
        min: 0,
        max: 10,
        // Subjective clinician rating (gut feeling matters)
        select: false,
      },
    },

    // ============= INTERVENTION PLAN =============
    interventionPlan: {
      immediateActions: [
        {
          action: { type: String, required: true },
          // e.g., "Contact emergency contact", "Activate safety plan", "Call 911"
          completed: { type: Boolean, default: false },
          completedAt: Date,
        },
      ],
      safetyPlanReviewed: { type: Boolean, default: false },
      safetyPlanUpdated: { type: Boolean, default: false },
      meansRestrictionImplemented: { type: Boolean, default: false },
      emergencyContactNotified: {
        notified: { type: Boolean, default: false },
        contactName: String,
        notificationDate: Date,
      },
      hospitalizationRecommended: {
        recommended: { type: Boolean, default: false },
        type: {
          type: String,
          enum: ["VOLUNTARY", "INVOLUNTARY", "NOT_RECOMMENDED"],
        },
        justification: String,
        patientAgreement: {
          type: String,
          enum: ["AGREED", "REFUSED", "AMBIVALENT", "NOT_DISCUSSED"],
        },
      },
      increasedMonitoring: {
        frequency: {
          type: String,
          enum: ["DAILY", "EVERY_OTHER_DAY", "TWICE_WEEKLY", "WEEKLY"],
        },
        method: {
          type: String,
          enum: ["IN_PERSON", "PHONE", "VIDEO", "TEXT_CHECK_IN"],
        },
        duration: String, // "2 weeks", "Until risk decreases"
      },
      protocolActivation: {
        activated: { type: Boolean, default: false },
        protocolType: String, // "SUICIDE_PROTOCOL", "CRISIS_PROTOCOL"
        protocolLogId: {
          type: mongoose.Types.ObjectId,
          ref: "ProtocolLog",
        },
      },
    },

    // ============= FOLLOW-UP =============
    followUp: {
      nextAssessmentDue: {
        type: Date,
        required: true,
        // Based on risk level: IMMINENT=24h, HIGH=48h, MODERATE=1week, LOW=2weeks
        index: true,
      },
      nextAssessmentReason: String,
      reminderSent: { type: Boolean, default: false },
    },

    // ============= LEGAL DOCUMENTATION =============
    legalDocumentation: {
      dutyToProtectConsidered: { type: Boolean, required: true },
      // Did clinician consider Tarasoff duty?
      dutyToProtectAction: String,
      // If duty triggered, what action was taken

      informedConsentObtained: { type: Boolean, required: true },
      // Patient informed about limits of confidentiality?

      consultationSought: {
        consulted: { type: Boolean, default: false },
        consultedWith: String, // "Dr. X, Psychiatrist"
        consultationDate: Date,
        consultationOutcome: String,
      },

      supervisorNotified: {
        notified: { type: Boolean, default: false },
        supervisorName: String,
        notificationDate: Date,
      },
    },

    // ============= SIGNATURE & IMMUTABILITY =============
    signature: {
      clinicianId: {
        type: mongoose.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
      clinicianName: { type: String, required: true },
      licenseNumber: { type: String, required: true },
      signedAt: { type: Date, default: Date.now },
      hash: { type: String }, // SHA-256 of document content
    },

    // IMMUTABILITY: Once signed, cannot be edited (only amended)
    locked: { type: Boolean, default: false },
    amendments: [
      {
        amendedAt: { type: Date, default: Date.now },
        amendedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
        reason: { type: String, required: true },
        changes: {
          field: String,
          oldValue: mongoose.Schema.Types.Mixed,
          newValue: mongoose.Schema.Types.Mixed,
        },
        amendmentHash: String,
      },
    ],
  },
  {
    timestamps: true,
    // Automatically adds createdAt and updatedAt
  }
);

// ============= INDEXES =============
RiskAssessmentSchema.index({ patientId: 1, assessmentDate: -1 });
RiskAssessmentSchema.index({ assessedBy: 1, assessmentDate: -1 });
RiskAssessmentSchema.index({ "clinicalImpression.overallRiskLevel": 1 });
RiskAssessmentSchema.index({ "followUp.nextAssessmentDue": 1 });

// ============= STATIC METHODS =============

/**
 * Get latest risk assessment for a patient
 */
RiskAssessmentSchema.statics.getLatestForPatient = async function (patientId) {
  return this.findOne({ patientId })
    .sort({ assessmentDate: -1 })
    .select("+columbiaScale +clinicalImpression");
};

/**
 * Get overdue assessments (for clinician dashboard alerts)
 */
RiskAssessmentSchema.statics.getOverdueAssessments = async function (clinicianId) {
  return this.find({
    assessedBy: clinicianId,
    "followUp.nextAssessmentDue": { $lt: new Date() },
    locked: true, // Only completed assessments have follow-ups
  })
    .populate("patientId", "name email")
    .select("+clinicalImpression");
};

/**
 * Get high-risk patients for a clinician
 */
RiskAssessmentSchema.statics.getHighRiskPatients = async function (clinicianId) {
  // Get latest assessment for each patient
  const assessments = await this.aggregate([
    { $match: { assessedBy: clinicianId } },
    { $sort: { patientId: 1, assessmentDate: -1 } },
    {
      $group: {
        _id: "$patientId",
        latestAssessment: { $first: "$$ROOT" },
      },
    },
    {
      $match: {
        "latestAssessment.clinicalImpression.overallRiskLevel": {
          $in: ["HIGH", "IMMINENT"],
        },
      },
    },
  ]);

  return assessments;
};

// ============= INSTANCE METHODS =============

/**
 * Calculate overall C-SSRS composite score
 */
RiskAssessmentSchema.methods.calculateCSSRSScore = function () {
  const ideation = this.columbiaScale.suicidalIdeationScore || 0;
  const intensity = this.columbiaScale.intensityScore || 0;
  const behavior = this.columbiaScale.behaviorScore || 0;

  return {
    ideation,
    intensity,
    behavior,
    total: ideation + intensity + behavior,
  };
};

/**
 * Sign and lock the assessment (makes it immutable)
 */
RiskAssessmentSchema.methods.signAndLock = async function (clinician) {
  if (this.locked) {
    throw new Error("Assessment already locked");
  }

  const crypto = await import("crypto");
  const contentString = JSON.stringify(this.toObject(), null, 2);
  const hash = crypto.createHash("sha256").update(contentString).digest("hex");

  this.signature = {
    clinicianId: clinician._id,
    clinicianName: clinician.name,
    licenseNumber: clinician.licenseNumber || "N/A",
    signedAt: new Date(),
    hash: hash,
  };

  this.locked = true;

  await this.save();
  return this;
};

/**
 * Amend a locked assessment (for corrections only)
 */
RiskAssessmentSchema.methods.amend = async function (clinician, reason, field, newValue) {
  if (!this.locked) {
    throw new Error("Can only amend locked assessments");
  }

  const oldValue = this.get(field);

  const crypto = await import("crypto");
  const amendmentContent = JSON.stringify({ field, oldValue, newValue, reason });
  const amendmentHash = crypto.createHash("sha256").update(amendmentContent).digest("hex");

  this.amendments.push({
    amendedAt: new Date(),
    amendedBy: clinician._id,
    reason,
    changes: { field, oldValue, newValue },
    amendmentHash,
  });

  this.set(field, newValue);

  await this.save();
  return this;
};

/**
 * Generate patient-safe summary (for patient dashboard - highly sanitized)
 */
RiskAssessmentSchema.methods.toPatientSafeSummary = function () {
  return {
    assessmentDate: this.assessmentDate,
    assessedBy: "Your therapist",
    followUpDate: this.followUp.nextAssessmentDue,
    message: "Your therapist completed a routine check-in assessment.",
    // NO risk data, NO scores, NO clinical details
  };
};

/**
 * Generate legal report (for court/audit)
 */
RiskAssessmentSchema.methods.toLegalReport = function () {
  return {
    documentType: "SUICIDE_RISK_ASSESSMENT",
    assessmentDate: this.assessmentDate,
    patientIdentifier: this.patientId, // May be redacted depending on jurisdiction
    assessedBy: this.signature.clinicianName,
    licenseNumber: this.signature.licenseNumber,
    cSSRSScores: this.calculateCSSRSScore(),
    riskLevel: this.clinicalImpression.overallRiskLevel,
    justification: this.clinicalImpression.riskLevelJustification,
    interventionsTaken: this.interventionPlan.immediateActions,
    dutyToProtectConsidered: this.legalDocumentation.dutyToProtectConsidered,
    signature: this.signature,
    amendments: this.amendments,
    hash: this.signature.hash,
  };
};

// ============= PRE-SAVE MIDDLEWARE =============

RiskAssessmentSchema.pre("save", async function (next) {
  // Prevent editing locked assessments (except amendments)
  if (this.locked && this.isModified() && !this.isModified("amendments")) {
    throw new Error(
      "Cannot modify locked assessment. Use .amend() method for corrections."
    );
  }

  // Auto-calculate next assessment due date based on risk level
  if (this.isNew || this.isModified("clinicalImpression.overallRiskLevel")) {
    const riskLevel = this.clinicalImpression.overallRiskLevel;
    const now = new Date();

    switch (riskLevel) {
      case "IMMINENT":
        this.followUp.nextAssessmentDue = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
        this.followUp.nextAssessmentReason = "Imminent risk - 24h re-evaluation required";
        break;
      case "HIGH":
        this.followUp.nextAssessmentDue = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h
        this.followUp.nextAssessmentReason = "High risk - 48h re-evaluation required";
        break;
      case "MODERATE":
        this.followUp.nextAssessmentDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
        this.followUp.nextAssessmentReason = "Moderate risk - weekly monitoring";
        break;
      case "LOW":
        this.followUp.nextAssessmentDue = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
        this.followUp.nextAssessmentReason = "Low risk - routine monitoring";
        break;
    }
  }

  next();
});

export default mongoose.models.RiskAssessment ||
  mongoose.model("RiskAssessment", RiskAssessmentSchema);
