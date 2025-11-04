import { useEffect } from 'react';
import { useScheduleStore } from './stores/scheduleStore';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';

function App() {
  const loadFromLocalStorage = useScheduleStore(state => state.loadFromLocalStorage);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
