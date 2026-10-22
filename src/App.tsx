import { useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { selectDashboard } from './lib/selectors/dashboard';
import type { DateRange, Scenario } from './types/models';
import './App.css';

function App() {
  const [country, setCountry] = useState('All countries');
  const [dateRange, setDateRange] = useState<DateRange>('campaign');
  const [scenario, setScenario] = useState<Scenario>('base');
  const [horizon, setHorizon] = useState<4 | 8 | 12>(12);
  const snapshot = useMemo(
    () => selectDashboard({ country, dateRange }, scenario, horizon),
    [country, dateRange, scenario, horizon],
  );

  return (
    <Dashboard
      snapshot={snapshot}
      country={country}
      dateRange={dateRange}
      scenario={scenario}
      horizon={horizon}
      onCountryChange={setCountry}
      onDateRangeChange={setDateRange}
      onScenarioChange={setScenario}
      onHorizonChange={setHorizon}
    />
  );
}

export default App;