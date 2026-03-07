import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';

// ─── Types ──────────────────────────────────────────────────
export interface Event {
    id: string;
    date_label: string;
    title: string;
    stage: string;
    bpm: string;
    image: string;
    status: string;
    is_past: boolean;
    description: string | null;
    lineup: string[];
    event_date: string | null;
    venue_room: string | null;
    genre: string | null;
    is_published: boolean;
}

export interface TicketType {
    id: string;
    event_id: string;
    name: string;
    price: number;
    quantity_total: number;
    quantity_sold: number;
    status: string;
    remaining: number;
}

export interface Ticket {
    id: string;
    ticket_type_id: string;
    user_id: string;
    event_id: string;
    qr_code_data: string;
    status: string;
    purchased_at: string;
    used_at: string | null;
    ticket_type?: TicketType;
    event?: Event;
}

// ─── Events ─────────────────────────────────────────────────
export async function fetchEvents(options?: { upcoming?: boolean; genre?: string; room?: string }) {
    let query = supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true });

    if (options?.upcoming) {
        query = query.eq('is_past', false);
    }
    if (options?.genre) {
        query = query.eq('genre', options.genre);
    }
    if (options?.room) {
        query = query.eq('venue_room', options.room);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Event[];
}

export async function fetchEventById(eventId: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
    if (error) throw error;
    return data as Event;
}

// ─── Ticket Types ───────────────────────────────────────────
export async function fetchTicketTypes(eventId: string) {
    const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true });

    if (error) throw error;
    return (data || []).map((tt: any) => ({
        ...tt,
        remaining: tt.quantity_total - tt.quantity_sold,
    })) as TicketType[];
}

// ─── Ticket Purchase ────────────────────────────────────────
export async function purchaseTickets(
    userId: string,
    eventId: string,
    ticketTypeId: string,
    quantity: number
): Promise<Ticket[]> {
    // 1. Verify availability
    const { data: tt, error: ttErr } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketTypeId)
        .single();

    if (ttErr) throw ttErr;
    const remaining = tt.quantity_total - tt.quantity_sold;
    if (remaining < quantity) {
        throw new Error(`Only ${remaining} tickets remaining`);
    }

    // 2. Generate tickets with unique QR codes
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
        const randomBytes = await Crypto.getRandomBytesAsync(16);
        const hex = Array.from(new Uint8Array(randomBytes))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        const qrData = `KYO-TKT-${eventId.slice(0, 8)}-${hex}`;

        tickets.push({
            ticket_type_id: ticketTypeId,
            user_id: userId,
            event_id: eventId,
            qr_code_data: qrData,
            status: 'VALID',
        });
    }

    // 3. Insert tickets
    const { data: insertedTickets, error: insertErr } = await supabase
        .from('tickets')
        .insert(tickets)
        .select();

    if (insertErr) throw insertErr;

    // 4. Update quantity_sold
    const { error: updateErr } = await supabase
        .from('ticket_types')
        .update({ quantity_sold: tt.quantity_sold + quantity })
        .eq('id', ticketTypeId);

    if (updateErr) {
        console.error('Failed to update quantity_sold:', updateErr);
    }

    // 5. Check if sold out
    if (tt.quantity_sold + quantity >= tt.quantity_total) {
        await supabase
            .from('ticket_types')
            .update({ status: 'SOLD_OUT' })
            .eq('id', ticketTypeId);
    }

    return insertedTickets as Ticket[];
}

// ─── My Tickets ─────────────────────────────────────────────
export async function fetchMyTickets(userId: string) {
    const { data, error } = await supabase
        .from('tickets')
        .select(`
      *,
      ticket_type:ticket_types(*),
      event:events(*)
    `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Ticket[];
}

// ─── Ticket Validation (Staff) ──────────────────────────────
export async function validateTicket(qrData: string) {
    // Find ticket by QR code
    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
      *,
      ticket_type:ticket_types(name, price),
      event:events(title, event_date)
    `)
        .eq('qr_code_data', qrData)
        .single();

    if (error || !ticket) {
        return { valid: false, reason: 'INVALID', ticket: null };
    }

    if (ticket.status === 'USED') {
        return { valid: false, reason: 'DUPLICATE', ticket };
    }

    if (ticket.status === 'CANCELLED') {
        return { valid: false, reason: 'CANCELLED', ticket };
    }

    return { valid: true, reason: 'VALID', ticket };
}

export async function markTicketUsed(ticketId: string, staffUserId: string, eventId: string) {
    // Update ticket status
    const { error: updateErr } = await supabase
        .from('tickets')
        .update({ status: 'USED', used_at: new Date().toISOString() })
        .eq('id', ticketId);

    if (updateErr) throw updateErr;

    // Log entry
    const { error: logErr } = await supabase
        .from('entry_logs')
        .insert({
            ticket_id: ticketId,
            event_id: eventId,
            staff_user_id: staffUserId,
            result: 'APPROVED',
        });

    if (logErr) console.error('Failed to log entry:', logErr);
}

export async function logDeniedEntry(
    staffUserId: string,
    eventId: string,
    result: 'DENIED' | 'DUPLICATE',
    ticketId?: string,
    reservationId?: string
) {
    await supabase.from('entry_logs').insert({
        ticket_id: ticketId || null,
        reservation_id: reservationId || null,
        event_id: eventId,
        staff_user_id: staffUserId,
        result,
    });
}

// ─── Reservations ───────────────────────────────────────────
export async function fetchMyReservations(userId: string) {
    const { data, error } = await supabase
        .from('reservations')
        .select(`
      *,
      event:events(title, event_date, date_label),
      table:venue_tables(table_number, capacity, category)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ─── Venue Tables ───────────────────────────────────────────
export async function fetchVenueTables() {
    const { data, error } = await supabase
        .from('venue_tables')
        .select('*')
        .order('table_number', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function checkTableAvailability(tableId: string, date: string) {
    const { data, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('table_id', tableId)
        .eq('status', 'CONFIRMED')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);

    if (error) throw error;
    return (data || []).length === 0; // true if available
}
