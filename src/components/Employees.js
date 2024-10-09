import React, { useState } from 'react';

function Employees() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const empleado = {
      nombre,
      apellido,
    };
    fetch('https://checador-movil-carquin-default-rtdb.firebaseio.com/empleados.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empleado),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
    setNombre('');
    setApellido('');
  };

  return (
    <div className="container">
      <h1>Registro de Empleados</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre:</label>
          <input type="text" className="form-control" id="nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="apellido" className="form-label">Apellido:</label>
          <input type="text" className="form-control" id="apellido" value={apellido} onChange={(event) => setApellido(event.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-100">Registrar</button>      </form>
    </div>
  );
}

export default Employees;