import { useEffect, useState } from 'react';
import { 
  FaHeartbeat, 
  FaWeight, 
  FaTint, 
  FaThermometerHalf,
  FaRunning,
  FaBed,
  FaAppleAlt,
  FaPlus,
  FaChartLine
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify';

const HealthTracker = () => {
  // Chart data
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [glucoseData, setGlucoseData] = useState([]);

  const [dailyMetrics, setDailyMetrics] = useState({
    steps: 8542,
    stepsGoal: 10000,
    water: 6,
    waterGoal: 8,
    sleep: 7.5,
    sleepGoal: 8,
    calories: 1850,
    caloriesGoal: 2000,
    exercise: 45,
    exerciseGoal: 60
  });

  const [vitals, setVitals] = useState({
    bloodPressure: { systolic: 120, diastolic: 80, status: 'normal' },
    heartRate: 72,
    temperature: 36.8,
    weight: 74.0,
    bmi: 24.2,
    glucose: 95,
    oxygen: 98
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [metricForm, setMetricForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    bmi: '',
    glucose: '',
    oxygen: '',
    steps: '',
    water: '',
    sleep: '',
    calories: '',
    exercise: '',
  });

  const refreshMetrics = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) {
      const metrics = json.data || [];
      const bp = metrics
        .filter(m => m.bloodPressure?.systolic && m.bloodPressure?.diastolic)
        .map(m => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
          systolic: m.bloodPressure.systolic,
          diastolic: m.bloodPressure.diastolic,
        }));
      setBloodPressureData(bp);

      const wt = metrics
        .filter(m => m.weight)
        .map(m => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
          weight: m.weight,
        }));
      setWeightData(wt);

      const glu = metrics
        .filter(m => m.glucose)
        .map(m => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
          level: m.glucose,
          meal: 'Measurement',
        }));
      setGlucoseData(glu);

      if (metrics.length > 0) {
        const latest = metrics[metrics.length - 1];
        setVitals(v => ({
          ...v,
          bloodPressure: latest.bloodPressure || v.bloodPressure,
          heartRate: latest.heartRate || v.heartRate,
          temperature: latest.temperature || v.temperature,
          weight: latest.weight || v.weight,
          bmi: latest.bmi || v.bmi,
          glucose: latest.glucose || v.glucose,
          oxygen: latest.oxygen || v.oxygen,
        }));
      }
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleSubmitMetric = async () => {
    const payload = { date: new Date(metricForm.date).toISOString() };
    if (metricForm.systolic && metricForm.diastolic) {
      payload.bloodPressure = { systolic: parseFloat(metricForm.systolic), diastolic: parseFloat(metricForm.diastolic) };
    }
    if (metricForm.heartRate) payload.heartRate = parseFloat(metricForm.heartRate);
    if (metricForm.temperature) payload.temperature = parseFloat(metricForm.temperature);
    if (metricForm.weight) payload.weight = parseFloat(metricForm.weight);
    if (metricForm.bmi) payload.bmi = parseFloat(metricForm.bmi);
    if (metricForm.glucose) payload.glucose = parseFloat(metricForm.glucose);
    if (metricForm.oxygen) payload.oxygen = parseFloat(metricForm.oxygen);
    if (metricForm.steps) payload.steps = parseInt(metricForm.steps);
    if (metricForm.water) payload.water = parseInt(metricForm.water);
    if (metricForm.sleep) payload.sleep = parseFloat(metricForm.sleep);
    if (metricForm.calories) payload.calories = parseInt(metricForm.calories);
    if (metricForm.exercise) payload.exercise = parseInt(metricForm.exercise);

    if (Object.keys(payload).length === 1) {
      toast.error('Please enter at least one metric');
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/health/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success('Metric logged successfully');
      setShowAddForm(false);
      setMetricForm({
        date: new Date().toISOString().substring(0, 10),
        systolic: '', diastolic: '', heartRate: '', temperature: '', weight: '', bmi: '', glucose: '', oxygen: '',
        steps: '', water: '', sleep: '', calories: '', exercise: '',
      });
      await refreshMetrics();
    } else {
      toast.error(json.message || 'Failed to log metric');
    }
  };

  const getProgressColor = (value, goal) => {
    const percentage = (value / goal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBPStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) return { text: 'Normal', color: 'text-green-600' };
    if (systolic < 130 && diastolic < 80) return { text: 'Elevated', color: 'text-yellow-600' };
    if (systolic < 140 || diastolic < 90) return { text: 'Stage 1 Hypertension', color: 'text-orange-600' };
    return { text: 'Stage 2 Hypertension', color: 'text-red-600' };
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  const bpStatus = getBPStatus(vitals.bloodPressure.systolic, vitals.bloodPressure.diastolic);
  const bmiCategory = getBMICategory(vitals.bmi);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-headingColor">Health Tracker</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primaryColor text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FaPlus /> Log Health Data
        </button>
      </div>

      {/* Current Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Blood Pressure</p>
              <h3 className="text-2xl font-bold mt-2">
                {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
              </h3>
              <p className="text-xs mt-1">{bpStatus.text}</p>
            </div>
            <FaHeartbeat className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Heart Rate</p>
              <h3 className="text-2xl font-bold mt-2">{vitals.heartRate}</h3>
              <p className="text-xs mt-1">bpm</p>
            </div>
            <FaHeartbeat className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Weight</p>
              <h3 className="text-2xl font-bold mt-2">{vitals.weight}</h3>
              <p className="text-xs mt-1">kg - BMI: {vitals.bmi}</p>
            </div>
            <FaWeight className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Blood Glucose</p>
              <h3 className="text-2xl font-bold mt-2">{vitals.glucose}</h3>
              <p className="text-xs mt-1">mg/dL</p>
            </div>
            <FaTint className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Daily Activity Tracking */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-6 flex items-center gap-2">
          <FaChartLine className="text-primaryColor" />
          Today's Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaRunning className="text-blue-500 text-xl" />
                <span className="font-semibold text-headingColor">Steps</span>
              </div>
              <span className="text-sm text-textColor">
                {dailyMetrics.steps} / {dailyMetrics.stepsGoal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(dailyMetrics.steps, dailyMetrics.stepsGoal)}`}
                style={{ width: `${(dailyMetrics.steps / dailyMetrics.stepsGoal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textColor mt-1">
              {((dailyMetrics.steps / dailyMetrics.stepsGoal) * 100).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Water Intake */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaTint className="text-cyan-500 text-xl" />
                <span className="font-semibold text-headingColor">Water</span>
              </div>
              <span className="text-sm text-textColor">
                {dailyMetrics.water} / {dailyMetrics.waterGoal} glasses
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(dailyMetrics.water, dailyMetrics.waterGoal)}`}
                style={{ width: `${(dailyMetrics.water / dailyMetrics.waterGoal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textColor mt-1">
              {((dailyMetrics.water / dailyMetrics.waterGoal) * 100).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Sleep */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaBed className="text-purple-500 text-xl" />
                <span className="font-semibold text-headingColor">Sleep</span>
              </div>
              <span className="text-sm text-textColor">
                {dailyMetrics.sleep} / {dailyMetrics.sleepGoal} hours
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(dailyMetrics.sleep, dailyMetrics.sleepGoal)}`}
                style={{ width: `${(dailyMetrics.sleep / dailyMetrics.sleepGoal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textColor mt-1">
              {((dailyMetrics.sleep / dailyMetrics.sleepGoal) * 100).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Exercise */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaRunning className="text-orange-500 text-xl" />
                <span className="font-semibold text-headingColor">Exercise</span>
              </div>
              <span className="text-sm text-textColor">
                {dailyMetrics.exercise} / {dailyMetrics.exerciseGoal} mins
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(dailyMetrics.exercise, dailyMetrics.exerciseGoal)}`}
                style={{ width: `${(dailyMetrics.exercise / dailyMetrics.exerciseGoal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textColor mt-1">
              {((dailyMetrics.exercise / dailyMetrics.exerciseGoal) * 100).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaAppleAlt className="text-green-500 text-xl" />
                <span className="font-semibold text-headingColor">Calories</span>
              </div>
              <span className="text-sm text-textColor">
                {dailyMetrics.calories} / {dailyMetrics.caloriesGoal} kcal
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getProgressColor(dailyMetrics.calories, dailyMetrics.caloriesGoal)}`}
                style={{ width: `${(dailyMetrics.calories / dailyMetrics.caloriesGoal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textColor mt-1">
              {((dailyMetrics.calories / dailyMetrics.caloriesGoal) * 100).toFixed(0)}% of daily goal
            </p>
          </div>
        </div>
      </div>

      {/* Blood Pressure Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-4">Blood Pressure Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bloodPressureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Systolic"
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Diastolic"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-textColor">
            <strong>Current Status:</strong> <span className={bpStatus.color}>{bpStatus.text}</span>
          </p>
          <p className="text-xs text-textColor mt-1">
            Normal blood pressure is below 120/80 mmHg
          </p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-4">Weight Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#8b5cf6" 
              fill="#a78bfa"
              name="Weight (kg)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textColor">
                <strong>Current BMI:</strong> {vitals.bmi} - <span className={bmiCategory.color}>{bmiCategory.text}</span>
              </p>
              <p className="text-xs text-textColor mt-1">
                Normal BMI range: 18.5 - 24.9
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-textColor">
                <strong>Change:</strong> <span className="text-green-600">-1.5 kg</span>
              </p>
              <p className="text-xs text-textColor mt-1">Last 30 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Glucose Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-headingColor mb-4">Blood Glucose Today</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={glucoseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="meal" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[70, 160]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="level" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Glucose (mg/dL)"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-textColor">
            <strong>Target Ranges:</strong>
          </p>
          <ul className="text-xs text-textColor mt-2 space-y-1">
            <li>• Fasting: 70-100 mg/dL</li>
            <li>• Before meals: 70-130 mg/dL</li>
            <li>• 1-2 hours after meals: Less than 180 mg/dL</li>
          </ul>
        </div>
      </div>

      {/* Health Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <FaHeartbeat className="text-green-600" />
            Positive Insights
          </h4>
          <ul className="space-y-2 text-sm text-textColor">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Your blood pressure is within normal range</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>You're maintaining a healthy BMI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Blood glucose levels are well controlled</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-6">
          <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
            <FaChartLine className="text-orange-600" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2 text-sm text-textColor">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">!</span>
              <span>Try to reach your daily step goal of 10,000 steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">!</span>
              <span>Increase water intake to 8 glasses per day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">!</span>
              <span>Aim for 60 minutes of exercise daily</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Log Health Data Modal - Full Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 my-8">
            <h3 className="text-xl font-bold mb-4 text-headingColor">Log Health Metrics</h3>
            <p className="text-sm text-textColor mb-6">Fill in the metrics you want to track. At least one field is required.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              {/* Date */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-headingColor mb-1">Date</label>
                <input
                  type="date"
                  value={metricForm.date}
                  onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Systolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="e.g., 120"
                  value={metricForm.systolic}
                  onChange={(e) => setMetricForm({ ...metricForm, systolic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Diastolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="e.g., 80"
                  value={metricForm.diastolic}
                  onChange={(e) => setMetricForm({ ...metricForm, diastolic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g., 72"
                  value={metricForm.heartRate}
                  onChange={(e) => setMetricForm({ ...metricForm, heartRate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Vitals */}
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 36.8"
                  value={metricForm.temperature}
                  onChange={(e) => setMetricForm({ ...metricForm, temperature: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 74.5"
                  value={metricForm.weight}
                  onChange={(e) => setMetricForm({ ...metricForm, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">BMI</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 24.2"
                  value={metricForm.bmi}
                  onChange={(e) => setMetricForm({ ...metricForm, bmi: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Blood Glucose & Oxygen */}
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Glucose (mg/dL)</label>
                <input
                  type="number"
                  placeholder="e.g., 95"
                  value={metricForm.glucose}
                  onChange={(e) => setMetricForm({ ...metricForm, glucose: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Oxygen (%)</label>
                <input
                  type="number"
                  placeholder="e.g., 98"
                  value={metricForm.oxygen}
                  onChange={(e) => setMetricForm({ ...metricForm, oxygen: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Daily Activity */}
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Steps</label>
                <input
                  type="number"
                  placeholder="e.g., 8500"
                  value={metricForm.steps}
                  onChange={(e) => setMetricForm({ ...metricForm, steps: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Water (glasses)</label>
                <input
                  type="number"
                  placeholder="e.g., 6"
                  value={metricForm.water}
                  onChange={(e) => setMetricForm({ ...metricForm, water: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Sleep (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 7.5"
                  value={metricForm.sleep}
                  onChange={(e) => setMetricForm({ ...metricForm, sleep: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  placeholder="e.g., 1850"
                  value={metricForm.calories}
                  onChange={(e) => setMetricForm({ ...metricForm, calories: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-headingColor mb-1">Exercise (mins)</label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  value={metricForm.exercise}
                  onChange={(e) => setMetricForm({ ...metricForm, exercise: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddForm(false)} 
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMetric}
                className="px-6 py-2 rounded-lg bg-primaryColor text-white hover:bg-blue-700"
              >
                Save Metrics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTracker;
