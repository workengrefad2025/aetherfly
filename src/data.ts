import { Flight } from './types';

export const CITIES = [
  { name: "Kuala Lumpur", code: "KUL", country: "Malaysia" },
  { name: "Dubai", code: "DXB", country: "United Arab Emirates" },
  { name: "London", code: "LHR", country: "United Kingdom" },
  { name: "New York", code: "JFK", country: "United States" },
  { name: "Tokyo", code: "HND", country: "Japan" },
  { name: "Istanbul", code: "IST", country: "Turkey" },
  { name: "Paris", code: "CDG", country: "France" },
  { name: "Singapore", code: "SIN", country: "Singapore" },
  { name: "Male (Maldives)", code: "MLE", country: "Maldives" }
];

export const POPULAR_ROUTES = [
  {
    from: "Kuala Lumpur (KUL)",
    to: "Dubai (DXB)",
    price: 680,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    desc: "Fly deluxe • Daily flights",
    fromCode: "KUL",
    toCode: "DXB"
  },
  {
    from: "Kuala Lumpur (KUL)",
    to: "London (LHR)",
    price: 1120,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
    desc: "From USD 1120 • One-stop",
    fromCode: "KUL",
    toCode: "LHR"
  },
  {
    from: "Dubai (DXB)",
    to: "New York (JFK)",
    price: 880,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80",
    desc: "Direct flight • Overnight",
    fromCode: "DXB",
    toCode: "JFK"
  }
];

export const DESTINATIONS = [
  {
    city: "Dubai",
    country: "UAE",
    price: 320,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
  },
  {
    city: "Istanbul",
    country: "Turkey",
    price: 280,
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80"
  },
  {
    city: "Paris",
    country: "France",
    price: 350,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
  },
  {
    city: "Maldives",
    country: "Maldives",
    price: 540,
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80"
  },
  {
    city: "New York",
    country: "USA",
    price: 410,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80"
  }
];

export const AIRLINES = [
  { name: "AetherFly", prefix: "AF", rating: "5.0 ★ Elite Class" },
  { name: "Singapore Airlines", prefix: "SQ", rating: "4.9 ★ 5-Star Service" },
  { name: "Qatar Airways", prefix: "QR", rating: "4.9 ★ World's Best Cabin" },
  { name: "Emirates", prefix: "EK", rating: "4.8 ★ Shower & Lounge" },
  { name: "Lufthansa", prefix: "LH", rating: "4.7 ★ German Precision" },
  { name: "British Airways", prefix: "BA", rating: "4.6 ★ Royal Comfort" },
  { name: "Air France", prefix: "AFR", rating: "4.7 ★ Parisian Elegance" }
];

export const FAQS = [
  {
    question: "How do I book a reward ticket on AetherFly?",
    answer: "AetherFly Elite Club members can book award seats directly by checking the 'Pay with Miles' option during payment. You can redeem miles for Economy, Business Suite, or First Class Cabin upgrades."
  },
  {
    question: "What is AetherFly's cancellation and refund policy?",
    answer: "Cancellations made 24 hours or more before deviation are fully eligible for refunds into travel credits or original payment methods. Cancellations made closer to departure are subject to standard elite tier fee waivers."
  },
  {
    question: "Can I pre-select a specific business suite in advance?",
    answer: "Yes, you can pre-book a specific seat or privacy pod in advance using our live interactive seating map on the Flight Details screen after picking your flight."
  },
  {
    question: "What are the baggage allowances on partner luxury airlines?",
    answer: "Checked bags of up to 32kg (70lbs) each are complimentary for Business Suite and First Class guests. First Class guests are allowed up to 3 checked bags plus additional carry-on cabin items."
  }
];

export function findCityByCode(code: string) {
  return CITIES.find(c => c.code === code) || { name: code, code, country: "" };
}

export function generateMockFlights(from: string, to: string, date: string): Flight[] {
  // Extract codes
  const fromCode = from.includes('(') ? from.split('(')[1].replace(')', '') : 'KUL';
  const toCode = to.includes('(') ? to.split('(')[1].replace(')', '') : 'DXB';
  const fromCity = findCityByCode(fromCode);
  const toCity = findCityByCode(toCode);

  const baseTimes = [
    { start: "08:15", duration: "6h 45m" },
    { start: "12:30", duration: "7h 00m" },
    { start: "17:45", duration: "6h 30m" },
    { start: "22:00", duration: "8h 15m" },
    { start: "01:20", duration: "7h 15m" }
  ];

  return AIRLINES.map((airline, idx) => {
    const timeMatch = baseTimes[idx % baseTimes.length];
    const flightNo = `${airline.prefix}${100 + idx * 13}`;
    const baseHour = parseInt(timeMatch.start.split(":")[0]);
    const durationHours = parseInt(timeMatch.duration.split("h")[0]);
    const arriveHour = (baseHour + durationHours) % 24;
    const arriveTime = `${arriveHour.toString().padStart(2, '0')}:${timeMatch.start.split(":")[1]}`;

    // Base fare depending on airline status and stops
    const stopCount = idx % 3 === 0 ? 0 : 1;
    let price = 280 + (idx * 55) - (stopCount * 65);
    if (airline.name === "AetherFly") price += 150; // Premium brand

    return {
      id: `${flightNo}-${idx}`,
      airline: airline.name,
      flightNo,
      fromCode,
      fromName: fromCity.name,
      toCode,
      toName: toCity.name,
      departTime: timeMatch.start,
      arriveTime,
      duration: timeMatch.duration,
      price: Math.max(price, 120),
      stops: stopCount,
      planeType: idx % 2 === 0 ? "Boeing 777-300ER" : "Airbus A350-1000"
    };
  });
}
