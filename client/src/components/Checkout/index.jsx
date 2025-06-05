import "./styles.css";
import { useState, useEffect, Fragment } from "react";
import { loadStripe } from "@stripe/stripe-js";
import adiosLogo from "../../img/logo-Sarah-Nacass-Jaune_Blanc-sans-fond.webp";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { Lock } from "react-feather";
import { visio_tarifs } from "../../pages/shared_locations_datas/VISIO_DATAS";
import { locations } from "../../pages/shared_locations_datas/LOCATIONS_DATAS";
import Cookies from 'js-cookie';


const isProductionEnv = process.env.NODE_ENV === "production" ? true : false;

const Container = ({ children }) => {
    return <div className="max-w-lg mx-auto px-2.5 py-6 roboto overflow-hidden">
        <div className="h-10 mx-auto flex flex-col items-center justify-center">
            <img src={adiosLogo} alt="Bienvenue chez Sarah Nacass" className="h-full" />
        </div>
        <div className="py-6 px-4 mt-6 border border-solid border-gray-200 shadow-lg shadow-gray-300/50 rounded-md relative overflow-hidden">
            {children}
        </div>

        <div className="text-xs text-gray-400 text-center my-5 max-w-md mx-auto">
            Nous sécurisons toutes vos données personnelles et coordonnées bancaires avec la technologie SSL et le protocole sécurisé Stripe.
            Aussi vos informations personnelles ne seront jamais partagées à des services tiers ou à des fins commerciales, car nous respectons votre vie privée.
        </div>

    </div>
};

const Checkout = () => {
    // Get from url parameters the selected type of appointment (at clinic or in video)
    // with the "appointmentTypeSelected" key "video" or "clinic"

    const appearance = {
        theme: 'stripe',

        variables: {
            colorPrimary: '#2f7dc0',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            fontFamily: 'Roboto, sans-serif',
        },
    };
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [price, setPrice] = useState(null);
    
    useEffect(() => {
        const get = async () => {
            // Get the client secret from the url parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("intent")) {
                const clientSecret = urlParams.get("intent");
                setClientSecret(clientSecret);

                return;
            } else {
                setError("Une erreur s'est produite lors d'une vérification avec notre service de paiement. Vérifiez que le lien de paiement est valide et réessayez.");
                return;
            }
        };

        get();
    }, []);
    
    useEffect(() => {        
        const get = async () => {

            const urlParams = new URLSearchParams(window.location.search);
            try {
                if (urlParams.has("appointmentTypeSelected")) {

                    const idLocation = urlParams.get("id");
                    const appointmentTypeSelected = urlParams.get("appointmentTypeSelected");
                    if (appointmentTypeSelected == "video") {
                        visio_tarifs.forEach(async objet => {
                            if (idLocation.includes(objet.idLocation)) {

                                let tarifsVisioCabinet = {
                                    tarif_visio: objet.tarif,
                                    tarif_cabinet: objet.tarif,
                                };

                                if (Cookies.get('promotion')) {
                                    try {
                                        // Récupérer l'url API
                                        const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_PROMO_CODE : process.env.REACT_APP_DEV_POST_PROMO_CODE;
                                        // Variables envoyées

                                        const promoResult = await axios.post(endpoint, {
                                          promocode: Cookies.get('promotion'),
                                          formation: objet.formation,
                                          tarif_visio: tarifsVisioCabinet.tarif_visio,
                                          tarif_cabinet: tarifsVisioCabinet.tarif_cabinet,
                                        });

                                        tarifsVisioCabinet = promoResult.data.data
                                      } catch {}

                                }
                                
                                return setPrice((tarifsVisioCabinet.tarif_visio.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_visio.symbol || "0,00 € (prix indéfini dans le fichier .env)")
                            }
                        })
                    } else {
                        locations.forEach(async objet => {
                            if (idLocation.includes(objet.idLocation)) {
                                
                                let tarifsVisioCabinet ={
                                    tarif_visio: objet.tarif,
                                    tarif_cabinet: objet.tarif,
                                };

                                if (Cookies.get('promotion')) {
                                    try {
                                        // Récupérer l'url API
                                        const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_POST_PROMO_CODE : process.env.REACT_APP_DEV_POST_PROMO_CODE;
                                        // Variables envoyées

                                        const promoResult = await axios.post(endpoint, {
                                          promocode: Cookies.get('promotion'),
                                          tarif_visio: tarifsVisioCabinet.tarif_visio,
                                          tarif_cabinet: tarifsVisioCabinet.tarif_cabinet,
                                        });

                                        tarifsVisioCabinet = promoResult.data.data
                                    } catch {}

                                }

                                return setPrice((tarifsVisioCabinet.tarif_cabinet.value / 100).toFixed(2).replace('.', ',') + " " + tarifsVisioCabinet.tarif_cabinet.symbol || "0,00 € (prix indéfini dans le fichier .env)")
                            }
                        })
                    }
                    
                    throw 'err';

                } else {
                    throw 'err';
                }
            } catch (error) {
                setError("Il semble que vous n'avez pas réservé de rendez-vous avant de procéder au paiement. Veuillez réserver un rendez-vous pour ensuite procéder au règlement de celui-ci.");
                return;
            }
        };

        get();
    }, []);







    useEffect(() => {
        if (!price) return;

        const get = async () => {
            try {
                const endpoint = isProductionEnv ? process.env.REACT_APP_PROD_GET_PUBLIC_KEY : process.env.REACT_APP_DEV_GET_PUBLIC_KEY;

                const { data } = await axios.get(endpoint);
                const { publicKey } = data;
                setStripePromise(loadStripe(publicKey));
            } catch (error) {
                setError("Une erreur s'est produite lors de la connexion notre service de paiement. Vérifiez votre connexion internet et réessayez, ou contactez-nous si le problème persiste.");
            }
        };

        get();
    }, [price]);
    
    useEffect(() => {
        if (stripePromise && clientSecret && price) return setIsLoading(false);
    }, [stripePromise, clientSecret, price]);

    if (clientSecret != null) {
        return <Container>
            { isLoading ? error ?
                    <div className="text-red-600 bg-red-50 text-center px-2 py-2.5 top-0 border border-red-400 rounded font-medium z-30">
                        Attention : {error}
                    </div>
                        :
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="border-t-2 border-portal-500 rounded-full animate-spin w-8 h-8"></div>
                        <div className="text-portal-700">Chargement...</div>
                    </div>
                :
                <div className="">
                    { /* Erreur ici */ }
                    <Elements stripe={stripePromise} options={{ 
                        clientSecret, appearance
                    }}>
                        <CheckoutForm price={price} />
                    </Elements>
                </div>
            }
        </Container>
    }
};

const CheckoutForm = ({ price }) => {
    const stripe = useStripe();
    const elements = useElements(); 

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${ window.location.origin }/checkout/success`
            }
        });

        if(error) {
            setMessage(error.message);

            // GTM paiement refusé
            const tarif = JSON.parse(localStorage.getItem("last_booking_operation")).informations.tarif;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'paiement',
                'montant': tarif.value / 100,
                'devise': tarif.currency,
                'statut_paiement': error.message,
            });

        }

        setIsLoading(false);
    };

    return <form onSubmit={handleSubmit} className="sm:px-1">
        {
            message && <div className="text-red-600 bg-red-50 text-center px-2 py-2.5 mb-3 top-0 border border-red-400 rounded font-medium z-30">Attention : {message}</div>
        }
        <div className="text-center text-portal-700 font-medium text-lg">Règlement de l'accompagnement ({ price })</div>
        <div className="mx-auto max-w-min mt-1">
            <div className="text-center text-gray-400 text-sm mb-5 flex min-w-max items-start flex-row gap-2 mx-auto">
                <Lock size={16} /> Votre paiement est entièrement sécurisé
            </div>
        </div>

        <PaymentElement />
        <button type="submit" disabled={isLoading} className="w-full disabled:opacity-60 font-medium
            disabled:cursor-progress py-3 mt-5 bg-gradient-to-r from-fusion-500 hover:shadow-xl duration-150 to-portal-500 text-white rounded-md shadow-md hover:bg-portal-600 focus:outline-none focus:ring-2 focus:ring-portal-500 focus:ring-opacity-50">
            {isLoading ? <Fragment>
                <div className="border-t-2 border-white rounded-full mx-auto animate-spin w-4 h-4"></div>
            </Fragment>
            : "Payer"}
        </button>
    </form>
};

export { Container };
export default Checkout;