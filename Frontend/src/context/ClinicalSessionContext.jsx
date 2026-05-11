import { createContext, useContext, useReducer, useCallback } from 'react';
import { authContext } from './AuthContext';

// Initial clinical state
const initialClinicalState = {
  phq9Score: null,
  gad7Score: null,
  riskLevel: 'low', // low, medium, high, critical
  crisisFlag: false,
  lastAssessmentDate: null,
  emergencyContacts: [],
  safetyPlan: null,
  clinicalNotes: [],
  loading: false,
  error: null
};

// Clinical actions
const clinicalActions = {
  SET_PHQ9_SCORE: 'SET_PHQ9_SCORE',
  SET_GAD7_SCORE: 'SET_GAD7_SCORE',
  SET_RISK_LEVEL: 'SET_RISK_LEVEL',
  SET_CRISIS_FLAG: 'SET_CRISIS_FLAG',
  SET_LAST_ASSESSMENT_DATE: 'SET_LAST_ASSESSMENT_DATE',
  ADD_EMERGENCY_CONTACT: 'ADD_EMERGENCY_CONTACT',
  SET_SAFETY_PLAN: 'SET_SAFETY_PLAN',
  ADD_CLINICAL_NOTE: 'ADD_CLINICAL_NOTE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_CLINICAL_STATE: 'RESET_CLINICAL_STATE'
};

// Clinical reducer
const clinicalReducer = (state, action) => {
  switch (action.type) {
    case clinicalActions.SET_PHQ9_SCORE:
      return {
        ...state,
        phq9Score: action.payload,
        lastAssessmentDate: new Date().toISOString()
      };
      
    case clinicalActions.SET_GAD7_SCORE:
      return {
        ...state,
        gad7Score: action.payload,
        lastAssessmentDate: new Date().toISOString()
      };
      
    case clinicalActions.SET_RISK_LEVEL:
      return {
        ...state,
        riskLevel: action.payload,
        crisisFlag: action.payload === 'critical' || action.payload === 'high'
      };
      
    case clinicalActions.SET_CRISIS_FLAG:
      return {
        ...state,
        crisisFlag: action.payload
      };
      
    case clinicalActions.SET_LAST_ASSESSMENT_DATE:
      return {
        ...state,
        lastAssessmentDate: action.payload
      };
      
    case clinicalActions.ADD_EMERGENCY_CONTACT:
      return {
        ...state,
        emergencyContacts: [...state.emergencyContacts, action.payload]
      };
      
    case clinicalActions.SET_SAFETY_PLAN:
      return {
        ...state,
        safetyPlan: action.payload
      };
      
    case clinicalActions.ADD_CLINICAL_NOTE:
      return {
        ...state,
        clinicalNotes: [...state.clinicalNotes, action.payload]
      };
      
    case clinicalActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case clinicalActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case clinicalActions.RESET_CLINICAL_STATE:
      return initialClinicalState;
      
    default:
      return state;
  }
};

// Context
const ClinicalSessionContext = createContext();

// Provider component
export const ClinicalSessionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clinicalReducer, initialClinicalState);
  const { token } = useContext(authContext);

  // Memoized actions
  const setPhq9Score = useCallback((score) => {
    dispatch({ type: clinicalActions.SET_PHQ9_SCORE, payload: score });
  }, []);

  const setGad7Score = useCallback((score) => {
    dispatch({ type: clinicalActions.SET_GAD7_SCORE, payload: score });
  }, []);

  const setRiskLevel = useCallback((level) => {
    dispatch({ type: clinicalActions.SET_RISK_LEVEL, payload: level });
  }, []);

  const setCrisisFlag = useCallback((flag) => {
    dispatch({ type: clinicalActions.SET_CRISIS_FLAG, payload: flag });
  }, []);

  const setLastAssessmentDate = useCallback((date) => {
    dispatch({ type: clinicalActions.SET_LAST_ASSESSMENT_DATE, payload: date });
  }, []);

  const addEmergencyContact = useCallback((contact) => {
    dispatch({ type: clinicalActions.ADD_EMERGENCY_CONTACT, payload: contact });
  }, []);

  const setSafetyPlan = useCallback((plan) => {
    dispatch({ type: clinicalActions.SET_SAFETY_PLAN, payload: plan });
  }, []);

  const addClinicalNote = useCallback((note) => {
    dispatch({ type: clinicalActions.ADD_CLINICAL_NOTE, payload: note });
  }, []);

  const resetClinicalState = useCallback(() => {
    dispatch({ type: clinicalActions.RESET_CLINICAL_STATE });
  }, []);

  const value = {
    ...state,
    setPhq9Score,
    setGad7Score,
    setRiskLevel,
    setCrisisFlag,
    setLastAssessmentDate,
    addEmergencyContact,
    setSafetyPlan,
    addClinicalNote,
    resetClinicalState
  };

  return (
    <ClinicalSessionContext.Provider value={value}>
      {children}
    </ClinicalSessionContext.Provider>
  );
};

// Custom hook to use the context
export const useClinicalSession = () => {
  const context = useContext(ClinicalSessionContext);
  
  if (!context) {
    throw new Error('useClinicalSession must be used within a ClinicalSessionProvider');
  }
  
  return context;
};

export default ClinicalSessionContext;