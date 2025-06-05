import { useContext, useState } from 'react';
import { EventContext } from '../../contexts/EventContext';
import { AlertCircle } from 'react-feather';

function EventDisplayer() {
    const { event, removeEvent } = useContext(EventContext);

    const [code, setCode] = useState("");

    const handleSubmitCode = () => {
        event.code.setSecraitaireCode(code);
        removeEvent();
    };

    return event && <div className="fixed z-[9999] inset-0 overflow-y-auto roboto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 text-portal-600 flex items-center justify-center h-12 w-12 rounded-full bg-portal-100 sm:mx-0 sm:h-10 sm:w-10">
                                {
                                    event.icon ? event.icon : <AlertCircle className="h-6 w-6" aria-hidden="true" />
                                }
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                    { event.title ? event.title : "Message d'information" }
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm leading-5 text-gray-500">
                                        { event.content ? event.content : "Aucun message à afficher" }
                                    </p>
                                </div>
                                {
                                    event.link?.url && <div className="mt-2">
                                        <a
                                            href={ event.link.url } 
                                            className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-portal-100 text-base font-medium text-portal-800 hover:bg-portal-50 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                                            { event.link.text }
                                        </a>
                                    </div>
                                }
                                {
                                    event.code && <div className="mt-2">
                                        <input
                                            placeholder={event.code.text}
                                            type={event.code.type}
                                            id={event.code.id}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className={`w-full border border-slate-300 rounded-md shadow my-1 block py-2.5 px-4 text-slate-600 focus:outline-none focus:border-portal-400`}
                                        />
                                        <button onClick={ handleSubmitCode } type="button" className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-portal-100 text-base font-medium text-portal-800 hover:bg-portal-50 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                                            Valider
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="p-4 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-50">
                        <span className="flex w-full sm:ml-3 sm:w-auto">
                            <button onClick={ removeEvent } type="button" className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-portal-100 text-base font-medium text-portal-800 hover:bg-portal-50 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                                Fermer le message
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
};

export default EventDisplayer;