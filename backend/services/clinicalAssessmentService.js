import PsychologicalAssessment from '../models/PsychologicalAssessmentSchema.js';
import { createClinicalMeasure } from './clinicalMeasureService.js';

/**
 * Single write path for clinical assessments and their derived measures.
 * The caller owns the MongoDB transaction and must pass its session.
 */
export const createClinicalAssessment = async ({
  assessmentData,
  patientId,
  clinicianId,
  measureName,
  responses,
  takenAt,
  session,
}) => {
  if (!session) {
    const error = new Error('A transaction session is required to create a clinical assessment');
    error.statusCode = 500;
    throw error;
  }

  const [assessment] = await PsychologicalAssessment.create([{
    ...assessmentData,
    patient: patientId,
    psychologist: clinicianId,
  }], { session });

  let measureResult = null;
  if (measureName && measureName !== 'OTHER' && Array.isArray(responses) && responses.length > 0) {
    measureResult = await createClinicalMeasure({
      patientId,
      clinicianId,
      name: measureName,
      responses,
      assessmentId: assessment._id,
      takenAt: takenAt || assessment.testDate,
      session,
    });
  }

  return { assessment, measureResult };
};
