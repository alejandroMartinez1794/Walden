import mongoose from "mongoose";

/**
 * SafetyPlan Schema - Crisis Intervention Plan for Patients
 * 
 * Purpose:
 * - Provide patients with a concrete plan for managing suicidal crises
 * - Evidence-based structure follows Stanley & Brown (2012) Safety Planning Intervention
 * - Collaborative document created WITH patient (not FOR patient)
 * - Accessible to patient 24/7 via patient dashboard
 * 
 * Privacy Considerations:
 * - Patient CAN view their own safety plan
 * - Clinician has full edit access
 * - Contains sensitive information (emergency contacts, coping strategies)
 * - Should be exportable as PDF for patient to keep offline
 * 
 * Clinical Best Practice:
 * - Created during intake or when risk first identified
 * - Reviewed/updated whenever risk level changes
 * - Practiced in session (role-play using the plan)
 * - Printed copy given to patient + digital access
 * 
 * Legal Considerations:
 * - Having a safety plan is a protective factor (demonstrates duty of care)
 * - Version history tracked (if plan was updated before adverse event)
 * - Patient acknowledgment logged (patient aware of plan)
 */

const SafetyPlanSchema = new mongoose.Schema(
  {
    // ============= RELATIONSHIPS =============
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One active safety plan per patient
      index: true,
    },
    treatmentPlanId: {
      type: mongoose.Types.ObjectId,
      ref: "TreatmentPlan",
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },

    // ============= VERSION CONTROL =============
    versionNumber: {
      type: Number,
      default: 1,
      // Increment on each update (for tracking which version was active when)
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "SUPERSEDED", "ARCHIVED"],
      default: "DRAFT",
    },
    activatedAt: Date, // When status changed to ACTIVE
    supersededAt: Date, // When replaced by newer version

    // ============= STEP 1: RECOGNIZE WARNING SIGNS =============
    // Patient-specific indicators that a crisis is developing
    warningSignals: [
      {
        signal: {
          type: String,
          required: true,
          trim: true,
          // e.g., "Feeling like a burden to others", "Insomnia for 2+ nights"
        },
        category: {
          type: String,
          enum: ["THOUGHT", "EMOTION", "BEHAVIOR", "PHYSICAL"],
          // Helps patient recognize different types of signals
        },
        patientExample: String,
        // Patient's own words: "When I start thinking everyone would be better off without me"
      },
    ],

    // ============= STEP 2: INTERNAL COPING STRATEGIES =============
    // Things patient can do alone, without contacting anyone
    internalCopingStrategies: [
      {
        strategy: {
          type: String,
          required: true,
          trim: true,
          // e.g., "Go for a 15-minute walk", "Take a hot shower", "Listen to calming music"
        },
        category: {
          type: String,
          enum: ["PHYSICAL", "COGNITIVE", "SENSORY", "CREATIVE", "SPIRITUAL"],
        },
        effectiveness: {
          type: Number,
          min: 0,
          max: 10,
          // Patient-rated: How helpful is this? (updated over time)
        },
        lastUsed: Date,
        notes: String,
        // Patient reflections: "This works best when I do it outside"
      },
    ],

    // ============= STEP 3: SOCIAL CONTACTS FOR DISTRACTION =============
    // People/places for distraction (NOT crisis support yet)
    socialDistraction: [
      {
        contactType: {
          type: String,
          enum: ["PERSON", "PLACE", "ACTIVITY"],
        },
        person: {
          name: String,
          relationship: String, // "Friend", "Sibling", "Coworker"
          phone: String,
          availability: String, // "Weekday evenings", "Anytime"
        },
        place: {
          name: String, // "Coffee shop on Main St", "Public library"
          address: String,
          hours: String,
        },
        activity: {
          description: String, // "Attend AA meeting", "Go to gym"
          schedule: String,
        },
        notes: String,
        // "Call Maria to chat about her kids - she doesn't need to know I'm in crisis"
      },
    ],

    // ============= STEP 4: FAMILY/FRIENDS FOR HELP =============
    // People who CAN be told about the crisis
    supportContacts: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        relationship: {
          type: String,
          required: true,
          // "Spouse", "Parent", "Best friend", "Pastor"
        },
        phone: {
          type: String,
          required: true,
        },
        alternatePhone: String,
        email: String,
        availability: String,
        specialNotes: String,
        // "Mom knows about my depression; she's supportive"
        priority: {
          type: Number,
          min: 1,
          // 1 = first person to call, 2 = second, etc.
        },
        consentToContact: {
          type: Boolean,
          default: true,
          // Patient consents to clinician contacting this person if needed
        },
      },
    ],

    // ============= STEP 5: PROFESSIONAL CONTACTS =============
    // Clinicians and crisis services
    professionalContacts: {
      therapist: {
        name: String, // Auto-populated from Doctor
        phone: String,
        emergencyPhone: String, // After-hours crisis line
        email: String,
        availability: String, // "Mon-Fri 9am-5pm"
      },
      psychiatrist: {
        name: String,
        phone: String,
        notes: String,
      },
      crisisLines: [
        {
          name: {
            type: String,
            required: true,
            default: "National Suicide Prevention Lifeline",
          },
          phone: {
            type: String,
            required: true,
            default: "988", // US hotline
          },
          availability: {
            type: String,
            default: "24/7",
          },
          textOption: String, // "Text HOME to 741741"
          language: [String], // ["English", "Spanish"]
        },
      ],
      emergencyServices: {
        phone: {
          type: String,
          default: "911",
        },
        nearestER: {
          name: String,
          address: String,
          phone: String,
        },
      },
    },

    // ============= STEP 6: MEANS RESTRICTION =============
    // Making the environment safer
    meansRestriction: {
      lethalMeansIdentified: [
        {
          itemType: {
            type: String,
            enum: ["FIREARM", "MEDICATION", "SHARP_OBJECT", "OTHER"],
          },
          description: String,
          restrictionPlan: {
            type: String,
            required: true,
            // "Gun stored at friend's house", "Medications managed by spouse"
          },
          implemented: {
            type: Boolean,
            default: false,
          },
          implementedDate: Date,
          verifiedBy: String, // "Patient confirmed in session 3/15"
        },
      ],
      environmentalSafety: {
        reducedAlcoholAccess: { type: Boolean, default: false },
        medicationManagement: {
          inPlace: { type: Boolean, default: false },
          manager: String, // Who dispenses medications
        },
        safetyChecks: {
          frequency: String, // "Spouse checks in daily"
          checkInWith: String,
        },
      },
    },

    // ============= REASONS FOR LIVING =============
    // Protective factors (not part of standard safety plan, but helpful)
    reasonsForLiving: [
      {
        reason: String,
        importance: {
          type: Number,
          min: 1,
          max: 10,
        },
        // "My children need me", "I want to see my granddaughter graduate"
      },
    ],

    // ============= PATIENT ENGAGEMENT =============
    patientAcknowledgment: {
      acknowledged: {
        type: Boolean,
        default: false,
        // Patient confirmed they reviewed and understand the plan
      },
      acknowledgedAt: Date,
      signatureMethod: {
        type: String,
        enum: ["VERBAL", "DIGITAL_SIGNATURE", "IN_PERSON"],
      },
      comments: String,
      // Patient feedback: "This feels doable", "I'm not sure about calling my mom"
    },

    // ============= USAGE TRACKING =============
    usageHistory: [
      {
        usedAt: {
          type: Date,
          default: Date.now,
        },
        reportedBy: {
          type: String,
          enum: ["PATIENT_SELF_REPORT", "FAMILY_REPORT", "CLINICIAN_OBSERVATION"],
        },
        stepsUsed: [String],
        // ["Internal coping strategies", "Called support contact"]
        outcome: {
          type: String,
          enum: ["CRISIS_AVERTED", "HOSPITALIZATION", "ER_VISIT", "MANAGED_AT_HOME"],
        },
        effectiveness: {
          type: Number,
          min: 0,
          max: 10,
          // How helpful was the plan?
        },
        patientReflection: String,
        // "Calling my sister really helped calm me down"
        clinicianFollowUp: String,
      },
    ],

    // ============= REVIEW SCHEDULE =============
    reviewSchedule: {
      lastReviewedAt: Date,
      nextReviewDue: {
        type: Date,
        // Should be reviewed: at intake, when risk changes, every 3-6 months minimum
      },
      reviewFrequency: {
        type: String,
        enum: ["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "AS_NEEDED"],
        default: "QUARTERLY",
      },
    },

    // ============= VERSION HISTORY =============
    // When plan is updated, old version moved here
    previousVersions: [
      {
        versionNumber: Number,
        supersededAt: Date,
        content: mongoose.Schema.Types.Mixed,
        // Snapshot of entire plan at that version
        changeReason: String,
        // "Updated after patient disclosed new stressor"
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ============= INDEXES =============
SafetyPlanSchema.index({ patientId: 1, status: 1 });
SafetyPlanSchema.index({ createdBy: 1 });
SafetyPlanSchema.index({ "reviewSchedule.nextReviewDue": 1 });

// ============= STATIC METHODS =============

/**
 * Get active safety plan for a patient
 */
SafetyPlanSchema.statics.getActiveForPatient = async function (patientId) {
  return this.findOne({ patientId, status: "ACTIVE" });
};

/**
 * Get plans due for review (for clinician dashboard)
 */
SafetyPlanSchema.statics.getDueForReview = async function (clinicianId) {
  return this.find({
    createdBy: clinicianId,
    status: "ACTIVE",
    "reviewSchedule.nextReviewDue": { $lt: new Date() },
  }).populate("patientId", "name");
};

// ============= INSTANCE METHODS =============

/**
 * Update the safety plan (creates new version)
 */
SafetyPlanSchema.methods.updatePlan = async function (updates, clinician, reason) {
  // Archive current version
  this.previousVersions.push({
    versionNumber: this.versionNumber,
    supersededAt: new Date(),
    content: this.toObject(),
    changeReason: reason,
  });

  // Apply updates
  Object.assign(this, updates);

  // Increment version
  this.versionNumber += 1;
  this.lastUpdatedBy = clinician._id;

  // Reset patient acknowledgment (they need to review new version)
  this.patientAcknowledgment.acknowledged = false;
  this.patientAcknowledgment.acknowledgedAt = null;

  // Update review schedule
  this.reviewSchedule.lastReviewedAt = new Date();
  const nextReview = new Date();
  nextReview.setMonth(nextReview.getMonth() + 3); // 3 months from now
  this.reviewSchedule.nextReviewDue = nextReview;

  await this.save();
  return this;
};

/**
 * Activate a draft plan
 */
SafetyPlanSchema.methods.activate = async function () {
  if (this.status !== "DRAFT") {
    throw new Error("Can only activate draft plans");
  }

  this.status = "ACTIVE";
  this.activatedAt = new Date();

  // Set initial review schedule
  const nextReview = new Date();
  nextReview.setMonth(nextReview.getMonth() + 3); // Review in 3 months
  this.reviewSchedule.nextReviewDue = nextReview;

  await this.save();
  return this;
};

/**
 * Log usage of the plan (when patient reports using it)
 */
SafetyPlanSchema.methods.logUsage = async function (usageData) {
  this.usageHistory.push({
    usedAt: usageData.usedAt || new Date(),
    reportedBy: usageData.reportedBy || "PATIENT_SELF_REPORT",
    stepsUsed: usageData.stepsUsed,
    outcome: usageData.outcome,
    effectiveness: usageData.effectiveness,
    patientReflection: usageData.patientReflection,
    clinicianFollowUp: usageData.clinicianFollowUp,
  });

  await this.save();
  return this;
};

/**
 * Generate patient-facing view (full access)
 */
SafetyPlanSchema.methods.toPatientView = function () {
  return {
    versionNumber: this.versionNumber,
    warningSignals: this.warningSignals,
    internalCopingStrategies: this.internalCopingStrategies,
    socialDistraction: this.socialDistraction,
    supportContacts: this.supportContacts,
    professionalContacts: this.professionalContacts,
    meansRestriction: {
      // Sanitized view (don't reveal specific lethal means details)
      safetyMeasuresInPlace: this.meansRestriction.lethalMeansIdentified.some(
        (item) => item.implemented
      ),
      environmentalSafety: this.meansRestriction.environmentalSafety,
    },
    reasonsForLiving: this.reasonsForLiving,
    lastUpdated: this.updatedAt,
    nextReview: this.reviewSchedule.nextReviewDue,
    acknowledgedByYou: this.patientAcknowledgment.acknowledged,
  };
};

/**
 * Generate printable PDF-ready format
 */
SafetyPlanSchema.methods.toPrintableFormat = function () {
  return {
    title: "My Safety Plan",
    subtitle: "A plan for when I'm having thoughts of suicide",
    steps: [
      {
        stepNumber: 1,
        title: "Warning Signs",
        description:
          "These are signs that a crisis may be developing. If I notice these, I should use my safety plan.",
        items: this.warningSignals.map((s) => s.signal),
      },
      {
        stepNumber: 2,
        title: "Internal Coping Strategies",
        description:
          "Things I can do to take my mind off my problems without contacting anyone.",
        items: this.internalCopingStrategies.map((s) => s.strategy),
      },
      {
        stepNumber: 3,
        title: "People and Social Settings",
        description:
          "People I can be around or places I can go for distraction (I don't need to tell them about the crisis).",
        items: [
          ...this.socialDistraction
            .filter((s) => s.contactType === "PERSON")
            .map((s) => `${s.person.name} - ${s.person.phone}`),
          ...this.socialDistraction
            .filter((s) => s.contactType === "PLACE")
            .map((s) => s.place.name),
        ],
      },
      {
        stepNumber: 4,
        title: "People I Can Ask for Help",
        description: "People I can tell about my crisis and ask for support.",
        items: this.supportContacts
          .sort((a, b) => a.priority - b.priority)
          .map((c) => `${c.name} (${c.relationship}) - ${c.phone}`),
      },
      {
        stepNumber: 5,
        title: "Professionals and Crisis Services",
        description: "Mental health professionals and crisis lines I can contact.",
        items: [
          `My therapist: ${this.professionalContacts.therapist.phone}`,
          ...this.professionalContacts.crisisLines.map((c) => `${c.name}: ${c.phone}`),
          `Emergency: ${this.professionalContacts.emergencyServices.phone}`,
        ],
      },
      {
        stepNumber: 6,
        title: "Making My Environment Safe",
        description: "Actions I've taken to reduce access to lethal means.",
        items: this.meansRestriction.lethalMeansIdentified
          .filter((m) => m.implemented)
          .map((m) => m.restrictionPlan),
      },
    ],
    reasonsForLiving: this.reasonsForLiving.map((r) => r.reason),
    footer: `Created: ${this.createdAt.toLocaleDateString()} | Last Updated: ${this.updatedAt.toLocaleDateString()}`,
  };
};

/**
 * Patient acknowledges the plan
 */
SafetyPlanSchema.methods.acknowledgeByPatient = async function (signatureMethod, comments) {
  this.patientAcknowledgment = {
    acknowledged: true,
    acknowledgedAt: new Date(),
    signatureMethod: signatureMethod || "DIGITAL_SIGNATURE",
    comments: comments || "",
  };

  await this.save();
  return this;
};

// ============= PRE-SAVE MIDDLEWARE =============

SafetyPlanSchema.pre("save", async function (next) {
  // Auto-populate therapist contact info
  if (this.isNew || this.isModified("createdBy")) {
    const Doctor = mongoose.model("Doctor");
    const therapist = await Doctor.findById(this.createdBy).select("name phone email");

    if (therapist) {
      this.professionalContacts.therapist = {
        name: therapist.name,
        phone: therapist.phone,
        email: therapist.email,
        availability: "Mon-Fri 9am-5pm", // Default, can be customized
      };
    }
  }

  // Ensure crisis lines are populated with defaults
  if (this.isNew && this.professionalContacts.crisisLines.length === 0) {
    this.professionalContacts.crisisLines = [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        availability: "24/7",
        textOption: "Text HOME to 741741",
        language: ["English", "Spanish"],
      },
    ];
  }

  next();
});

export default mongoose.models.SafetyPlan || mongoose.model("SafetyPlan", SafetyPlanSchema);
