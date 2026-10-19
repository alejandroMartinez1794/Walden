import PropTypes from 'prop-types';

const Error = ({ errMessage, message }) => {
    const content = errMessage || message || 'Ocurrió un error';
    return (
        <div className="flex items-center justify-center w-full h-full">
            <h3 className="text-headingColor text-[20px] leading-[30px] font-semibold">{content}</h3>
        </div>
    );
};

Error.propTypes = {
  errMessage: PropTypes.string,
  message: PropTypes.string,
};

export default Error;