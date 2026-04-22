export interface Coordinates {
  lat: number;
  lng: number;
}

export const getUserLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      (err) => reject(err),
      { timeout: 10000 }
    );
  });
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const area =
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.town ||
      data.address?.village ||
      '';
    const city =
      data.address?.city ||
      data.address?.state_district ||
      data.address?.state ||
      'Your Area';
    return area ? `${area}, ${city}` : city;
  } catch {
    return 'Your Area';
  }
};