import { useState, useEffect, Fragment } from "react";
import EventDisplayer from "../../components/EventDisplayer";
import GeoZoneSelector from "./GEO_ZONE_POP";
import Cookies from 'js-cookie';

const WhoAreYou = () => {
    const [showModal, setShowModal] = useState([true, true]);
    const [isIframe, setIsIframe] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get("promotion")) {
            Cookies.set('promotion', urlParams.get("promotion"), { expires: 1 });
        }

        if (urlParams.get("use_iframe") === "true") {
            setIsIframe(true);
        } else {
            setIsIframe(false);
        }
    }, []);

    return <Fragment>
        <EventDisplayer />
        { isIframe ? <GeoZoneSelector showModal={showModal} setShowModal={setShowModal} imLost={true} inFrame={true} />
        : <div className="flex flex-col h-screen bg-gradient-to-r from-gray-500 to-slate-500">
            <GeoZoneSelector showModal={showModal} setShowModal={setShowModal} imLost={true} inFrame={false} />
        </div> }
    </Fragment>
};

export default WhoAreYou;