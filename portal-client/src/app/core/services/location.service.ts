import { Injectable } from '@angular/core';

export interface State {
  name: string;
  cities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly pakistanStates: State[] = [
    {
      name: 'Punjab',
      cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sargodha', 'Bahawalpur', 'Sialkot', 'Sheikhupura', 'Jhang', 'Kasur', 'Sahiwal', 'Okara', 'Chiniot', 'Kamoke', 'Hafizabad', 'Sadiqabad', 'Burewala', 'Khanewal', 'Muzaffargarh', 'Kot Addu', 'Vehari', 'Narowal', 'Pakpattan', 'Mianwali', 'Attock', 'Chakwal', 'Jhelum', 'Gujrat', 'Mandi Bahauddin', 'Bahawalnagar']
    },
    {
      name: 'Sindh',
      cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Tando Allahyar', 'Tando Adam', 'Umerkot', 'Sanghar', 'Badin', 'Thatta', 'Jamshoro', 'Kotri', 'Sehwan', 'Matiari', 'Hala', 'Tando Muhammad Khan', 'Ghotki', 'Naushahro Feroze', 'Kashmore']
    },
    {
      name: 'Khyber Pakhtunkhwa',
      cities: ['Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Abbottabad', 'Dera Ismail Khan', 'Swabi', 'Charsadda', 'Nowshera', 'Bannu', 'Mianwali', 'Kohistan', 'Haripur', 'Mansehra', 'Battagram', 'Torghar', 'Buner', 'Shangla', 'Dir', 'Malakand', 'Chitral', 'Upper Dir', 'Lower Dir', 'Hangu', 'Karak', 'Lakki Marwat', 'Tank']
    },
    {
      name: 'Balochistan',
      cities: ['Quetta', 'Turbat', 'Khuzdar', 'Chaman', 'Hub', 'Sibi', 'Zhob', 'Gwadar', 'Dera Murad Jamali', 'Dera Allah Yar', 'Usta Muhammad', 'Loralai', 'Lasbela', 'Kohlu', 'Mastung', 'Qila Saifullah', 'Kech', 'Panjgur', 'Barkhan', 'Killa Abdullah', 'Pishin', 'Ziarat', 'Mekran', 'Awaran', 'Dera Bugti']
    },
    {
      name: 'Islamabad Capital Territory',
      cities: ['Islamabad', 'Sihala', 'Nilore', 'Tarnol', 'Golra', 'Bhara Kahu']
    },
    {
      name: 'Gilgit-Baltistan',
      cities: ['Gilgit', 'Skardu', 'Chilas', 'Astore', 'Hunza', 'Nagar', 'Ghizer', 'Ghanche', 'Shigar', 'Kharmang', 'Diamer']
    },
    {
      name: 'Azad Jammu and Kashmir',
      cities: ['Muzaffarabad', 'Mirpur', 'Bhimber', 'Kotli', 'Rawalakot', 'Bagh', 'Haveli', 'Poonch', 'Sudhnati', 'Neelum']
    }
  ];

  getStates(): string[] {
    return this.pakistanStates.map(state => state.name);
  }

  getCitiesByState(stateName: string): string[] {
    const state = this.pakistanStates.find(s => s.name === stateName);
    return state ? state.cities : [];
  }

  getAllStatesWithCities(): State[] {
    return this.pakistanStates;
  }

  isValidState(stateName: string): boolean {
    return this.pakistanStates.some(s => s.name === stateName);
  }

  isValidCity(stateName: string, cityName: string): boolean {
    const cities = this.getCitiesByState(stateName);
    return cities.includes(cityName);
  }
}

