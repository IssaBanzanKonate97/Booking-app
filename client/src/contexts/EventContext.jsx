import { createContext, useState, useEffect } from 'react';
const EventContext = createContext(null);

const EventContextProvider = ({ children }) => {

    const [event, setEvent] = useState(null);
    
    const createEvent = (new_event) => {
        return setEvent(new_event);
    };

    const removeEvent = () => {
        return setEvent(null);
    };

    useEffect(() => {
        if (!event) return;

        if (event.timeOut) {
            setTimeout(() => {
                removeEvent();
            }, parseInt(event.timeOut));
        }

        return () => {
            clearTimeout();
        }
    }, [event]);

    return <EventContext.Provider value={{ event, createEvent, removeEvent }}>
        { children }
    </EventContext.Provider>
};

export { EventContext };
export default EventContextProvider;