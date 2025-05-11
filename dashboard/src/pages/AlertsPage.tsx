import { useState, useEffect } from 'react';
import axios from 'axios';

interface AlertRule {
  id: number;
  name: string;
  condition: string;
  threshold: number;
  isActive: boolean;
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    threshold: 0,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get('/api/alerts');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/alerts', newRule);
      setNewRule({ name: '', condition: '', threshold: 0 });
      fetchRules();
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  };

  const toggleRule = async (id: number, isActive: boolean) => {
    try {
      await axios.patch(`/api/alerts/${id}`, { isActive: !isActive });
      fetchRules();
    } catch (error) {
      console.error('Error toggling alert rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Add New Alert Rule</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <select
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select condition</option>
              <option value="error_rate">Error Rate</option>
              <option value="response_time">Response Time</option>
              <option value="cpu_usage">CPU Usage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Threshold</label>
            <input
              type="number"
              value={newRule.threshold}
              onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Rule
          </button>
        </form>
      </div>

      {/* Active Rules List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Active Rules</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <li key={rule.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                  <p className="text-sm text-gray-500">
                    {rule.condition} {'>'} {rule.threshold}
                  </p>
                </div>
                <button
                  onClick={() => toggleRule(rule.id, rule.isActive)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rule.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 