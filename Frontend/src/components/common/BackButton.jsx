import { useLocation, useNavigate } from 'react-router-dom';

const BackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/' || location.pathname === '/home';
  if (isHome) return null;

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="w-full flex justify-center mt-10 mb-6">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 rounded-full bg-primaryColor text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-blue-600 transition-all"
      >
        <span aria-hidden>←</span>
        Volver
      </button>
    </div>
  );
};

export default BackButton;
