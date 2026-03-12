import React, { useState, useRef, useEffect } from 'react';

const InformedConsent = () => {
    // Log de trazabilidad para confirmar montaje en frontend
    useEffect(() => {
        console.info('Consentimiento Basileias v2025-01-12 renderizado');
    }, []);

    const [formData, setFormData] = useState({
        fullName: '',
        documentType: 'CC',
        documentNumber: '',
        email: '',
        address: '',
        phone: '',
        acceptTerms: false,
        acceptTelepsychology: false,
        acceptPrivacy: false,
        acceptEmergency: false,
        acceptFees: false,
    });

    const [signedDate, setSignedDate] = useState(null);
    const [ipAddress, setIpAddress] = useState('192.168.x.x'); 
    
    const componentRef = useRef();

    useEffect(() => {
        setIpAddress('190.x.x.x (Verificado)');
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSign = (e) => {
        e.preventDefault();
        const allChecked = formData.acceptTerms && formData.acceptTelepsychology && 
                           formData.acceptPrivacy && formData.acceptEmergency && formData.acceptFees;
        
        if (allChecked) {
            const now = new Date();
            setSignedDate(now.toLocaleString('es-CO', { timeZone: 'America/Bogota' }));
            setTimeout(() => window.print(), 800);
        } else {
            alert("Es necesario aceptar todas las cláusulas obligatorias para perfeccionar el consentimiento.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-serif text-slate-800">
            
            {/* Action Bar flotante */}
            <div className="fixed bottom-6 right-6 z-50 print:hidden flex gap-3">
                {signedDate && (
                    <button 
                        onClick={handlePrint}
                        className="bg-slate-900 hover:bg-black text-white shadow-xl rounded-full px-6 py-4 transition-all transform hover:scale-105 flex items-center gap-3 font-bold tracking-wide"
                        title="Descargar PDF Vinculante"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden md:inline">DESCARGAR EXPEDIENTE LEGAL</span>
                    </button>
                )}
            </div>

            {/* Documento "Papel" */}
            <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:w-full print:max-w-none border border-slate-300" ref={componentRef}>
                
                {/* --- HEADER --- */}
                <div className="bg-white border-b-4 border-slate-900 p-8 print:p-0 print:border-b-2 print:mb-6">
                    <div className="flex flex-row justify-between items-start gap-6">
                        <div className="flex items-start gap-5">
                        <div className="flex flex-col pt-0.5">
                            <span 
                                className="text-[2rem] font-normal tracking-tight leading-none text-slate-900 print:text-slate-900"
                                style={{ 
                                    fontFamily: "'Cormorant Garamond', 'Libre Baskerville', 'Crimson Text', Georgia, serif",
                                    fontWeight: 500,
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                Βασιλειάς
                            </span>
                            <span 
                                className="text-[0.5rem] font-medium tracking-[0.32em] text-slate-500 uppercase mt-0.5 ml-0.5 print:text-slate-600"
                                style={{ 
                                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                                    fontWeight: 500
                                }}
                            >
                                BASILEIÁS
                            </span>
                        </div>
                        <div className="text-left mt-1">
                            <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900 leading-tight">Basileiás S.A.S.</h1>
                                <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">Nit: 901.XXX.XXX-X</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">Habilitación servicios de salud: Código XXXXX</p>
                            </div>
                        </div>
                        <div className="text-right w-auto">
                            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">Consentimiento Informado</h2>
                            <p className="text-xs font-bold text-slate-600 uppercase">Para Telepsicología Clínica</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 mb-2">CÓDIGO: LEG-CLI-001 | V.2025</p>
                            <p className="text-[0.65rem] italic text-slate-500 font-serif leading-tight">
                                "Όπου η χρεία, εκεί και η διακονία"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-10 md:p-14 space-y-8 text-justify leading-relaxed text-sm md:text-[15px] text-slate-800 print:p-0">
                    
                    {/* Preámbulo Legal */}
                    <div className="bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 font-medium uppercase tracking-wide mb-6">
                        <p>Documento legal vinculante regido por la Ley 1090 de 2006, Ley 1581 de 2012, Resolución 2654 de 2019 y demás normas concordantes de la República de Colombia.</p>
                    </div>

                    <p>
                        Yo, identificado(a) como aparece al pie de mi firma, en pleno uso de mis facultades legales y mentales, otorgo mi <strong>CONSENTIMIENTO LIBRE, PREVIO, EXPRESO E INFORMADO</strong> a <strong>BASILEIÁS S.A.S.</strong> y a sus profesionales adscritos, para la prestación de servicios de psicología clínica bajo la modalidad de telepsicología (virtual).
                    </p>

                    <p>
                        Declaro que he recibido información clara, suficiente y veraz sobre la naturaleza, propósito, riesgos y alternativas del servicio, comprendiendo y aceptando las siguientes cláusulas contractuales y clínicas:
                    </p>

                    <div className="space-y-6 mt-6">
                        
                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">1. Naturaleza y Objeto del Servicio Clínico</h3>
                            <p>
                                El servicio contratado consiste estrictamente en <strong>intervención psicológica clínica basada en la evidencia</strong> (modelos Cognitivo-Conductuales y/o Contextuales). El objetivo es la evaluación, diagnóstico y tratamiento de condiciones de salud mental o malestar psicológico.
                            </p>
                            <p className="mt-2 font-semibold">Exclusiones Expresas:</p>
                            <p>
                                Se deja constancia explícita de que este servicio <strong>NO INCLUYE</strong> ni constituye: (i) procesos de Coaching, (ii) asesoría espiritual o religiosa, (iii) prácticas esotéricas o pseudocientíficas, (iv) peritajes forenses para litigios (salvo contratación específica diversa), ni (v) servicios de acompañamiento no clínico.
                            </p>
                            <p className="mt-2">
                                <strong>Corresponsabilidad y Naturaleza del Proceso:</strong> Entendemos la terapia como un viaje compartido donde el éxito se construye a dos manos. Nuestro compromiso "de medios" es brindarle la mejor guía científica y humana posible. Sin embargo, es vital comprender que en salud mental <strong>no existen "curas mágicas" ni resultados garantizados</strong>, pues la transformación real proviene de su propio interior. El alivio del malestar depende fundamentalmente de <strong>su participación activa, su constancia y su voluntad de cambio</strong>; nosotros le daremos las herramientas y el mapa, pero es usted quien recorre el camino hacia su propio bienestar.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">2. Modalidad de Telepsicología (Riesgos Tecnológicos)</h3>
                            <p>
                                La atención se prestará 100% de forma remota a través de plataformas de videollamada segura. Como usuario, declaro conocer y asumir los riesgos inherentes a la tecnología:
                            </p>
                            <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                                <li>Posibles fallas de conectividad, interrupción de servicios de internet o fluido eléctrico que puedan afectar la calidad o continuidad de la sesión.</li>
                                <li>Vulnerabilidades de seguridad informática ajenas al control razonable del profesional (malware en el dispositivo del paciente, redes wifi inseguras).</li>
                            </ul>
                            <p className="mt-2">
                                Me comprometo a garantizar condiciones de <strong>privacidad, iluminación y silencio</strong> en el entorno desde donde tomo la consulta. Entiendo que el profesional podrá suspender la sesión si considera que no existen las condiciones mínimas para un acto clínico seguro y confidencial.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">3. Protocolo Estricto de Emergencias y Crisis</h3>
                            <div className="bg-red-50 border-l-4 border-red-700 p-3 my-2 text-red-900 text-sm font-medium">
                                ADVERTENCIA: BASILEIÁS NO ES UN SERVICIO DE EMERGENCIAS NI DE URGENCIAS VITALES.
                            </div>
                            <p>
                                El servicio no opera 24/7. En caso de presentar crisis severa, ideación suicida inminente, conducta autolesiva, riesgo de homicidio o psicosis aguda, me obligo a:
                            </p>
                            <ol className="list-decimal list-outside ml-5 mt-1 space-y-1">
                                <li>Acudir inmediatamente al servicio de urgencias médicas más cercano.</li>
                                <li>Contactar a la Línea Nacional de Emergencia 123 o Línea Psicoactiva (01 8000 112 439).</li>
                                <li>Activar mi red de apoyo familiar.</li>
                            </ol>
                            <p className="mt-2">
                                Autorizo al profesional a contactar a mi acudiente o contacto de emergencia identificado en la historia clínica si, a su juicio profesional, existe un riesgo inminente para mi integridad o la vida, incluso sin mi consentimiento inmediato.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">4. Confidencialidad y Levantamiento del Secreto Profesional</h3>
                            <p>
                                Toda la información consignada en la Historia Clínica es confidencial y está protegida por el Secreto Profesional (Artículo 74 de la Constitución Política y Ley 1090 de 2006).
                            </p>
                            <p className="mt-2">
                                No obstante, entiendo que el profesional tiene el <strong>deber legal y ético de reportar</strong> a las autoridades competentes y/o familiares, levantando la reserva, exclusivamente en los siguientes casos taxativos:
                            </p>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
                                <li>Si existe un riesgo claro, inminente y grave de daño a mi propia vida o integridad física (suicidio).</li>
                                <li>Si existe un riesgo claro e inminente de daño a terceros (homicidio, lesiones).</li>
                                <li>Si se detecta o sospecha abuso sexual, físico o psicológico hacía menores de edad, adultos mayores o personas en situación de discapacidad.</li>
                                <li>Por orden escrita de autoridad competente judicial o disciplinaria.</li>
                            </ul>
                        </section>

                         <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">5. Prohibición de Registro y Grabación</h3>
                            <p>
                                Con el fin de proteger la privacidad de ambas partes y la propiedad intelectual del proceso terapéutico, <strong>ESTÁ TERMINANTEMENTE PROHIBIDO</strong> grabar, filmar, capturar pantalla o registrar por cualquier medio de reproducción de audio o video el desarrollo de las sesiones, sin autorización escrita previa y explícita de ambas partes. La violación de esta cláusula podrá acarrear la terminación unilateral del servicio y las acciones legales pertinentes.
                            </p>
                        </section>

                         <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">6. Tratamiento de Datos Personales (Habeas Data)</h3>
                            <p>
                                En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, autorizo a Basileiás S.A.S. para recolectar, almacenar y tratar mis datos personales y sensibles (datos de salud mental) con la finalidad exclusiva de:
                            </p>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-1 mb-2">
                                <li>Prestación del servicio asistencial y gestión de la Historia Clínica (custodia legal por 20 años según Res 1995/99).</li>
                                <li>Procesos administrativos, de facturación y auditoría de calidad de salud.</li>
                                <li>Cumplimiento de órdenes legales o judiciales.</li>
                            </ul>
                            <p>
                                Declaro haber sido informado de mis derechos a conocer, actualizar y rectificar mi información. La política de tratamiento de datos está disponible para consulta en la plataforma.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">7. Honorarios y Cancelaciones</h3>
                            <p>
                                Acepto las tarifas vigentes informadas previamente. Toda cita debe ser pagada antes de su realización. Las cancelaciones o reprogramaciones deben notificarse con al menos <strong>24 horas de antelación</strong>. Entiendo y acepto que la inasistencia o cancelación tardía sin justa causa comprobada (fuerza mayor) generará el cobro de la sesión, en virtud del tiempo profesional reservado y no utilizado.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-900 border-b border-slate-300 mb-2 uppercase text-sm">8. Revocatoria y Jurisdicción</h3>
                            <p>
                                Puedo revocar este consentimiento en cualquier momento mediante manifestación escrita, sin que ello afecte la legalidad de los tratamientos ya realizados ni la obligación de custodia de la Historia Clínica.
                            </p>
                            <p className="mt-2">
                                El presente contrato se rige por las leyes de la República de Colombia. Cualquier controversia se someterá a la jurisdicción ordinaria colombiana.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 bg-gray-50 p-4 border border-gray-300 text-sm text-center font-bold uppercase">
                        El diligenciamiento del siguiente formulario y el clic en el botón de firma constituyen una aceptación inequívoca de los términos legales descritos, con plena validez probatoria según la Ley 527 de 1999 (Comercio Electrónico y Mensajes de Datos).
                    </div>

                    {/* FORMULARIO DE FIRMA */}
                    
                    {!signedDate ? (
                         <div className="mt-8 bg-white border-t-2 border-slate-900 pt-8 print:hidden">
                            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest mb-6">Suscripción del Consentimiento</h3>

                            <form onSubmit={handleSign} className="space-y-6">
                                
                                <div className="space-y-3 bg-slate-50 p-6 rounded-sm border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Declaración Juramentada de Aceptación</p>
                                    {[
                                        { name: 'acceptTerms', text: 'ACEPTO el alcance clínico del servicio, sus exclusiones (no coaching) y la naturaleza de obligación de medios.' },
                                        { name: 'acceptTelepsychology', text: 'ACEPTO los riesgos tecnológicos de la telepsicología y me comprometo a no grabar las sesiones.' },
                                        { name: 'acceptEmergency', text: 'ENTIENDO que NO es un servicio de urgencias y conozco el protocolo para crisis vitales.' },
                                        { name: 'acceptFees', text: 'ACEPTO la política de honorarios y cobro por cancelación tardía (<24 horas).' },
                                        { name: 'acceptPrivacy', text: 'AUTORIZO el tratamiento de datos sensibles y clínicos conforme a la ley de Habeas Data.' }
                                    ].map((item, idx) => (
                                        <label key={idx} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-white transition">
                                            <input 
                                                type="checkbox" 
                                                name={item.name} 
                                                checked={formData[item.name]} 
                                                onChange={handleChange} 
                                                className="mt-1 w-5 h-5 text-slate-900 border-gray-400 rounded focus:ring-slate-900" 
                                                required 
                                            />
                                            <span className="text-sm text-slate-800 font-medium">{item.text}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nombre Completo del Paciente / Representante</label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-300 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition uppercase font-bold" required />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tipo Documento</label>
                                        <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-300 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none">
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                            <option value="TI">Tarjeta de Identidad</option>
                                            <option value="PA">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Número Documento</label>
                                        <input type="number" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-300 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none font-mono" required />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email para notificaciones legales</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-300 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none lowercase" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Dirección Física</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-300 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none uppercase" required />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] hover:bg-black transition-all shadow-lg mt-6"
                                >
                                    FIRMAR Y ACEPTAR
                                </button>
                                <p className="text-center text-[10px] text-slate-400 font-mono mt-2">
                                    IP Auditoría: {ipAddress} | TimeStamp: {new Date().toISOString()}
                                </p>
                            </form>
                        </div>
                    ) : (
                        /* ESTADO FIRMADO */
                        <div className="mt-12 border-t-2 border-slate-900 pt-8 print:mt-8 print:pt-4">
                            <div className="grid grid-cols-2 gap-16 print:gap-8">
                                {/* FIRMA PACIENTE */}
                                <div>
                                    <div className="h-24 flex items-end mb-2 relative">
                                        {/* Sello Digital Superpuesto */}
                                        <div className="absolute top-0 right-0 border-2 border-slate-200 text-slate-200 rounded-full w-24 h-24 flex items-center justify-center -rotate-12 opacity-50 print:border-black print:text-black print:opacity-100">
                                            <span className="text-[9px] font-black uppercase text-center leading-tight">Firma<br/>Electrónica<br/>Validada</span>
                                        </div>
                                        <span className="font-script text-3xl text-slate-900 italic relative z-10 p-2">{formData.fullName}</span>
                                    </div>
                                    <div className="border-t border-slate-900 pt-1">
                                        <p className="font-bold text-sm uppercase text-slate-900">EL PACIENTE / USUARIO</p>
                                        <p className="text-xs text-slate-600">CC/ID: {formData.documentNumber}</p>
                                        <div className="mt-2 text-[10px] font-mono text-slate-500">
                                            <p>FIRMADO DIGITALMENTE</p>
                                            <p>FECHA: {signedDate}</p>
                                            <p>IP: {ipAddress}</p>
                                            <p>HASH SHA-256: {btoa(formData.fullName + signedDate + formData.documentNumber).substring(0, 20)}...</p>
                                        </div>
                                    </div>
                                </div>

                                {/* FIRMA EMPRESA */}
                                <div className="text-right flex flex-col items-end">
                                    <div className="h-24 flex items-end mb-2">
                                        <span className="font-script text-2xl text-slate-500 italic pr-4">Basileiás Legal Dept.</span>
                                    </div>
                                    <div className="border-t border-slate-900 pt-1 w-full text-right">
                                        <p className="font-bold text-sm uppercase text-slate-900">BASILEIÁS S.A.S.</p>
                                        <p className="text-xs text-slate-600">NIT: 901.XXX.XXX-X</p>
                                        <p className="text-[10px] text-slate-500">Representación Legal & Dirección Clínica</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Legal del Documento */}
                <div className="bg-white p-8 border-t border-slate-200 text-center print:border-t-2 print:border-black mt-auto">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                        Documento generado electrónicamente bajo estándares de la Ley 527 de 1999.
                    </p>
                    <p className="text-[10px] text-slate-300 font-mono">
                        Basileiás S.A.S. | Calle 123 # 45-67 Bogotá D.C. | contactobasileias@gmail.com | www.basileias.com
                    </p>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                .font-script { font-family: 'Dancing Script', cursive; }
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print\\:text-black { color: black !important; }
                    .print\\:border-black { border-color: black !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
};

export default InformedConsent;
