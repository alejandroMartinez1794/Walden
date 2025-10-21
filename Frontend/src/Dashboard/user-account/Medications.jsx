import { useEffect, useState } from 'react';
import { FaPills, FaClock, FaExclamationTriangle, FaPlus, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';

const Medications = () => {
  const [medications, setMedications] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    instructions: '',
    totalDoses: ''
  });

  const [todaysDoses, setTodaysDoses] = useState([]);

  useEffect(() => {
    const fetchMedications = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/health/medications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setMedications(json.data || []);
        // simple demo schedule from meds
        const schedule = (json.data || []).slice(0, 5).map((m, idx) => ({
          time: `${8 + idx * 2}:00`,
          medication: `${m.name} ${m.dosage}`,
          taken: false,
        }));
        setTodaysDoses(schedule);
      }
    };
    fetchMedications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const needsRefill = (med) => {
    return med.remainingDoses <= med.totalDoses * 0.2 && med.status === 'active';
  };

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.startDate || !newMedication.totalDoses) {
      toast.error('Please fill all required fields');
      return;
    }
    const med = {
      ...newMedication,
      // id se establece por Mongo al guardar
      remainingDoses: parseInt(newMedication.totalDoses),
      status: 'active'
    };
    // persist to backend
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(med),
    });
    const json = await res.json();
    if (res.ok) {
      setMedications([json.data, ...medications]);
      toast.success('Medication added');
    } else {
      toast.error(json.message || 'Failed to add');
    }
    setShowAddForm(false);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      instructions: '',
      totalDoses: ''
    });
  };

  const handleDeleteMedication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/medications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMedications(medications.filter(med => med._id !== id));
      toast.success('Medication deleted');
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleEditMedication = (med) => {
    setEditingMed(med._id);
    setNewMedication(med);
    setShowAddForm(true);
  };

  const handleUpdateMedication = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/medications/${editingMed}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newMedication),
    });
    const json = await res.json();
    if (res.ok) {
      setMedications(medications.map(med => med._id === editingMed ? json.data : med));
      setShowAddForm(false);
      setEditingMed(null);
      toast.success('Medication updated');
    }
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      instructions: '',
      totalDoses: ''
    });
  };

  const handleTakeDose = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/medications/${id}/take-dose`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) {
      setMedications(medications.map(m => m._id === id ? json.data : m));
      toast.success('Dose marked as taken');
    } else {
      toast.error(json.message || 'Failed to mark dose');
    }
  };

  const activeMedications = (medications || []).filter(m => m.status === 'active');
  const completedMedications = (medications || []).filter(m => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-headingColor">Medications Management</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingMed(null);
            setNewMedication({
              name: '',
              dosage: '',
              frequency: '',
              startDate: '',
              endDate: '',
              prescribedBy: '',
              instructions: '',
              totalDoses: ''
            });
          }}
          className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FaPlus /> Add Medication
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Medications</p>
              <h3 className="text-3xl font-bold mt-2">{activeMedications.length}</h3>
            </div>
            <FaPills className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Doses Taken</p>
              <h3 className="text-3xl font-bold mt-2">
                {todaysDoses.filter(d => d.taken).length}/{todaysDoses.length}
              </h3>
            </div>
            <FaCheck className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Need Refill</p>
              <h3 className="text-3xl font-bold mt-2">
                {activeMedications.filter(needsRefill).length}
              </h3>
            </div>
            <FaExclamationTriangle className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-4 flex items-center gap-2">
          <FaClock className="text-primaryColor" />
          Today's Schedule
        </h3>
        <div className="space-y-3">
          {todaysDoses.map((dose, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                dose.taken
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  dose.taken ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {dose.taken ? (
                    <FaCheck className="text-white text-xl" />
                  ) : (
                    <FaClock className="text-white text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-headingColor">{dose.time}</p>
                  <p className="text-textColor text-sm">{dose.medication}</p>
                </div>
              </div>
              {!dose.taken && (
                <button onClick={() => toast.info('Connect this to a dose schedule if needed')} className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                  Mark as Taken
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Medication Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-headingColor mb-4">
            {editingMed ? 'Edit Medication' : 'Add New Medication'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Medication Name *
              </label>
              <input
                type="text"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                placeholder="e.g., Aspirin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Dosage *
              </label>
              <input
                type="text"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Frequency *
              </label>
              <input
                type="text"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                placeholder="e.g., Twice daily"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Prescribed By *
              </label>
              <input
                type="text"
                value={newMedication.prescribedBy}
                onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                placeholder="e.g., Dr. Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={newMedication.startDate}
                onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={newMedication.endDate}
                onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textColor mb-2">
                Total Doses *
              </label>
              <input
                type="number"
                value={newMedication.totalDoses}
                onChange={(e) => setNewMedication({ ...newMedication, totalDoses: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                placeholder="e.g., 30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-textColor mb-2">
                Instructions
              </label>
              <textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
                rows="3"
                placeholder="Special instructions..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingMed ? handleUpdateMedication : handleAddMedication}
              className="bg-primaryColor text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              {editingMed ? 'Update Medication' : 'Add Medication'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingMed(null);
              }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Refill Alerts */}
      {activeMedications.filter(needsRefill).length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-600" />
            Medications Need Refill
          </h3>
          <div className="space-y-3">
            {activeMedications.filter(needsRefill).map((med) => (
              <div key={med.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-headingColor">{med.name} - {med.dosage}</p>
                  <p className="text-sm text-textColor">
                    Only {med.remainingDoses} doses remaining
                  </p>
                </div>
                <button className="bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                  Request Refill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Medications */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-4">Active Medications</h3>
        <div className="space-y-4">
            {activeMedications.map((med) => (
            <div key={med._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-headingColor">{med.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(med.status)}`}>
                      {med.status}
                    </span>
                    {needsRefill(med) && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
                        <FaExclamationTriangle /> Refill Needed
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-textColor">
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    <p><strong>Frequency:</strong> {med.frequency}</p>
                    <p><strong>Prescribed by:</strong> {med.prescribedBy}</p>
                    <p><strong>Duration:</strong> {med.startDate} to {med.endDate}</p>
                    <p className="md:col-span-2"><strong>Instructions:</strong> {med.instructions}</p>
                    <p>
                      <strong>Progress:</strong> {med.remainingDoses}/{med.totalDoses} doses remaining
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          needsRefill(med) ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(med.remainingDoses / med.totalDoses) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2">
                      <button onClick={() => handleTakeDose(med._id)} className="text-sm bg-primaryColor text-white px-3 py-1 rounded hover:bg-blue-700">
                        Take dose
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditMedication(med)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={() => handleDeleteMedication(med._id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Medications */}
      {completedMedications.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-headingColor mb-4">Completed Medications</h3>
          <div className="space-y-3">
            {completedMedications.map((med) => (
              <div key={med.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-headingColor">{med.name} - {med.dosage}</h4>
                    <p className="text-sm text-textColor">
                      Prescribed by {med.prescribedBy} | {med.startDate} to {med.endDate}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(med.status)}`}>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications;
