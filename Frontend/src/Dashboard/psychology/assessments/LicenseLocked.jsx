const LicenseLocked = ({ instrument }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-md p-8 border border-red-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-headingColor">{instrument}</h1>
          <p className="text-textColor mt-2">Instrumento protegido. No disponible en la plataforma.</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Licencia requerida</h2>
          <p className="text-red-700 text-sm">
            Este instrumento está protegido por derechos de autor. Para publicarlo digitalmente se requiere una licencia
            escrita del titular (Beck et al.). Hasta contar con esa autorización, el contenido no está disponible.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Si ya cuentas con la licencia, compártela con el equipo administrativo para habilitar el acceso.
        </p>
      </div>
    </div>
  );
};

export default LicenseLocked;
