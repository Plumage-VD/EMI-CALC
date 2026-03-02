import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import EMISimulator from './pages/EMISimulator';
import AvailableSoon from './pages/AvailableSoon';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/emi-simulator" element={<EMISimulator />} />
          <Route path="/refinancing-analyzer" element={<AvailableSoon title="Refinancing Analyzer" description="Compare your current loan with refinancing options to find the best deal." />} />
          <Route path="/rent-vs-buy" element={<AvailableSoon title="Rent vs Buy Calculator" description="Make informed decisions about renting versus buying property based on your financial situation." />} />
          <Route path="/sip-vs-prepayment" element={<AvailableSoon title="SIP vs Prepayment" description="Analyze whether investing in SIP or prepaying your loan yields better returns." />} />
          <Route path="/financial-health" element={<AvailableSoon title="Financial Health Dashboard" description="Get a comprehensive view of your overall financial wellness and personalized recommendations." />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

export default App;
