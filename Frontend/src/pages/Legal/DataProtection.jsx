import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section className="pt-10 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-headingColor mb-6">Política de Privacidad y Tratamiento de Datos</h1>
        <p className="text-gray-600 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-primaryColor">
            <h2 className="text-xl font-bold text-primaryColor mb-3">Marco Legal Colombiano</h2>
            <p>
              Esta política se rige por la Constitución Política de Colombia (Art. 15), la <strong>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales), 
              el Decreto 1377 de 2013, la <strong>Ley 1090 de 2006</strong> (Código Deontológico del Psicólogo) y la <strong>Resolución 1995 de 1999</strong> (Manejo de Historia Clínica).
            </p>
          </div>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">1. Responsable del Tratamiento</h3>
            <p>
              <strong>Psiconepsis</strong> actúa como responsable del tratamiento de los datos personales recolectados a través de esta plataforma. 
              Los datos sensibles de salud son tratados bajo estricta confidencialidad profesional.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">2. Finalidad del Tratamiento</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Prestación de Servicios de Salud:</strong> Agendamiento, realización de teleconsultas y seguimiento clínico.</li>
              <li><strong>Gestión de Historia Clínica:</strong> Registro y custodia de la información clínica conforme a la Res. 1995/99.</li>
              <li><strong>Contacto:</strong> Envío de recordatorios de citas, información de salud relevante y respuestas a PQR.</li>
              <li><strong>Seguridad:</strong> Verificación de identidad y prevención de fraudes.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">3. Derechos de los Titulares (Habeas Data)</h3>
            <p className="mb-2">Como titular de los datos, usted tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato (salvo deber legal de conservación, como la Historia Clínica).</li>
              <li>Acceder gratuitamente a sus datos personales.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">4. Datos Sensibles y de Menores</h3>
            <p>
              El tratamiento de datos sensibles (salud, orientación sexual, etc.) se realiza con las debidas garantías de seguridad. 
              En el caso de menores de edad, el tratamiento se realiza respetando el interés superior del niño, niña o adolescente, y requiere autorización de su representante legal.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">5. Seguridad de la Información</h3>
            <p>
              Implementamos medidas técnicas, humanas y administrativas para proteger la información:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Encriptación de datos en tránsito y reposo.</li>
              <li>Acceso restringido mediante autenticación segura.</li>
              <li>Copias de seguridad periódicas.</li>
              <li>Protocolos de confidencialidad para el personal autorizado.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">6. Historia Clínica</h3>
            <p>
              La Historia Clínica es un documento privado, obligatorio y sometido a reserva. Solo puede ser conocido por terceros previa autorización del paciente o en los casos previstos por la ley. 
              Su custodia se garantiza por un periodo mínimo de 20 años contados a partir de la última atención.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-headingColor mb-3">7. Contacto</h3>
            <p>
              Para ejercer sus derechos de Habeas Data, puede contactarnos a través de nuestros canales oficiales de soporte o en la sección de "Contáctanos".
            </p>
          </section>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
