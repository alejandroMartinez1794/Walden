import mongoose from "mongoose";

/**
 * ConsentForm Schema - Legal Consent Tracking & Documentation
 * 
 * Purpose:
 * - Track all patient consents (informed consent for therapy, telehealth, data sharing, etc.)
 * - Provide legal documentation that patient was informed of rights/risks
 * - Ensure HIPAA compliance (patient must consent to treatment)
 * - Version control (consent forms may change; track which version patient signed)
 * 
 * Legal Requirements:
 * - Patient must provide informed consent before treatment begins
 * - Consent must be documented (signature + timestamp)
 * - Patient must be informed of: confidentiality limits, telehealth risks, fees, rights
 * - Consent can be withdrawn at any time
 * - Minor consent requires parent/guardian signature (if <18 years old)
 * 
 * Privacy Considerations:
 * - Patient can view their own consent history
 * - Clinician can view all consents for their patients
 * - Consent forms are immutable once signed
 * - Electronic signatures legally binding (ESIGN Act, UETA)
 * 
 * Audit Trail:
 * - Every consent action logged (signed, withdrawn, expired)
 * - IP address and user agent captured for electronic signatures
 * - Consent forms retained for 7+ years post-termination
 */

const ConsentFormSchema = new mongoose.Schema(
  {
    // ============= RELATIONSHIPS =============
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clinicianId: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
      // Clinician who obtained/witnessed the consent
    },
    treatmentPlanId: {
      type: mongoose.Types.ObjectId,
      ref: "TreatmentPlan",
      // May be null if consent obtained before treatment plan created (intake)
    },

    // ============= CONSENT TYPE & VERSION =============
    consentType: {
      type: String,
      enum: [
        "GENERAL_THERAPY", // Overall consent to psychotherapy
        "TELEHEALTH", // Specific consent for virtual sessions
        "CRISIS_CONTACT", // Permission to contact emergency contact
        "HIPAA_AUTHORIZATION", // Standard HIPAA privacy notice acknowledgment
        "RELEASE_OF_INFORMATION", // Share records with another provider
        "RECORDING", // Audio/video recording of sessions (research/supervision)
        "MINOR_TREATMENT", // Parent/guardian consent for minor
        "MEDICATION", // Consent for psychiatric medication (if prescribing)
        "RESEARCH_PARTICIPATION", // Consent to participate in clinical research
        "PHOTOGRAPHY", // Use of photos for educational purposes
        "PAYMENT_AGREEMENT", // Financial responsibility agreement
      ],
      required: true,
      index: true,
    },

    consentFormVersion: {
      type: String,
      required: true,
      // e.g., "v2.1" - Important for tracking which disclosure language was used
    },

    consentFormTitle: {
      type: String,
      required: true,
      // e.g., "Informed Consent for Telepsychology Services"
    },

    // ============= CONSENT CONTENT =============
    disclosures: [
      {
        disclosureType: {
          type: String,
          enum: [
            "CONFIDENTIALITY_LIMITS", // Tarasoff, child abuse reporting
            "EMERGENCY_PROCEDURES", // What happens in crisis
            "FEES_AND_BILLING", // Session cost, cancellation policy
            "TELEHEALTH_RISKS", // Technology failures, privacy concerns
            "RECORDS_RETENTION", // How long records kept
            "RIGHT_TO_REFUSE", // Can decline treatment anytime
            "SUPERVISION", // Sessions may be reviewed by supervisor
            "DUAL_RELATIONSHIPS", // Boundaries (no social media, etc.)
            "COMPLAINT_PROCEDURE", // How to file a grievance
          ],
          required: true,
        },
        disclosureText: {
          type: String,
          required: true,
          // Full text of the disclosure (stored for legal proof)
        },
        acknowledged: {
          type: Boolean,
          default: false,
          // Patient checked box confirming they read this section
        },
      },
    ],

    // ============= SPECIFIC CONSENTS (GRANULAR) =============
    specificConsents: {
      // For RELEASE_OF_INFORMATION consent type
      releaseDetails: {
        recipientName: String,
        recipientOrganization: String,
        recipientContact: String,
        informationToRelease: [String],
        // ["Diagnosis", "Treatment plan", "Session notes"]
        purpose: String,
        // "Coordination of care with primary care physician"
        expirationDate: Date,
      },

      // For TELEHEALTH consent type
      telehealthDetails: {
        platformsUsed: [String], // ["Zoom", "Doxy.me"]
        technologyRequirements: String,
        privacyRisksAcknowledged: { type: Boolean, default: false },
        alternativeInPersonAvailable: { type: Boolean, default: true },
        emergencyBackupPlan: String,
        // "If video fails, we will continue via phone"
      },

      // For CRISIS_CONTACT consent type
      crisisContactDetails: {
        emergencyContactName: String,
        emergencyContactPhone: String,
        emergencyContactRelationship: String,
        consentToContactInEmergency: { type: Boolean, default: false },
        informationToShare: [String],
        // ["Current risk level", "Safety plan", "Hospitalization recommendation"]
      },

      // For MINOR_TREATMENT consent type
      minorConsentDetails: {
        minorName: String,
        minorDateOfBirth: Date,
        guardianName: String,
        guardianRelationship: String,
        guardianSignature: String, // Digital signature capture
        secondGuardianRequired: { type: Boolean, default: false },
        secondGuardianName: String,
        secondGuardianSignature: String,
      },
    },

    // ============= PATIENT UNDERSTANDING =============
    patientUnderstanding: {
      opportunityToAskQuestions: {
        type: Boolean,
        required: true,
        default: false,
      },
      questionsAnswered: {
        type: Boolean,
        required: true,
        default: false,
      },
      voluntaryConsent: {
        type: Boolean,
        required: true,
        default: false,
        // Patient confirms no coercion
      },
      comprehensionConfirmed: {
        type: Boolean,
        default: false,
        // Clinician confirms patient understood (teach-back method)
      },
      languagePreference: {
        type: String,
        default: "English",
        // Consent must be provided in patient's language
      },
      interpreterUsed: {
        type: Boolean,
        default: false,
      },
      interpreterName: String,
    },

    // ============= SIGNATURE & LEGAL BINDING =============
    signature: {
      method: {
        type: String,
        enum: [
          "ELECTRONIC_TYPED", // Patient typed their name
          "ELECTRONIC_DRAWN", // Patient drew signature on touchscreen
          "VERBAL", // Phone consent (documented by clinician)
          "IN_PERSON_WRITTEN", // Paper form signed, scanned
          "DOCUSIGN", // Third-party e-signature service
        ],
        required: true,
      },
      signatureData: {
        type: String,
        // For ELECTRONIC_DRAWN: base64 image data
        // For ELECTRONIC_TYPED: patient's typed name
        // For VERBAL: "Verbal consent obtained over phone"
        required: true,
      },
      signedAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
      },
      signedBy: {
        type: String,
        required: true,
        // Usually patientId, but could be guardian for minors
      },
      witnessedBy: {
        type: mongoose.Types.ObjectId,
        ref: "Doctor",
        // Clinician who witnessed the signature
      },

      // Electronic signature authentication
      ipAddress: String,
      userAgent: String,
      geolocation: {
        lat: Number,
        lng: Number,
      },
      deviceInfo: String,
      // "iPhone 13, iOS 16.2"
    },

    // ============= CONSENT STATUS =============
    status: {
      type: String,
      enum: [
        "PENDING", // Sent to patient, not yet signed
        "ACTIVE", // Signed and currently in effect
        "WITHDRAWN", // Patient revoked consent
        "EXPIRED", // Time-limited consent expired
        "SUPERSEDED", // Replaced by newer version
        "ARCHIVED", // Treatment ended, retained for legal purposes
      ],
      default: "PENDING",
      required: true,
      index: true,
    },

    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
      // When consent becomes active (usually same as signedAt)
    },

    expirationDate: {
      type: Date,
      // Some consents expire (e.g., release of information after 1 year)
      // Null = does not expire
    },

    // ============= WITHDRAWAL TRACKING =============
    withdrawal: {
      withdrawnAt: Date,
      withdrawnBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
      withdrawalMethod: {
        type: String,
        enum: ["VERBAL", "WRITTEN", "EMAIL", "PORTAL"],
      },
      reason: String,
      // Patient's stated reason (optional)
      clinicianNotified: {
        type: Boolean,
        default: false,
      },
      notificationDate: Date,
      clinicalImpact: String,
      // Clinician's notes on how withdrawal affects treatment
    },

    // ============= LEGAL COMPLIANCE =============
    legalMetadata: {
      regulatoryFramework: {
        type: [String],
        default: ["HIPAA", "ESIGN_ACT", "UETA"],
        // Laws/regulations this consent complies with
      },
      stateRequirements: [String],
      // State-specific consent requirements (e.g., California AB 2138)
      minorConsentAge: Number,
      // Age at which minor can consent without parent (varies by state)
      mandatoryReportingAcknowledged: {
        type: Boolean,
        default: false,
        // Patient informed of mandatory reporting duties
      },
    },

    // ============= DOCUMENT MANAGEMENT =============
    attachments: [
      {
        fileType: {
          type: String,
          enum: ["PDF", "IMAGE", "SCANNED_DOCUMENT"],
        },
        fileName: String,
        fileUrl: String,
        // URL to stored file (e.g., S3 bucket)
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        checksum: String,
        // SHA-256 hash for file integrity verification
      },
    ],

    // ============= AUDIT TRAIL =============
    auditLog: [
      {
        action: {
          type: String,
          enum: [
            "CREATED",
            "SENT_TO_PATIENT",
            "VIEWED_BY_PATIENT",
            "SIGNED",
            "WITHDRAWN",
            "EXPIRED",
            "SUPERSEDED",
            "EXPORTED",
          ],
          required: true,
        },
        performedBy: {
          type: mongoose.Types.ObjectId,
          refPath: "auditLog.performedByModel",
        },
        performedByModel: {
          type: String,
          enum: ["User", "Doctor", "System"],
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        notes: String,
      },
    ],

    // ============= VERSION CONTROL =============
    supersededBy: {
      type: mongoose.Types.ObjectId,
      ref: "ConsentForm",
      // If this consent replaced by newer version, link to new consent
    },
    supersedes: {
      type: mongoose.Types.ObjectId,
      ref: "ConsentForm",
      // Link to previous version this consent replaces
    },
  },
  {
    timestamps: true,
  }
);

// ============= INDEXES =============
ConsentFormSchema.index({ patientId: 1, consentType: 1, status: 1 });
ConsentFormSchema.index({ clinicianId: 1, status: 1 });
ConsentFormSchema.index({ expirationDate: 1 });
ConsentFormSchema.index({ "signature.signedAt": -1 });

// ============= STATIC METHODS =============

/**
 * Get active consents for a patient
 */
ConsentFormSchema.statics.getActiveForPatient = async function (patientId) {
  return this.find({
    patientId,
    status: "ACTIVE",
    $or: [{ expirationDate: { $gt: new Date() } }, { expirationDate: null }],
  }).sort({ "signature.signedAt": -1 });
};

/**
 * Check if patient has specific consent type
 */
ConsentFormSchema.statics.hasActiveConsent = async function (patientId, consentType) {
  const consent = await this.findOne({
    patientId,
    consentType,
    status: "ACTIVE",
    $or: [{ expirationDate: { $gt: new Date() } }, { expirationDate: null }],
  });

  return !!consent;
};

/**
 * Get expiring consents (for renewal reminders)
 */
ConsentFormSchema.statics.getExpiringConsents = async function (daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return this.find({
    status: "ACTIVE",
    expirationDate: {
      $gte: new Date(),
      $lte: futureDate,
    },
  })
    .populate("patientId", "name email")
    .populate("clinicianId", "name email");
};

/**
 * Get pending consents (need signature)
 */
ConsentFormSchema.statics.getPendingForPatient = async function (patientId) {
  return this.find({
    patientId,
    status: "PENDING",
  }).sort({ createdAt: -1 });
};

// ============= INSTANCE METHODS =============

/**
 * Sign the consent form
 */
ConsentFormSchema.methods.sign = async function (signatureData) {
  if (this.status !== "PENDING") {
    throw new Error("Can only sign pending consents");
  }

  this.signature = {
    ...this.signature,
    ...signatureData,
    signedAt: new Date(),
  };

  this.status = "ACTIVE";
  this.effectiveDate = new Date();

  // Add to audit log
  this.auditLog.push({
    action: "SIGNED",
    performedBy: this.patientId,
    performedByModel: "User",
    performedAt: new Date(),
    ipAddress: signatureData.ipAddress,
    notes: `Signed via ${signatureData.method}`,
  });

  await this.save();
  return this;
};

/**
 * Withdraw consent
 */
ConsentFormSchema.methods.withdraw = async function (userId, reason, method = "WRITTEN") {
  if (this.status !== "ACTIVE") {
    throw new Error("Can only withdraw active consents");
  }

  this.status = "WITHDRAWN";
  this.withdrawal = {
    withdrawnAt: new Date(),
    withdrawnBy: userId,
    withdrawalMethod: method,
    reason: reason,
    clinicianNotified: false, // Will be updated when clinician notified
  };

  // Add to audit log
  this.auditLog.push({
    action: "WITHDRAWN",
    performedBy: userId,
    performedByModel: "User",
    performedAt: new Date(),
    notes: `Reason: ${reason}`,
  });

  await this.save();
  return this;
};

/**
 * Mark as expired (automated job runs this)
 */
ConsentFormSchema.methods.expire = async function () {
  if (this.expirationDate && this.expirationDate < new Date()) {
    this.status = "EXPIRED";

    // Add to audit log
    this.auditLog.push({
      action: "EXPIRED",
      performedBy: null,
      performedByModel: "System",
      performedAt: new Date(),
      notes: "Automatically expired based on expiration date",
    });

    await this.save();
  }

  return this;
};

/**
 * Supersede with new version
 */
ConsentFormSchema.methods.supersede = async function (newConsentId) {
  this.status = "SUPERSEDED";
  this.supersededBy = newConsentId;

  // Add to audit log
  this.auditLog.push({
    action: "SUPERSEDED",
    performedBy: null,
    performedByModel: "System",
    performedAt: new Date(),
    notes: `Superseded by consent ${newConsentId}`,
  });

  await this.save();
  return this;
};

/**
 * Generate patient-facing summary
 */
ConsentFormSchema.methods.toPatientSummary = function () {
  return {
    consentType: this.consentType,
    consentFormTitle: this.consentFormTitle,
    status: this.status,
    signedAt: this.signature?.signedAt,
    effectiveDate: this.effectiveDate,
    expirationDate: this.expirationDate,
    canWithdraw: this.status === "ACTIVE",
    withdrawalInstructions:
      "You can withdraw consent at any time by contacting your therapist.",
  };
};

/**
 * Generate legal report (for audit/court)
 */
ConsentFormSchema.methods.toLegalReport = function () {
  return {
    documentType: "CONSENT_FORM",
    consentType: this.consentType,
    consentFormVersion: this.consentFormVersion,
    patientId: this.patientId,
    clinicianId: this.clinicianId,
    signatureDetails: {
      method: this.signature.method,
      signedAt: this.signature.signedAt,
      signedBy: this.signature.signedBy,
      ipAddress: this.signature.ipAddress,
      userAgent: this.signature.userAgent,
    },
    disclosuresProvided: this.disclosures.map((d) => ({
      type: d.disclosureType,
      acknowledged: d.acknowledged,
    })),
    status: this.status,
    withdrawalDetails: this.withdrawal,
    auditTrail: this.auditLog,
    legalCompliance: this.legalMetadata.regulatoryFramework,
  };
};

// ============= PRE-SAVE MIDDLEWARE =============

ConsentFormSchema.pre("save", async function (next) {
  // Auto-expire if expiration date passed
  if (this.expirationDate && this.expirationDate < new Date() && this.status === "ACTIVE") {
    await this.expire();
  }

  // Validate guardian signature for minors
  if (this.consentType === "MINOR_TREATMENT") {
    const User = mongoose.model("User");
    const patient = await User.findById(this.patientId).select("dateOfBirth");

    if (patient && patient.dateOfBirth) {
      const age = Math.floor(
        (new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
      );

      if (age < 18 && !this.specificConsents.minorConsentDetails?.guardianName) {
        throw new Error("Guardian information required for minor consent");
      }
    }
  }

  next();
});

// ============= POST-SAVE MIDDLEWARE =============

ConsentFormSchema.post("save", async function (doc) {
  // If consent withdrawn, notify clinician (create alert)
  if (doc.status === "WITHDRAWN" && doc.withdrawal && !doc.withdrawal.clinicianNotified) {
    const ClinicalAlert = mongoose.model("ClinicalAlert");

    await ClinicalAlert.create({
      patientId: doc.patientId,
      treatmentPlanId: doc.treatmentPlanId,
      alertType: "ADMINISTRATIVE",
      severity: "WARNING",
      triggeredBy: "SYSTEM_AUTO",
      title: `Patient Withdrew ${doc.consentType} Consent`,
      description: `Patient withdrew consent for ${doc.consentFormTitle}. Reason: ${
        doc.withdrawal.reason || "Not provided"
      }`,
      recommendedActions: [
        "Contact patient to discuss concerns",
        "Clarify implications of withdrawal",
        "Document conversation in clinical notes",
      ],
    });

    // Mark as notified
    doc.withdrawal.clinicianNotified = true;
    doc.withdrawal.notificationDate = new Date();
    await doc.save();
  }
});

export default mongoose.models.ConsentForm || mongoose.model("ConsentForm", ConsentFormSchema);
