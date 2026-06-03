import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Flight, SearchParams } from '../types';
import { buildFlightSchedule } from './flightScheduleService';

export const FlightService = {
  async fetchFlights(params: Partial<SearchParams> = {}): Promise<Flight[]> {
    if (!isSupabaseConfigured()) return [];

    let query = supabase
      .from('flights')
      .select('*, flight_schedules(*)')
      .order('depart_date', { ascending: true })
      .limit(200);

    if (params.from) {
      query = query.ilike('from_name', `%${params.from.split('(')[0].trim()}%`);
    }
    if (params.to) {
      query = query.ilike('to_name', `%${params.to.split('(')[0].trim()}%`);
    }
    if (params.departDate) {
      query = query.eq('depart_date', params.departDate);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('FlightService.fetchFlights error:', error?.message);
      return [];
    }

    return data.map((row: any) => buildFlightSchedule(row, params));
  }
};

export default FlightService;
