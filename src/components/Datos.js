import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAZoWHkLVPNfIgDZBr6yHcN5cmWLTFrWFM",
  authDomain: "checador-movil-carquin.firebaseapp.com",
  databaseURL: "https://checador-movil-carquin-default-rtdb.firebaseio.com",
  projectId: "checador-movil-carquin",
  storageBucket: "checador-movil-carquin.appspot.com",
  messagingSenderId: "982161374395",
  appId: "1:982161374395:web:d93c4cace06f7f77b6bd9e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Función para convertir la fecha del formato 'DD/MM/YYYY, HH:mm:ss a' a un objeto Date
const convertirFecha = (fechaStr) => {
  const [fecha, hora] = fechaStr.split(', ');
  const [dia, mes, año] = fecha.split('/').map(Number);
  const [horaStr, periodo] = hora.split(' ');
  let [horas, minutos, segundos] = horaStr.split(':').map(Number);

  // Ajustar horas para el formato 12 horas
  if (periodo === 'p.m.' && horas < 12) {
    horas += 12;
  } else if (periodo === 'a.m.' && horas === 12) {
    horas = 0;
  }

  return new Date(año, mes - 1, dia, horas, minutos, segundos);
};

// Función para convertir la fecha del formato 'YYYY-MM-DD' a 'DD/MM/YYYY'
const convertirFechaParaFiltrar = (fechaStr) => {
  const [año, mes, dia] = fechaStr.split('-').map(Number);
  return new Date(año, mes - 1, dia);
};

const Datos = () => {
  const [empleados, setEmpleados] = useState({});
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState({});

  // Carga los datos de empleados desde Firebase
  useEffect(() => {
    const empleadosRef = ref(db, 'empleados');

    onValue(empleadosRef, (snapshot) => {
      const empleadosData = snapshot.val();
      setEmpleados(empleadosData || {});
    });
  }, []);

  // Filtra los registros por fecha
  const filtrarRegistrosPorFecha = () => {
    if (!fechaInicio || !fechaFin) return;

    const empleadosFiltradosLocal = {};
    const fechaInicioDate = convertirFechaParaFiltrar(fechaInicio);
    const fechaFinDate = convertirFechaParaFiltrar(fechaFin);

    // Ajustar la fecha de fin para incluir todo el día
    fechaFinDate.setHours(23, 59, 59, 999);

    Object.entries(empleados).forEach(([id, empleado]) => {
      const registros = empleado.registros || {};
      const registrosFiltrados = Object.entries(registros).filter(([registroId, registro]) => {
        const fechaRegistroInicio = convertirFecha(registro.fechaInicio);
        const fechaRegistroFin = convertirFecha(registro.fechaFin);
        return (fechaRegistroInicio >= fechaInicioDate && fechaRegistroInicio <= fechaFinDate) ||
               (fechaRegistroFin >= fechaInicioDate && fechaRegistroFin <= fechaFinDate);
      });

      if (registrosFiltrados.length > 0) {
        empleadosFiltradosLocal[id] = {
          ...empleado,
          registros: Object.fromEntries(registrosFiltrados)
        };
      }
    });

    setEmpleadosFiltrados(empleadosFiltradosLocal);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Lista de Empleados</h1>
      
      <div className="mb-4">
        <label>Fecha Inicio:</label>
        <input type="date" value={fechaInicio} onChange={( e) => setFechaInicio(e.target.value)} />
        
        <label>Fecha Fin:</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        
        <button className="btn btn-primary ml-2" onClick={filtrarRegistrosPorFecha}>Filtrar Registros</button>
      </div>

      {/* Mostrar las fechas seleccionadas */}
      {fechaInicio && fechaFin && (
        <div className="mb-4">
          <h4>Rango de Fechas Seleccionado:</h4>
          <p>Desde: {fechaInicio} Hasta: {fechaFin}</p>
        </div>
      )}

      {Object.entries(empleadosFiltrados).length === 0 ? (
        <p>No hay registros disponibles para el rango de fechas seleccionado.</p>
      ) : (
        Object.entries(empleadosFiltrados).map(([id, empleado]) => (
          <div key={id} className="mb-4">
            <h2>{`${empleado.nombre} ${empleado.apellido}`}</h2>
            {empleado.registros ? (
              <table className="table table-striped table-bordered" style={{ width: "100%", tableLayout: "fixed" }}>
                <thead className="thead-dark">
                  <tr>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Tiempo Final</th>
                    <th>Tiempo Extra</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(empleado.registros).map(([registroId, registro]) => (
                    <tr key={registroId}>
                      <td>{registro.fechaInicio}</td>
                      <td>{registro.fechaFin}</td>
                      <td>{registro.tiempoFinal}</td>
                      <td>{registro.tiempoExtra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay registros disponibles para este empleado.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Datos;