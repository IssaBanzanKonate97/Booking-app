import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loading from "./components/Loading";

const Builder = lazy(() => import("./pages/commons/BUILDER"));
const Builder_Visio = lazy(() => import("./pages/commons/BUILDER_VISIO"));
const Builder_Visio_Expert = lazy(() => import("./pages/commons/BUILDER_VISIO_EXPERIMENTE"));
const Builder_Residentiel = lazy(() => import("./pages/commons/BUILDER_RESIDENTIEL"));
const WhoAreYou = lazy(() => import("./pages/commons/WHOAREYOU"));
const AUTO_GEO_REDIRECT = lazy(() => import("./components/AutoGeoLocation"));

const Checkout = lazy(() => import("./components/Checkout"));
const CheckoutCancel = lazy(() => import("./components/Checkout/Cancel"));
const CheckoutSuccess = lazy(() => import("./components/Checkout/Success"));
const CheckoutSuccessResidentiel = lazy(() => import("./components/Checkout/SuccessResidentiel"));

export default function App() {
  return <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<WhoAreYou />} />
          <Route path="*" element={<WhoAreYou />} />

          {/* Visio */}
          <Route path="/visio" element={<Builder_Visio />} />
          <Route path="/fr/visio" element={<Builder_Visio />} />
          <Route path="/be/visio" element={<Builder_Visio />} />
          <Route path="/ma/visio" element={<Builder_Visio />} />
          <Route path="/ca/visio" element={<Builder_Visio />} />
          <Route path="/ch/visio" element={<Builder_Visio />} />
          <Route path="/lu/visio" element={<Builder_Visio />} />
          <Route path="/mc/visio" element={<Builder_Visio />} />

          {/* Visio Experimente */}
          <Route path="/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/fr/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/be/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/ma/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/ca/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/ch/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/lu/visio-expert" element={<Builder_Visio_Expert />} />
          <Route path="/mc/visio-expert" element={<Builder_Visio_Expert />} />

          {/* Geolocalisation */}
          <Route path="/use-auto-locate" element={<AUTO_GEO_REDIRECT />} />

          {/* Paiement */}
          <Route path="/checkout">
            <Route index element={<Checkout />} />
            <Route path="success" element={<CheckoutSuccess />} />
            <Route path="residentiel/success" element={<CheckoutSuccessResidentiel />} />
            <Route path="cancel" element={<CheckoutCancel />} />
          </Route>

          {/* Sur place */}
          <Route path="/fr/sarahnacass">
              <Route path="/fr/sarahnacass/auvergne-rhone-alpes" element={<Builder resolve="/fr/sarahnacass/auvergne-rhone-alpes" />} />
              <Route path="/fr/sarahnacass/bourgogne-franche-comte" element={<Builder resolve="/fr/sarahnacass/bourgogne-franche-comte" />} />
              <Route path="/fr/sarahnacass/bretagne" element={<Builder resolve="/fr/sarahnacass/bretagne" />} />
              <Route path="/fr/sarahnacass/centre-val-de-loire" element={<Builder resolve="/fr/sarahnacass/centre-val-de-loire" />} />
              <Route path="/fr/sarahnacass/corse" element={<Builder resolve="/fr/sarahnacass/corse" />} />
              <Route path="/fr/sarahnacass/grand-est" element={<Builder resolve="/fr/sarahnacass/grand-est" />} />
              <Route path="/fr/sarahnacass/hauts-de-france" element={<Builder resolve="/fr/sarahnacass/hauts-de-france" />} />
              <Route path="/fr/sarahnacass/ile-de-france" element={<Builder resolve="/fr/sarahnacass/ile-de-france" />} />
              <Route path="/fr/sarahnacass/normandie" element={<Builder resolve="/fr/sarahnacass/normandie" />} />
              <Route path="/fr/sarahnacass/nouvelle-aquitaine" element={<Builder resolve="/fr/sarahnacass/nouvelle-aquitaine" />} />
              <Route path="/fr/sarahnacass/occitanie" element={<Builder resolve="/fr/sarahnacass/occitanie" />} />
              <Route path="/fr/sarahnacass/pays-de-la-loire" element={<Builder resolve="/fr/sarahnacass/pays-de-la-loire" />} />
              <Route path="/fr/sarahnacass/provence-alpes-cote-d-azur" element={<Builder resolve="/fr/sarahnacass/provence-alpes-cote-d-azur" />} />
              <Route path="/fr/sarahnacass/dom-tom" element={<Builder resolve="/fr/sarahnacass/dom-tom" />} />
          </Route>
          <Route path="/be/sarahnacass/belgique" element={<Builder resolve="/be/sarahnacass/belgique" />} />
          <Route path="/ma/sarahnacass/maroc" element={<Builder resolve="/ma/sarahnacass/maroc" />} />
          <Route path="/ca/sarahnacass/canada" element={<Builder resolve="/ca/sarahnacass/canada" />} />
          <Route path="/ch/sarahnacass/suisse" element={<Builder resolve="/ch/sarahnacass/suisse" />} />
          <Route path="/lu/sarahnacass/luxembourg" element={<Builder resolve="/lu/sarahnacass/luxembourg" />} />
          <Route path="/mc/sarahnacass/monaco" element={<Builder resolve="/mc/sarahnacass/monaco" />} />
          
          {/* Residentiel */}
          <Route path="/fr/residentiel" element={<Builder_Residentiel resolve="/fr/residentiel" />} />
          <Route path="/be/residentiel" element={<Builder_Residentiel resolve="/be/residentiel" />} />
          <Route path="/ma/residentiel" element={<Builder_Residentiel resolve="/ma/residentiel" />} />
          <Route path="/ca/residentiel" element={<Builder_Residentiel resolve="/ca/residentiel" />} />
          <Route path="/ch/residentiel" element={<Builder_Residentiel resolve="/ch/residentiel" />} />
          <Route path="/lu/residentiel" element={<Builder_Residentiel resolve="/lu/residentiel" />} />
          <Route path="/mc/residentiel" element={<Builder_Residentiel resolve="/mc/residentiel" />} />

        </Routes>
      </BrowserRouter>
  </Suspense>
}