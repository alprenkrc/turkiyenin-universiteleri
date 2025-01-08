import { City } from '../types';
import uniData from './uni.json';

export const citiesData: City[] = uniData.coordinates.map(city => ({
  id: city.id,
  city: city.city || '',
  coordinates: {
    x: city.cx,
    y: city.cy
  },
  universities: city.universities.map(uni => ({
    id: uni.id,
    name: uni.name,
    type: uni.type === "Devlet" ? "state" : "private",
    foundedYear: uni.established,
    city: city.city || ''
  }))
}));
