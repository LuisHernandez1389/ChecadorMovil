import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

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
    // Obtener empleados y timers desde Firebase
    const empleadosRef = ref(db, 'empleados');
    onValue(empleadosRef, (snapshot) => {
      const empleadosData = snapshot.val();
      setEmpleados(empleadosData || {});
    });



    const timersRef = ref(db, 'timers');
    onValue(timersRef, (snapshot) => {
      const timersData = snapshot.val();
      setTimers(timersData || {});
    });

    // Actualizar la hora actual cada segundo
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    // Limpiar el intervalo al cerrar el componente
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetch('https://checador-movil-carquin-default-rtdb.firebaseio.com/empleados.json')
      .then((response) => response.json())
      .then((data) => {
        caches.open('checador-movil-cache').then((cache) => {
          cache.put('firebase-data', new Response(JSON.stringify(data)));
        });
      });
  }, []);

  const startTimer = (key) => {
    const timerData = {
      startTime: Date.now(),
      timerDuration: 30 * 60 * 1000, // 30 minutos en milisegundos
      extraTime: null,
    };
    set(ref(db, `timers/${key}`), timerData);
  };

  const resetTimer = (key) => {
    set(ref(db, `timers/${key}`), null);
  };

  const getElapsedTime = (startTime, duration) => {
    if (!startTime || startTime > currentTime) {
      return {
        elapsed: 0,
        extra: null,
      };
    }

    const elapsedTime = currentTime - startTime;

    if (elapsedTime > duration) {
      return {
        elapsed: duration,
        extra: elapsedTime - duration,
      };
    }
    return {
      elapsed: elapsedTime,
      extra: null,
    };
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div>
      {Object.keys(empleados).length === 0 ? (
        <p>No hay empleados para mostrar.</p>
      ) : (
        Object.keys(empleados).map((key) => {
          const timer = timers[key];
          let elapsed = 0;
          let extra = null;

          if (timer) {
            const { elapsed: elapsedTime, extra: extraTime } = getElapsedTime(timer.startTime, timer.timerDuration);
            elapsed = elapsedTime;
            extra = extraTime;
          }

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
                          <p>Tiempo transcurrido: {formatTime(elapsed)}</p>
                          {extra && (
                            <p>Tiempo extra: {formatTime(extra)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button className='btn btn-primary w-50' onClick={() => startTimer(key)}>Iniciar Contador</button>
                    <button className='btn btn-warning w-50' onClick={() => resetTimer(key)}>Reiniciar Contador</button>
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