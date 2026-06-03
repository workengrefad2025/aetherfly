import { Booking, BoardingPass } from '../types';

const gateLetters = ['A', 'B', 'C', 'D', 'E'];
const boardingGroups = ['1', '2', '3', '4'];
const boardingZones = ['A', 'B', 'C', 'D'];
const terminals = ['T1', 'T2', 'T3', 'T4'];

const buildGateCode = (): string => {
  const terminal = gateLetters[Math.floor(Math.random() * gateLetters.length)];
  const gate = 1 + Math.floor(Math.random() * 18);
  return `${terminal}${gate}`;
};

const buildBoardingGroup = (): string => boardingGroups[Math.floor(Math.random() * boardingGroups.length)];
const buildBoardingZone = (): string => boardingZones[Math.floor(Math.random() * boardingZones.length)];
const buildTerminal = (): string => terminals[Math.floor(Math.random() * terminals.length)];

const buildQrCodeUrl = (bookingRef: string, ticketNumber: string): string =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${bookingRef}|${ticketNumber}`)}`;

export function createBoardingPass(booking: Booking): BoardingPass {
  const boardingOffset = 45;
  const departDate = new Date(booking.flight.departureAt ?? `${booking.date}T${booking.flight.departTime || '09:00'}:00Z`);
  const boardingDate = new Date(departDate.getTime() - boardingOffset * 60 * 1000);
  const assignedGate = booking.flight.gate ?? buildGateCode();
  const assignedTerminal = booking.flight.terminal ?? buildTerminal();
  const assignedZone = buildBoardingZone();
  return {
    id: `bp-${booking.ref}-${Date.now()}`,
    bookingId: booking.id,
    gate: assignedGate,
    boardingGroup: booking.boardingGroup ?? buildBoardingGroup(),
    boardingZone: assignedZone,
    boardingTime: boardingDate.toISOString(),
    seatCode: booking.seatCode,
    terminal: assignedTerminal,
    departureAt: departDate.toISOString(),
    qrCodeUrl: buildQrCodeUrl(booking.ref, booking.seatCode),
    qrPayload: {
      bookingRef: booking.ref,
      seatCode: booking.seatCode,
      flightNo: booking.flight.flightNo,
      gate: assignedGate,
      terminal: assignedTerminal,
      boardingZone: assignedZone
    },
    status: 'issued'
  };
}
