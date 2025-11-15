const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  console.error(err);
  
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Registro duplicado. Este valor ya existe en la base de datos.';
    error = { message };
  }
  
  if (err.code === 'ECONNREFUSED') {
    const message = 'Error de conexión a la base de datos. Verifique que MySQL esté en ejecución.';
    error = { message };
  }
  
  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Error en la consulta SQL.';
    error = { message };
  }
  
  if (err.name === 'ValidationError') {
    const message = typeof err.errors === 'object' 
      ? Object.values(err.errors).map(val => val.message).join(', ')
      : 'Error de validación';
    error = { message };
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
