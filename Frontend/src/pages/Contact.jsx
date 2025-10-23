import React, { useState } from 'react';

const Contact = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        reason: 'info',
        availability: '',
        message: '',
        consent: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now just log the form; backend integration can be added later.
        console.log('Contact form submitted', form);
        alert('Gracias — recibimos tu mensaje. Te responderemos a la brevedad.');
        setForm({ name: '', email: '', phone: '', reason: 'info', availability: '', message: '', consent: false });
    };

    return (
        <section>
            <div className='px-4 mx-auto max-w-screen-md'>
                <h2 className='heading text-center'>Contacto</h2>

                <p className='mb-6 text_para text-center'>
                    ¿Necesitas información, agendar una consulta o consultar sobre nuestro enfoque terapéutico?
                    Completa el formulario y nuestro equipo te contactará dentro de 48 horas hábiles.
                </p>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Formulario */}
                    <div>
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div>
                                <label htmlFor='name' className='form_label'>Nombre completo</label>
                                <input
                                    id='name'
                                    name='name'
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder='Tu nombre completo'
                                    className='form_input mt-1'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='email' className='form_label'>Correo electrónico</label>
                                <input
                                    id='email'
                                    name='email'
                                    type='email'
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder='tucorreo@ejemplo.com'
                                    className='form_input mt-1'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='phone' className='form_label'>Teléfono (opcional)</label>
                                <input
                                    id='phone'
                                    name='phone'
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder='+57 300 000 0000'
                                    className='form_input mt-1'
                                />
                            </div>

                            <div>
                                <label htmlFor='reason' className='form_label'>Motivo de contacto</label>
                                <select
                                    id='reason'
                                    name='reason'
                                    value={form.reason}
                                    onChange={handleChange}
                                    className='form_input mt-1'
                                >
                                    <option value='info'>Información sobre servicios</option>
                                    <option value='book'>Agendar una cita</option>
                                    <option value='therapy'>Consulta clínica</option>
                                    <option value='other'>Otro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor='availability' className='form_label'>Disponibilidad preferida</label>
                                <input
                                    id='availability'
                                    name='availability'
                                    value={form.availability}
                                    onChange={handleChange}
                                    placeholder='Ej. Lun/Miér 18:00-20:00'
                                    className='form_input mt-1'
                                />
                            </div>

                            <div>
                                <label htmlFor='message' className='form_label'>Mensaje</label>
                                <textarea
                                    id='message'
                                    name='message'
                                    rows='5'
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder='Cuéntanos brevemente en qué podemos ayudarte'
                                    className='form_input mt-1'
                                />
                            </div>

                            <div className='flex items-start gap-3'>
                                <input type='checkbox' id='consent' name='consent' checked={form.consent} onChange={handleChange} />
                                <label htmlFor='consent' className='text-sm'>
                                    Autorizo el tratamiento de mis datos para fines de respuesta y gestión de la consulta (ver política de privacidad).
                                </label>
                            </div>

                            <div className='flex justify-center'>
                                <button type='submit' className='btn'>Enviar mensaje</button>
                            </div>
                        </form>
                    </div>

                    {/* Contact info */}
                    <div>
                        <div className='bg-white rounded-lg shadow-md p-6'>
                            <h3 className='text-xl font-semibold mb-2'>Contacto directo</h3>
                            <p className='text_para mb-4'>
                                Email: <a href='mailto:contacto@medicare.example' className='text-primaryColor'>contacto@medicare.example</a>
                                <br />
                                Teléfono: <a href='tel:+573000000000' className='text-primaryColor'>+57 300 000 0000</a>
                            </p>

                            <h4 className='font-semibold mb-1'>Horario de atención</h4>
                            <p className='text_para mb-4'>Lun - Vie: 09:00 - 18:00 (GMT-5)</p>

                            <h4 className='font-semibold mb-1'>Atención en casos de urgencia</h4>
                            <p className='text_para mb-4'>
                                Si atraviesas una emergencia psicológica o riesgo vital, por favor contacta inmediatamente los servicios de emergencia locales o dirígete a un servicio de urgencias. Nuestro equipo no reemplaza atención de emergencia.
                            </p>

                            <h4 className='font-semibold mb-1'>Privacidad</h4>
                            <p className='text_para'>Tu información se mantendrá confidencial y solo será utilizada para gestionar tu consulta y comunicaciones relacionadas con la atención.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;