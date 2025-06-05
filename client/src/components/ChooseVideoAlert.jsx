import React, {useState} from "react";
import { Clock, MapPin, FileText, X } from "react-feather";
import pandemic from "../img/pandemic.svg"
import "./choose_video.scss";

export default function ChooseVideoAlert(props){
    const [show, setShow] = useState(true);
    const options = [
        {icon: <Clock size={17} />, title: "Obtenez un rendez-vous plus rapidement."},
        {icon: <MapPin size={17} />, title: "Consultez un praticien depuis chez vous."},
        {icon: <FileText size={17} />, title: "Échangez vos documents en toute sécurité."},
    ]
    return (
        show && <div className="w-full relative chooseVideoContainer bg-white mb-4 px-5 py-2 flex flex-col roboto shadow shadow-gray-200 rounded-md">
            <img className="pandemic hidden sm:block" src={pandemic} alt="" />
            <div className="left-border"></div>
            <div className="closeInformativeButton h-8 w-8 bg-gray-200 hover:bg-gray-300 hover:cursor-pointer duration-150"
            title="Fermer" onClick={() => {setShow(false)}}> <X size={16}/> </div>
            <div className="right-para-shoot hidden sm:block"></div>
            <div className="z-20 flex-col text-left font-medium w-4/5 sm:w-auto text-sm md:text-base py-2 ml-1 text-gray-700 montserrat">
                {`${props.localEtabName}, vous propose un accompagnement vidéo`}
            </div>
            <p className="z-20 text-xs py-1 mx-1 mb-1 inter text-gray-700 font-medium">
                {
                    options.map((option, index) => {
                        return <div key={index} className="flex flex-row items-center mb-1">
                            {option.icon}<span className="inter ml-2 text-gray-700 text-sm font-medium">{option.title}</span>
                        </div>
                    })
                }
            </p>
        </div>
    );
};