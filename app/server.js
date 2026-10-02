const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({
  path: [path.join(__dirname, '..', '.env'), path.join(__dirname, '.env')],
});

const PORT = Number(process.env.PORT) || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'shared-store.json');
const nodemailer = require('nodemailer');
const WEB_DIR = path.join(__dirname, 'web', 'dist');

const defaultState = {
  enquiries: [],
  bookings: [],
  settings: { smtp: {} },
  employees: [
    {
      id: 'emp-101',
      name: 'Alex Martinez',
      email: 'employee@akaaldetailerz.com',
      phone: '(602) 555-0101',
      role: 'employee',
      password: 'employee123',
    },
    {
      id: 'emp-102',
      name: 'Jordan Lee',
      email: 'jordan@akaaldetailerz.com',
      phone: '(602) 555-0102',
      role: 'employee',
      password: 'employee123',
    },
  ],
};

const DEMO_BOOKING_IDS = new Set([
  'booking-001',
  'booking-002',
  'booking-003',
  'booking-004',
  'booking-91dd579c-2c53-49ab-a8f1-5b2e66b16506',
]);
const ADMIN_SESSION_COOKIE = 'detailerz_admin_session';
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const adminSessions = new Map();
const failedAdminLogins = new Map();

const getAdminSession = (req) => {
  const cookie = String(req.headers.cookie || '').split(';').map((part) => part.trim());
  const token = cookie.find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))?.split('=')[1];
  const session = token ? adminSessions.get(token) : null;
  if (!session || session.expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    return null;
  }
  return session;
};

const isAdminAuthenticated = (req) => Boolean(getAdminSession(req));

const parseRequestBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 32_768) reject(new Error('Request body is too large.'));
  });
  req.on('end', () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch {
      reject(new Error('Invalid JSON payload'));
    }
  });
  req.on('error', reject);
});

const ensureDataFile = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
    return;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(parsed.bookings)) {
      const bookings = parsed.bookings.filter((booking) => !DEMO_BOOKING_IDS.has(booking.id));
      if (bookings.length !== parsed.bookings.length) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ ...parsed, bookings }, null, 2));
      }
    }
  } catch {
    // Leave malformed state untouched; readState uses the empty default.
  }
};

const readState = () => {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return {
      bookings: Array.isArray(parsed.bookings)
        ? parsed.bookings.filter((booking) => !DEMO_BOOKING_IDS.has(booking.id))
        : defaultState.bookings,
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : defaultState.enquiries,
      employees: Array.isArray(parsed.employees) ? parsed.employees : defaultState.employees,
      settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : defaultState.settings,
    };
  } catch {
    return { ...defaultState };
  }
};

const writeState = (nextState) => {
  ensureDataFile();
  const current = (() => {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      return {};
    }
  })();
  const safeState = {
    enquiries: Array.isArray(nextState?.enquiries) ? nextState.enquiries : defaultState.enquiries,
    bookings: Array.isArray(nextState?.bookings)
      ? nextState.bookings.filter((booking) => !DEMO_BOOKING_IDS.has(booking.id))
      : defaultState.bookings,
    employees: Array.isArray(nextState?.employees) ? nextState.employees : defaultState.employees,
    settings: nextState?.settings && typeof nextState.settings === 'object'
      ? nextState.settings
      : current.settings || defaultState.settings,
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(safeState, null, 2));
  return safeState;
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const getSmtpSettings = () => {
  const saved = readState().settings?.smtp || {};
  const env = process.env;
  const envSecure = env.SMTP_SECURE;
  const envRecipient = env.SMTP_TO || env.SMTP_ADMIN_EMAIL;
  return {
    host: env.SMTP_HOST || saved.host || '',
    port: Number(env.SMTP_PORT || saved.port) || 587,
    secure: envSecure !== undefined ? envSecure.toLowerCase() === 'true' : Boolean(saved.secure),
    user: env.SMTP_USER || saved.user || '',
    pass: env.SMTP_PASS || saved.pass || '',
    from: env.SMTP_FROM || saved.from || env.SMTP_USER || saved.user || '',
    to: envRecipient || saved.to || 'akaaldetailerz13@gmail.com',
  };
};

const getSmtpEnvironmentOverrides = () => {
  const env = process.env;
  return {
    host: Boolean(env.SMTP_HOST),
    port: Boolean(env.SMTP_PORT),
    secure: env.SMTP_SECURE !== undefined,
    user: Boolean(env.SMTP_USER),
    pass: Boolean(env.SMTP_PASS),
    from: Boolean(env.SMTP_FROM),
    to: Boolean(env.SMTP_TO || env.SMTP_ADMIN_EMAIL),
  };
};

const logBookingEmail = (event, bookingId, details = {}) => {
  console.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    scope: 'booking-email',
    event,
    bookingId,
    ...details,
  }));
};

const sendConfiguredEmail = async ({ to, replyTo, subject, text, bookingId }) => {
  const settings = getSmtpSettings();
  if (!settings.host || !settings.user || !settings.pass || !settings.from || !to) {
    logBookingEmail('smtp_configuration_missing', bookingId, {
      hostConfigured: Boolean(settings.host),
      userConfigured: Boolean(settings.user),
      passwordConfigured: Boolean(settings.pass),
      senderConfigured: Boolean(settings.from),
      recipientConfigured: Boolean(to),
    });
    throw new Error('SMTP host, username, password, sender, and recipient must be configured.');
  }
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.pass },
  });
  try {
    logBookingEmail('smtp_authentication_started', bookingId, {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
    });
    await transporter.verify();
    logBookingEmail('smtp_authentication_succeeded', bookingId);
    logBookingEmail('smtp_send_started', bookingId, { recipient: to });
    const result = await transporter.sendMail({
      from: settings.from,
      to,
      replyTo: replyTo || settings.from,
      subject,
      text,
    });
    logBookingEmail('smtp_message_accepted', bookingId, {
      messageId: result.messageId,
      acceptedCount: result.accepted.length,
      rejectedCount: result.rejected.length,
    });
    return result;
  } finally {
    transporter.close();
  }
};

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
};

const serveWebApp = (req, res, url) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(WEB_DIR, `.${requestedPath}`);
  const webRoot = path.resolve(WEB_DIR);
  const isInsideWebRoot = filePath === webRoot || filePath.startsWith(`${webRoot}${path.sep}`);
  const targetPath = isInsideWebRoot && fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(WEB_DIR, 'index.html');

  if (!fs.existsSync(targetPath)) {
    sendJson(res, 404, { error: 'Web build not found' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': contentTypes[path.extname(targetPath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': targetPath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(targetPath).pipe(res);
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (url.pathname === '/api/admin/session' && req.method === 'GET') {
    const session = getAdminSession(req);
    sendJson(res, session ? 200 : 401, session ? {
      user: { id: 'admin', email: session.email, name: 'Akaal Detailerz Admin', role: 'admin' },
    } : { error: 'Not signed in.' });
    return;
  }

  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      let credentials;
      try {
        credentials = raw ? JSON.parse(raw) : {};
      } catch {
        sendJson(res, 400, { error: 'Invalid request.' });
        return;
      }

      const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const configuredPassword = String(process.env.ADMIN_PASSWORD || '');
      if (!configuredEmail || configuredPassword.length < 20) {
        sendJson(res, 503, { error: 'Admin sign-in is not configured on the server.' });
        return;
      }

      const address = req.socket.remoteAddress || 'unknown';
      const failure = failedAdminLogins.get(address) || { attempts: 0, resetAt: Date.now() + 15 * 60 * 1000 };
      if (failure.resetAt <= Date.now()) {
        failure.attempts = 0;
        failure.resetAt = Date.now() + 15 * 60 * 1000;
      }
      if (failure.attempts >= 8) {
        sendJson(res, 429, { error: 'Too many sign-in attempts. Try again later.' });
        return;
      }

      const passwordMatches = crypto.timingSafeEqual(
        crypto.createHash('sha256').update(String(credentials.password || '')).digest(),
        crypto.createHash('sha256').update(configuredPassword).digest(),
      );
      const emailMatches = String(credentials.email || '').trim().toLowerCase() === configuredEmail;
      if (!emailMatches || !passwordMatches) {
        failure.attempts += 1;
        failedAdminLogins.set(address, failure);
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return;
      }

      failedAdminLogins.delete(address);
      const token = crypto.randomBytes(32).toString('base64url');
      adminSessions.set(token, { email: configuredEmail, expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });
      const secureCookie = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' ? '; Secure' : '';
      res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ADMIN_SESSION_TTL_MS / 1000}${secureCookie}`);
      sendJson(res, 200, {
        user: { id: 'admin', email: configuredEmail, name: 'Akaal Detailerz Admin', role: 'admin' },
      });
    });
    return;
  }

  if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
    const session = getAdminSession(req);
    if (session) {
      const token = String(req.headers.cookie || '').split(';').map((part) => part.trim())
        .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))?.split('=')[1];
      if (token) adminSessions.delete(token);
    }
    res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/state') {
    if (!isAdminAuthenticated(req)) {
      sendJson(res, 401, { error: 'Authentication required.' });
      return;
    }
    if (req.method === 'GET') {
      const { bookings, enquiries, employees } = readState();
      sendJson(res, 200, { bookings, enquiries, employees });
      return;
    }

    if (req.method === 'PUT') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          sendJson(res, 200, writeState(parsed));
        } catch {
          sendJson(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return;
    }
  }

  if (url.pathname === '/api/admin/email-settings') {
    if (!isAdminAuthenticated(req)) {
      sendJson(res, 401, { error: 'Authentication required.' });
      return;
    }
    if (req.method === 'GET') {
      const settings = getSmtpSettings();
      sendJson(res, 200, {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        user: settings.user,
        from: settings.from,
        to: settings.to,
        passwordConfigured: Boolean(settings.pass),
        environmentOverrides: getSmtpEnvironmentOverrides(),
      });
      return;
    }
    if (req.method === 'PUT') {
      parseRequestBody(req).then((input) => {
        const current = readState();
        const saved = { ...(current.settings?.smtp || {}) };
        const allowedFields = ['host', 'port', 'secure', 'user', 'from', 'to'];
        allowedFields.forEach((field) => {
          if (input[field] !== undefined) saved[field] = field === 'port' ? Number(input[field]) : input[field];
        });
        if (typeof input.pass === 'string' && input.pass) saved.pass = input.pass;
        if (input.clearPassword === true) delete saved.pass;
        writeState({ ...current, settings: { ...current.settings, smtp: saved } });
        const settings = getSmtpSettings();
        sendJson(res, 200, {
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          user: settings.user,
          from: settings.from,
          to: settings.to,
          passwordConfigured: Boolean(settings.pass),
          environmentOverrides: getSmtpEnvironmentOverrides(),
        });
      }).catch((error) => sendJson(res, 400, { error: error.message }));
      return;
    }
  }

  if (url.pathname === '/api/bookings') {
    if (req.method === 'POST') {
      parseRequestBody(req).then(async (booking) => {
        const id = booking.id || `booking-${crypto.randomUUID()}`;
        logBookingEmail('booking_received', id);
        if (!booking.name || !booking.email || !booking.phone || !booking.vehicle || !booking.package) {
          logBookingEmail('booking_validation_failed', id);
          sendJson(res, 400, { error: 'Name, email, phone, vehicle, and package are required.' });
          return;
        }
        const current = readState();
        const existing = current.bookings.find((record) => record.id === id);
        if (existing) {
          logBookingEmail('duplicate_booking_ignored', id);
          sendJson(res, 200, existing);
          return;
        }
        const created = {
          ...booking,
          id,
          status: 'Pending',
          created: new Date().toISOString(),
          employeeId: null,
          employeeName: '',
        };
        const savedBooking = writeState({ ...current, bookings: [...current.bookings, created] }).bookings.at(-1);
        logBookingEmail('booking_saved', id);
        let emailSent = false;
        try {
          const recipient = getSmtpSettings().to;
          await sendConfiguredEmail({
            to: recipient,
            replyTo: savedBooking.email,
            subject: `New booking request: ${savedBooking.name}`,
            text: [
              `Customer: ${savedBooking.name}`,
              `Email: ${savedBooking.email}`,
              `Phone: ${savedBooking.phone}`,
              `Vehicle: ${savedBooking.vehicle}`,
              `Service: ${savedBooking.package}`,
              `Preferred date: ${savedBooking.preferred_date || 'Not specified'}`,
              `Service address: ${savedBooking.service_address || 'Not specified'}`,
              `Access notes: ${savedBooking.access_notes || 'None'}`,
              `Amount: ${savedBooking.amount || 'Not specified'}`,
              `Booking ID: ${savedBooking.id}`,
            ].join('\n'),
            bookingId: id,
          });
          emailSent = true;
        } catch (error) {
          logBookingEmail('smtp_delivery_failed', id, {
            code: error.code || null,
            responseCode: error.responseCode || null,
            message: error.message,
          });
        }
        logBookingEmail('booking_response_sent', id, { emailSent });
        sendJson(res, 201, { ...savedBooking, emailSent });
      }).catch((error) => {
        logBookingEmail('booking_request_failed', null, { message: error.message });
        sendJson(res, 400, { error: error.message });
      });
      return;
    }
    if (!isAdminAuthenticated(req)) {
      sendJson(res, 401, { error: 'Authentication required.' });
      return;
    }
    if (req.method === 'GET') {
      sendJson(res, 200, readState().bookings);
      return;
    }

    if (req.method === 'PUT') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : [];
          const current = readState();
          sendJson(res, 200, writeState({ ...current, bookings: Array.isArray(parsed) ? parsed : current.bookings }).bookings);
        } catch {
          sendJson(res, 400, { error: 'Invalid bookings payload' });
        }
      });
      return;
    }
  }

  if (url.pathname === '/api/employees') {
    if (!isAdminAuthenticated(req)) {
      sendJson(res, 401, { error: 'Authentication required.' });
      return;
    }
    if (req.method === 'GET') {
      sendJson(res, 200, readState().employees);
      return;
    }

    if (req.method === 'PUT') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : [];
          const current = readState();
          sendJson(res, 200, writeState({ ...current, employees: Array.isArray(parsed) ? parsed : current.employees }).employees);
        } catch {
          sendJson(res, 400, { error: 'Invalid employees payload' });
        }
      });
      return;
    }
  }
  if (url.pathname === '/api/enquiries' && req.method === 'POST') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', async () => {
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        const service = String(parsed.service || '').trim();
        const phone = String(parsed.phone || '').trim();
        const message = String(parsed.message || '').trim();
        if (!service || !phone || !message) {
          sendJson(res, 400, { error: 'Service, phone number, and enquiry are required.' });
          return;
        }

        const enquiry = {
          id: `enquiry-${Date.now()}`,
          service,
          phone,
          message,
          created: new Date().toISOString(),
          status: 'Pending',
        };
        const current = readState();
        writeState({ ...current, enquiries: [...current.enquiries, enquiry] });

        if (!getSmtpSettings().host || !getSmtpSettings().user || !getSmtpSettings().pass) {
          sendJson(res, 503, { error: 'Enquiry was saved, but email delivery is not configured.' });
          return;
        }

        await sendConfiguredEmail({
          to: getSmtpSettings().to,
          replyTo: getSmtpSettings().from,
          subject: `Service enquiry: ${service}`,
          text: `Service: ${service}\nCustomer phone: ${phone}\n\nEnquiry:\n${message}`,
        });
        sendJson(res, 201, { ok: true });
      } catch (error) {
        sendJson(res, 500, { error: error?.message || 'Unable to send enquiry.' });
      }
    });
    return;
  }

  serveWebApp(req, res, url);
});

server.listen(PORT, () => {
  console.log(`Shared data server running on http://localhost:${PORT}`);
});
