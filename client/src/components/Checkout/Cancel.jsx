import { Container } from "./index";
import { X } from "react-feather";
import { useEffect } from "react";

const CheckoutCancel = () => {

    useEffect(() => {
        document.title = "Paiement annulé - Sarah Nacass";
    }, []);

    return <Container>
        <div>
            <div className="isError text-center roboto">
                <X className="text-portal-600 mx-auto mb-4" size={35} />
                <p className="my-2 text-center text-xl font-bold text-portal-700">Paiement annulé</p>
                <p className=" text-portal-700 text-base text-center">
                    Le paiement a été annulé et le rendez-vous n'a pas été confirmé. Si vous rencontrez des difficultés pour finaliser votre paiement, n'hésitez pas à contacter le secrétariat des cabinets Sarah Nacass par mail ou par téléphone ou directement
                    <span> <a href="https://sarahnacass.com/contact-2/" className="text-portal-500 hover:text-portal-800 underline">sur notre site</a></span>.
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

export default CheckoutCancel;