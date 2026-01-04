import { useEffect } from 'react';
import PlannerLayout from './components/PlannerLayout';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import DebugConsole from './components/DebugConsole';

function App() {
  // Global init or auth checks can go here
  useEffect(() => {
    // console.log('App mounted');
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <LoginModal />
      <Navbar />
      <div className="flex-1 relative w-full h-full flex flex-col">
        <PlannerLayout />

        {/* Debug Console */}
        <DebugConsole />
      </div>
    </div>
  );
}

export default App;
