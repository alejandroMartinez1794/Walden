import "./App.css";
import Layout from "./layout/Layout";
import ClinicalErrorBoundary from "./components/Error/ClinicalErrorBoundary";
import { ClinicalSessionProvider } from "./context/ClinicalSessionContext";

function App() {
  return (  
    <ClinicalErrorBoundary>
      <ClinicalSessionProvider>
        <Layout />
      </ClinicalSessionProvider>
    </ClinicalErrorBoundary>
  );
}

export default App;