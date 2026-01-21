import { useState, useContext } from 'react';
import HashLoader from 'react-spinners/HashLoader';
import { authContext } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import useWompi from '../../hooks/useWompi';
import { toast } from 'react-toastify';

const PaymentButton = ({ bookingId, amount, onPaymentSuccess }) => {
    const { token, user } = useContext(authContext);
    const { openCheckout } = useWompi();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Pedir firma de integridad al backend
            const res = await fetch(`${BASE_URL}/payment/signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount,
                    bookingId
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Error preparando pago');

            const { reference, integritySignature, amountInCents, publicKey, currency } = result.data;

            // 2. Abrir Widget Wompi
            openCheckout({
                currency,
                amountInCents,
                reference,
                publicKey,
                signature: integritySignature,
                customerEmail: user.email,
                redirectUrl: `${window.location.origin}/checkout/result?id=${reference}` // Página opcional de resultado
            });

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#1e40af] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#1e3a8a] transition shadow-md flex items-center justify-center gap-2"
        >
            {loading ? <HashLoader size={20} color="#fff" /> : 
            <>
                <span>Pagar con Wompi</span>
                <img src="https://wompi.com/assets/img/wompi-logo-white.svg" alt="Wompi" className="h-5" onError={(e) => {e.target.style.display='none'}}/>
            </>}
        </button>
    );
};

export default PaymentButton;
