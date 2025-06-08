import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';

function App() {
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
