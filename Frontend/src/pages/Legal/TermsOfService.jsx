import React from 'react';

const TermsOfService = () => {
  return (
    <section className="pt-10 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-headingColor mb-6">Términos y Condiciones del Servicio</h1>
        <p className="text-gray-600 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700">
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold text-yellow-700 mb-3">Aviso Importante: Telemedicina</h2>
            <p>
              Los servicios prestados a través de esta plataforma se rigen por la normativa de <strong>Telemedicina y Telesalud en Colombia (Resolución 2654 de 2019)</strong>. 
              Al usar este servicio, usted acepta las limitaciones inherentes a la atención virtual.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">1. Aceptación de los Términos</h3>
            <p>
              Al registrarse y utilizar Basileiás, usted acepta vincularse jurídicamente por estos Términos y Condiciones. 
              Si no está de acuerdo con alguno de ellos, debe abstenerse de utilizar la plataforma.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">2. Descripción del Servicio</h3>
            <p>
              La plataforma facilita la conexión entre profesionales de la salud (psicólogos, médicos) y pacientes para la realización de consultas virtuales, 
              gestión de citas y almacenamiento de historia clínica electrónica.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">3. Requisitos para la Atención Virtual</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contar con una conexión a internet estable y un dispositivo con cámara y micrófono funcionales.</li>
              <li>Estar en un lugar privado, iluminado y libre de interrupciones durante la sesión.</li>
              <li>Proporcionar información veraz y completa sobre su estado de salud e identidad.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">4. Manejo de Crisis y Emergencias</h3>
            <p className="font-semibold text-red-600 mb-2">
              ESTE SERVICIO NO ES PARA EMERGENCIAS MÉDICAS O PSIQUIÁTRICAS INMINENTES.
            </p>
            <p>
              Si usted o alguien más está en peligro inmediato, debe acudir al servicio de urgencias más cercano o llamar a la línea de emergencias nacional (123 en Colombia). 
              El profesional podrá activar protocolos de emergencia si detecta un riesgo inminente durante la sesión.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">5. Consentimiento Informado</h3>
            <p>
              Antes de iniciar cualquier tratamiento, se requerirá su consentimiento informado explícito, donde se detallan los alcances, riesgos y beneficios de la intervención, 
              así como las particularidades de la modalidad virtual.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">6. Pagos y Cancelaciones</h3>
            <p>
              Las tarifas son establecidas por cada profesional. Las cancelaciones deben realizarse con la antelación estipulada en la política de cada profesional 
              (generalmente 24 horas) para evitar cobros por inasistencia.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">7. Propiedad Intelectual</h3>
            <p>
              Todo el contenido de la plataforma (software, textos, marcas) es propiedad exclusiva de Basileiás o sus licenciantes. 
              Está prohibida la grabación de las sesiones por parte del paciente sin autorización escrita del profesional.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
