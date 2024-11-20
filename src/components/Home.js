import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';

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

function Home() {
  const [empleados, setEmpleados] = useState({});
  const [timers, setTimers] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const empleadosRef = ref(db, 'empleados');
    const timersRef = ref(db, 'timers');

    // Cargamos los empleados desde Firebase
    onValue(empleadosRef, (snapshot) => {
      const empleadosData = snapshot.val() || {};
      setEmpleados(empleadosData);
      localStorage.setItem('empleados', JSON.stringify(empleadosData));
    });

    // Cargamos los timers desde Firebase y actualizamos el estado
    onValue(timersRef, (snapshot) => {
      const timersData = snapshot.val() || {};
      setTimers(timersData);

      localStorage.setItem('timers', JSON.stringify(timersData));
    });

    // Actualizamos el tiempo actual cada segundo
    const intervalId = setInterval(() => setCurrentTime(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getDayOfWeek = (date) => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getElapsedTime = (startTime, duration) => {
    if (!startTime || startTime > currentTime) return { elapsed: 0, extra: null };
    const elapsedTime = currentTime - startTime;
    return elapsedTime > duration
      ? { elapsed: duration, extra: elapsedTime - duration }
      : { elapsed: elapsedTime, extra: null };
  };

  // Función para iniciar el temporizador
  const startTimer = (key) => {
    const now = new Date();
    const timerData = {
      startTime: now.getTime(), // Tiempo de inicio
      timerDuration: 30 * 60 * 1000, // 30 minutos
      startDay: getDayOfWeek(now), // Día de inicio
      extraTime: null,
      isActive: true, // Temporizador activo
    };

    // Guardar el estado del temporizador en Firebase
    set(ref(db, `timers/${key}`), timerData);

    // Actualizar el temporizador en local
    setTimers((prevState) => ({
      ...prevState,
      [key]: timerData,
    }));
  };

// Función para reiniciar el temporizador y guardar el registro
const resetTimer = (key) => {
  const timer = timers[key];
  const { elapsed, extra } = timer ? getElapsedTime(timer.startTime, timer.timerDuration) : { elapsed: 0, extra: null };

  if (timer && elapsed > 0) {
    // Guardar el tiempo transcurrido en Firebase antes de reiniciar
    const registroRef = push(ref(db, `empleados/${key}/registros`));
    set(registroRef, {
      fechaInicio: new Date(timer.startTime).toLocaleString(),
      fechaFin: new Date().toLocaleString(),
      diaInicio: timer.startDay,
      tiempoFinal: formatTime(elapsed),
      tiempoExtra: extra ? formatTime(extra) : '0s', // Aseguramos que solo se guarde si hay tiempo extra
    });
  }

  // Reiniciar el temporizador (borrar en Firebase)
  set(ref(db, `timers/${key}`), null);

  // Limpiar el temporizador en local
  setTimers((prevState) => ({ ...prevState, [key]: null }));
};


  return (
    <div>
      {Object.keys(empleados).length === 0 ? (
        <p>No hay empleados para mostrar.</p>
      ) : (
        Object.keys(empleados).map((key) => {
          const timer = timers[key];
          const { elapsed, extra } = timer ? getElapsedTime(timer.startTime, timer.timerDuration) : { elapsed: 0, extra: null };

          return (
            <div key={key} className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="card-title">
                    {empleados[key]?.nombre} {empleados[key]?.apellido}
                  </div>
                  <div className="card">
                    <div className="card-body">
                      {elapsed > 0 && (
                        <div>
                          <p>Iniciado el: {timer?.startDay}</p>
                          <p>Tiempo transcurrido: {formatTime(elapsed)}</p>
                          {extra && <p>Tiempo extra: {formatTime(extra)}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button className='btn btn-primary w-50' onClick={() => startTimer(key)}>
                      {timer?.isActive ? 'Contador en marcha' : 'Iniciar Contador'}
                    </button>
                    <button className='btn btn-danger w-50' onClick={() => resetTimer(key)}>Reiniciar Contador</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;
