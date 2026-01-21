import { useEffect } from 'react';

const useWompi = () => {
    useEffect(() => {
        const scriptId = 'wompi-widget-script';
        
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://checkout.wompi.co/widget.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const openCheckout = ({ currency = 'COP', amountInCents, reference, publicKey, signature, redirectUrl, customerEmail }) => {
        const checkout = new window.WidgetCheckout({
            currency,
            amountInCents,
            reference,
            publicKey,
            signature: signature, // Integridad SHA256
            redirectUrl, // Opcional, si quieres que al terminar te lleve a una pag de "Gracias"
            customerData: {
                email: customerEmail,
            }
        });

        checkout.open((result) => {
            const transaction = result.transaction;
            console.log('Transaction result:', transaction);
            // El webhook se encargará de confirmar el estado en backend
            // Aquí solo manejamos la UI inmediata
        });
    };

    return { openCheckout };
};

export default useWompi;
