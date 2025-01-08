export interface University {
  id: string;
  name: string;
  type: 'state' | 'private';
  foundedYear: number;
  city: string;
}

export interface City {
  id: string;
  city: string;
  universities: University[];
  coordinates: {
    x: number;
    y: number;
  };
}
export interface University {

  name: string;


}

export interface FilterOptions {
  type?: 'state' | 'private' | 'all';
  yearRange?: {
    start?: number;
    end?: number;
  };
}
