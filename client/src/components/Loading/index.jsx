import adios_logo from '../../img/logo-Sarah-Nacass-Jaune_Blanc-sans-fond.webp';

const Loading = () => {
    return <div className="loader fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="h-12 mx-auto flex flex-col items-center justify-center">
            <img src={adios_logo} alt="Bienvenue dans nos cabinets Sarah Nacass" className="h-full" />
        </div>
    </div>
};

export default Loading;