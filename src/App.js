import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Employees from './components/Employees';
import Navbar from './components/Nabvar';
import Datos from './components/Datos';

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empleados"  element={ <Employees/> } />
        <Route path='/datos' element={<Datos/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
