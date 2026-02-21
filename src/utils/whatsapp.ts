export const generateWhatsAppLink = (
    name: string,
    phone: string,
    tableNumber: string,
    date: string,
    time: string,
    depositAmount: number
): string => {
    // Kyo Club Admin Number
    const clubNumber = '60123456789';

    const message = `*NEW BOOKING DEPOSIT PAID*
    
Name: ${name}
Phone: ${phone}
Table: ${tableNumber}
Date: ${date}
Time: ${time}
Deposit: RM ${depositAmount.toFixed(2)}

Please confirm this reservation.`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${clubNumber}?text=${encodedMessage}`;
};
