import './index.css';
import App from './App';
import { createRoot } from 'react-dom/client';
import EventContextProvider from './contexts/EventContext';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <EventContextProvider>
        <App />
    </EventContextProvider>
);