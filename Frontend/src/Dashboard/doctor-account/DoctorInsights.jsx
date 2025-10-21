import React from 'react';

const DoctorInsights = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-headingColor mb-4">Doctor Insights</h2>
      <p className="text-textColor">
        Esta sección mostrará estadísticas e insights sobre tu práctica médica.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Total Appointments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Patient Satisfaction</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">N/A</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">$0</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorInsights;
