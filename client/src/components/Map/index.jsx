import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

const LeafletMap = ({ latitude, longitude, name }) => {
    const position = [latitude, longitude];

    return <div key={`${ latitude }-${ longitude }`} className="h-full overflow-hidden relative z-10 bg-portal-400 w-full h-full">
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="absolute inset-0 h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    { name } 
                </Popup>
            </Marker>
        </MapContainer>
    </div>
};

export default LeafletMap;