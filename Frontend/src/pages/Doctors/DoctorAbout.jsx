    
import { formateDate } from "../../utils/formateDate"

const DoctorAbout = ({name, about, qualifications = [], experiences = []}) => {
    const hasQualifications = qualifications?.length > 0
    const hasExperiences = experiences?.length > 0
    const aboutText = about?.trim() || "Este especialista aún no ha agregado una biografía."

    return (
        <section className='space-y-10'>
            <header className='rounded-2xl border border-solid border-[#f0f2f5] bg-white p-6 md:p-8 shadow-sm'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='space-y-3'>
                        <h3 className='text-[22px] leading-[32px] text-headingColor font-semibold flex flex-wrap items-center gap-2'>
                            Sobre
                            <span className='text-irisBlueColor font-bold text-[26px] leading-9'>
                                {name || "el especialista"}
                            </span>
                        </h3>
                        <p className='text_para max-w-2xl'>
                            {aboutText}
                        </p>
                    </div>

                    <div className='grid grid-cols-2 gap-3 w-full lg:w-auto'>
                        <div className='rounded-xl border border-solid border-[#e6e9ef] p-4 text-center'>
                            <p className='text-[22px] font-bold text-headingColor'>
                                {qualifications?.length || 0}
                            </p>
                            <p className='text-[13px] text-textColor'>Formaciones</p>
                        </div>
                        <div className='rounded-xl border border-solid border-[#e6e9ef] p-4 text-center'>
                            <p className='text-[22px] font-bold text-headingColor'>
                                {experiences?.length || 0}
                            </p>
                            <p className='text-[13px] text-textColor'>Experiencias</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className='grid gap-10 lg:grid-cols-2'>
                <div className='rounded-2xl border border-solid border-[#f0f2f5] bg-white p-6 md:p-8 shadow-sm'>
                    <h3 className='text-[20px] leading-[30px] text-headingColor font-semibold'>
                        Educación
                    </h3>

                    {hasQualifications ? (
                        <ul className='pt-6 space-y-6'>
                            {qualifications?.map((item, index) => (
                                <li key={index} className='relative pl-6'>
                                    <span className='absolute left-0 top-2 h-3 w-3 rounded-full bg-irisBlueColor'></span>
                                    <div className='border-l-2 border-dashed border-[#d9e2ec] pl-6'>
                                        <span className='text-irisBlueColor text-[14px] leading-6 font-semibold'>
                                            {formateDate(item.startingDate)} - {item.endingDate ? formateDate(item.endingDate) : "Actualidad"}
                                        </span>
                                        <p className='text-[16px] leading-6 font-medium text-textColor'>
                                            {item.degree || "Programa académico"}
                                        </p>
                                        <p className='text-[14px] leading-5 font-medium text-textColor'>
                                            {item.university || "Institución"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className='mt-6 rounded-xl border border-dashed border-[#d9e2ec] p-6 text-center text-textColor'>
                            Aún no se han agregado estudios académicos.
                        </div>
                    )}
                </div>

                <div className='rounded-2xl border border-solid border-[#f0f2f5] bg-white p-6 md:p-8 shadow-sm'>
                    <h3 className='text-[20px] leading-[30px] text-headingColor font-semibold'>
                        Experiencia
                    </h3>

                    {hasExperiences ? (
                        <ul className='grid gap-5 pt-6 sm:grid-cols-2'>
                            {experiences?.map((item, index) => (
                                <li key={index} className='rounded-xl border border-solid border-[#f8e6c1] bg-[#fff9ea] p-4'>
                                    <span className='text-yellowColor text-[14px] leading-6 font-semibold'>
                                        {formateDate(item.startingDate)} - {item.endingDate ? formateDate(item.endingDate) : "Actualidad"}
                                    </span>
                                    <p className='text-[16px] leading-6 font-medium text-textColor'>
                                        {item.position || "Especialista"}
                                    </p>
                                    <p className='text-[14px] leading-5 font-medium text-textColor'>
                                        {item.hospital || "Centro médico"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className='mt-6 rounded-xl border border-dashed border-[#d9e2ec] p-6 text-center text-textColor'>
                            Aún no se han agregado experiencias clínicas.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DoctorAbout;