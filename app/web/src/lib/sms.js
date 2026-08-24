const formatPhoneToE164 = (value = '') => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length > 10 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
};

export async function sendBookingSms({
    toPhone,
    customerName,
    serviceName,
}) {
    const phone = formatPhoneToE164(toPhone);

    if (!phone) {
        return { ok: false, reason: 'Missing phone number' };
    }

    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.info('[SMS mock]', {
            to: phone,
            body: `Hi ${customerName || 'there'}, thanks for booking ${serviceName || 'a service'} with Akaal Detailerz Co. We will be in touch shortly.`,
        });

        return {
            ok: true,
            mode: 'mock',
            to: phone,
        };
    }

    try {
        const twilio = (await import(/* @vite-ignore */ 'twilio')).default;
        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: `Hi ${customerName || 'there'}, thanks for booking ${serviceName || 'a service'} with Akaal Detailerz Co. We will contact you soon.`,
            from: fromNumber,
            to: phone,
        });

        return {
            ok: true,
            mode: 'twilio',
            sid: message.sid,
            to: phone,
        };
    } catch (error) {
        console.error('SMS send failed:', error);
        return {
            ok: false,
            reason: error?.message || 'Unable to send SMS right now.',
        };
    }
}
