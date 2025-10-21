// Frontend/src/components/RiskBanner.jsx
import { useEffect, useState } from 'react';
import { BASE_URL, token } from '../config';

const RiskBanner = ({ patientId }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => { (async () => {
    try {
      const res = await fetch(`${BASE_URL}/clinical/patients/${patientId}/alerts`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setAlerts(json.data || []);
    } catch {}
  })(); }, [patientId]);

  if (!alerts.length) return null;

  const severityColor = (s) => s === 'critical' ? 'bg-red-600' : s === 'high' ? 'bg-orange-600' : 'bg-yellow-600';

  return (
    <div className="mt-4 space-y-2">
      {alerts.map(a => (
        <div key={a._id} className={`text-white px-4 py-3 rounded ${severityColor(a.severity)}`}>
          <strong className="mr-2">Alerta:</strong> {a.type.replace('_',' ')} — severidad {a.severity}
        </div>
      ))}
    </div>
  );
};

export default RiskBanner;
