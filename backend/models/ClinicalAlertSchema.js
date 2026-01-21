import mongoose from "mongoose";

/**
 * ClinicalAlert Schema - Risk Detection & Protocol Activation Log
 * 
 * This schema logs all clinical risk flags and protocol activations.
 * It serves both operational (notify clinician) and legal (audit trail) purposes.
 * 
 * Alert Types:
 * - SUICIDE_RISK: PHQ-9 #9 ≥2, keyword detection, clinical assessment
 * - NON_ADHERENCE: Multiple missed sessions, low homework completion
 * - ABANDONMENT_RISK: No contact >14 days, repeated cancellations
 * - CRISIS: Active crisis reported by patient
 * - ADVERSE_EVENT: Worsening symptoms, negative reaction to intervention
 * - CLINICAL_DETERIORATION: Significant increase in PHQ-9/GAD-7
 * 
 * Severity Levels:
 * - INFO: For awareness, no immediate action required
 * - WARNING: Requires review within 24-48h
 * - CRITICAL: Immediate clinician review required, may block other actions
 */

const ClinicalAlertSchema = new mongoose.Schema(
  {
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
      // Nullable: Alert might not be tied to a specific session
    },

    // Alert Classification
    alertType: {
      type: String,
      enum: [
        "SUICIDE_RISK",
        "NON_ADHERENCE",
        "ABANDONMENT_RISK",
        "CRISIS",
        "ADVERSE_EVENT",
        "CLINICAL_DETERIORATION",
        "PROTOCOL_VIOLATION",
        "TECHNICAL_ISSUE", // e.g., telepsychology tech failure
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "WARNING", "CRITICAL"],
      required: true,
      default: "WARNING",
      index: true,
    },

    // Trigger Information
    triggeredBy: {
      type: String,
      enum: ["SYSTEM_AUTO", "CLINICIAN_MANUAL", "PATIENT_SELF_REPORT"],
      required: true,
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    triggerDetails: {
      // Contextual data about what caused the alert
      source: String, // e.g., "PHQ-9 Assessment", "Session Note Keywords", "Missed Session Counter"
      dataSnapshot: mongoose.Schema.Types.Mixed, // Store relevant data at time of trigger
      // Example for SUICIDE_RISK: { phq9Item9: 3, keywords: ["sin salida", "terminar todo"] }
    },

    // Alert Content
    title: {
      type: String,
      required: true,
      // e.g., "Suicide Risk Detected - Immediate Review Required"
    },
    description: {
      type: String,
      required: true,
      // Detailed explanation of the alert
    },
    recommendedActions: [String], // Suggested next steps for clinician

    // Protocol Activation
    protocolActivated: {
      type: Boolean,
      default: false,
    },
    protocolLogId: {
      type: mongoose.Types.ObjectId,
      ref: "ProtocolLog",
      // Links to the formal protocol execution record
    },

    // Resolution Tracking
    status: {
      type: String,
      enum: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"],
      default: "OPEN",
      index: true,
    },
    acknowledgedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    acknowledgedAt: Date,
    resolutionNotes: {
      type: String,
      // Clinician documents what action was taken or why it's a false positive
    },
    resolvedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    resolvedAt: Date,

    // Escalation
    escalated: {
      type: Boolean,
      default: false,
    },
    escalatedTo: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor", // Supervisor or crisis team
    },
    escalationReason: String,

    // Audit Trail
    viewedBy: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "Doctor" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and querying
ClinicalAlertSchema.index({ patientId: 1, status: 1, severity: 1 });
ClinicalAlertSchema.index({ treatmentPlanId: 1, alertType: 1 });
ClinicalAlertSchema.index({ triggeredAt: -1 }); // Most recent first
ClinicalAlertSchema.index({ status: 1, severity: 1 }); // Active critical alerts

// Compound index for caseload monitoring
ClinicalAlertSchema.index({
  "acknowledgedBy": 1,
  "status": 1,
  "severity": 1,
});

// Virtual: Time since alert was created
ClinicalAlertSchema.virtual("ageInHours").get(function () {
  return Math.floor((new Date() - this.triggeredAt) / (1000 * 60 * 60));
});

// Virtual: Is this alert overdue?
ClinicalAlertSchema.virtual("isOverdue").get(function () {
  if (this.status === "RESOLVED" || this.status === "FALSE_POSITIVE") return false;

  const hoursOpen = this.ageInHours;
  switch (this.severity) {
    case "CRITICAL":
      return hoursOpen > 2; // Must be addressed within 2 hours
    case "WARNING":
      return hoursOpen > 24; // Within 24 hours
    case "INFO":
      return hoursOpen > 72; // Within 3 days
    default:
      return false;
  }
});

// Method: Mark as acknowledged
ClinicalAlertSchema.methods.acknowledge = function (clinicianId) {
  this.status = "ACKNOWLEDGED";
  this.acknowledgedBy = clinicianId;
  this.acknowledgedAt = new Date();
  this.viewedBy.push({ userId: clinicianId, viewedAt: new Date() });
  return this.save();
};

// Method: Resolve alert
ClinicalAlertSchema.methods.resolve = function (clinicianId, notes) {
  this.status = "RESOLVED";
  this.resolvedBy = clinicianId;
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  return this.save();
};

// Static method: Get all open critical alerts for a psychologist's caseload
ClinicalAlertSchema.statics.getCriticalAlerts = async function (psychologistId) {
  // Find all treatment plans for this psychologist
  const TreatmentPlan = mongoose.model("TreatmentPlan");
  const treatmentPlans = await TreatmentPlan.find({
    psychologistId,
    status: "ACTIVE",
  }).select("_id");

  const planIds = treatmentPlans.map((tp) => tp._id);

  return this.find({
    treatmentPlanId: { $in: planIds },
    severity: "CRITICAL",
    status: { $in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
  })
    .populate("patientId", "name email")
    .populate("treatmentPlanId", "currentPhase riskLevel")
    .sort({ triggeredAt: -1 })
    .lean();
};

// Middleware: Auto-escalate critical alerts not acknowledged within 1 hour
ClinicalAlertSchema.pre("save", function (next) {
  if (
    this.severity === "CRITICAL" &&
    this.status === "OPEN" &&
    !this.escalated &&
    this.ageInHours > 1
  ) {
    // In production, this would trigger a notification to supervisor
    this.escalated = true;
    // Logic to find supervisor would go here
  }
  next();
});

export default mongoose.model("ClinicalAlert", ClinicalAlertSchema);
