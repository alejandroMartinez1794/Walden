
const Error = ({ errMessage, message }) => {
    const content = errMessage || message || 'Ocurrió un error';
    return (
        <div className="flex items-center justify-center w-full h-full">
            <h3 className="text-headingColor text-[20px] leading-[30px] font-semibold">{content}</h3>
        </div>
    );
};

export default Error;