import { Container } from "./index";
import { CheckCircle } from "react-feather";
import { useEffect } from "react";

const CheckoutSuccess = () => {
    
    useEffect(() => {
        document.title = "Paiement terminé - Sarah Nacass ";
    }, []);

    try {
        // GTM paiement accepté
        const tarif = JSON.parse(localStorage.getItem("last_booking_operation")).informations.tarif;
        const source = JSON.parse(localStorage.getItem("last_booking_operation")).source ?? null;
        const idConversion = JSON.parse(localStorage.getItem("last_booking_operation")).informations.clientSavedAtTime ?? null;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'paiement',
            'montant': tarif.value / 100,
            'devise': tarif.currency,
            'statut_paiement': 'Accepté',
            'source': source,
            'id_conversion': idConversion,
        });

        localStorage.removeItem("last_booking_operation");
    } catch {}
    
    return <Container>
        <div>
            <div className="isDone text-portal-600 roboto" id="success-message">
                <CheckCircle size={35} className="mx-auto mb-4" />
                <p className="text-portal-700 font-bold my-2 text-xl text-center">Paiement terminé</p>
                <p className="text-portal-700 text-base text-center">
                    Votre paiement a été validé et le rendez-vous a été confirmé auprès de nos services. Vous recevrez d'ici quelques minutes un email de confirmation avec les détails de votre rendez-vous. Merci de votre confiance et à bientôt !
                </p>
            </div>
        </div>
        <a href="/"
            className="block mt-5 text-lg roboto font-medium w-full text-center
            text-portal-500 hover:text-portal-800 hover:underline">
            Retour à l'accueil
        </a>
    </Container>
};

export default CheckoutSuccess;