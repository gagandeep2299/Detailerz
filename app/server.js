const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'shared-store.json');

const defaultState = {
  bookings: [
    {
      id: 'booking-001',
      customerId: 'customer-4267118e',
      name: 'Danielle Kwon',
      email: 'danielle@example.com',
      phone: '(602) 555-0188',
      vehicle: 'Ram 1500',
      package: 'Paint correction',
      preferred_date: '2026-08-18',
      status: 'Confirmed',
      amount: 1240,
      created: '2026-08-12T10:20:00Z',
      employeeId: 'emp-101',
      employeeName: 'Alex Martinez',
      beforeImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      afterImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      feedback: null,
      feedbackSent: false,
    },
    {
      id: 'booking-002',
      customerId: 'customer-11645796',
      name: 'Peter Alvarado',
      email: 'peter@example.com',
      phone: '(602) 555-0161',
      vehicle: 'Honda Pilot',
      package: 'Interior deep clean',
      preferred_date: '2026-08-19',
      status: 'Pending',
      amount: 240,
      created: '2026-08-11T14:00:00Z',
      employeeId: 'emp-101',
      employeeName: 'Alex Martinez',
      beforeImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
      afterImage: '',
      feedback: null,
      feedbackSent: false,
    },
    {
      id: 'booking-003',
      customerId: 'customer-34d62214',
      name: 'Rhiannon Blake',
      email: 'rhiannon@example.com',
      phone: '(602) 555-0129',
      vehicle: 'Tesla Model 3',
      package: '5-year ceramic',
      preferred_date: '2026-08-24',
      status: 'In progress',
      amount: 1890,
      created: '2026-08-12T09:00:00Z',
      employeeId: 'emp-102',
      employeeName: 'Jordan Lee',
      beforeImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      afterImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      feedback: null,
      feedbackSent: false,
    },
    {
      id: 'booking-004',
      customerId: 'customer-8f4f41bf',
      name: 'Marcus Chen',
      email: 'marcus@example.com',
      phone: '(602) 555-0118',
      vehicle: 'BMW M4',
      package: 'Full detail',
      preferred_date: '2026-08-21',
      status: 'Completed',
      amount: 690,
      created: '2026-08-09T11:30:00Z',
      employeeId: 'emp-102',
      employeeName: 'Jordan Lee',
      beforeImage: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
      afterImage: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=900&q=80',
      feedback: {
        rating: 5,
        message: 'Excellent work and amazing finish. Great communication throughout the process.',
        sentAt: '2026-08-15T10:00:00Z',
        sent: true,
      },
      feedbackSent: true,
    },
  ],
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

const ensureDataFile = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
  }
};

const readState = () => {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return {
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : defaultState.bookings,
      employees: Array.isArray(parsed.employees) ? parsed.employees : defaultState.employees,
    };
  } catch {
    return { ...defaultState };
  }
};

const writeState = (nextState) => {
  ensureDataFile();
  const safeState = {
    bookings: Array.isArray(nextState?.bookings) ? nextState.bookings : defaultState.bookings,
    employees: Array.isArray(nextState?.employees) ? nextState.employees : defaultState.employees,
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(safeState, null, 2));
  return safeState;
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
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

  if (url.pathname === '/api/state') {
    if (req.method === 'GET') {
      sendJson(res, 200, readState());
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

  if (url.pathname === '/api/bookings') {
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

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Shared data server running on http://localhost:${PORT}`);
});
