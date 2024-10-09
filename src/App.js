import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Employees from './components/Employees';
import Navbar from './components/Nabvar';
function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empleados"  element={ <Employees/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
