const STORAGE_KEY = 'detailerz-bookings';
const EMPLOYEE_STORAGE_KEY = 'detailerz-employees';
const SHARED_SERVER_URL = 'http://localhost:4000';
const SHARED_SYNC_INTERVAL_MS = 2000;

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();
const normalizePhone = (value = '') => String(value || '').replace(/\D/g, '');

const makeId = (prefix) => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const buildCustomerId = (source = '') => {
    const normalized = normalizeEmail(source) || normalizePhone(source);
    if (!normalized) return makeId('customer');

    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
    }

    return `customer-${hash.toString(16).padStart(8, '0')}`;
};

const resolveCustomerId = (booking, allBookings = state.bookings) => {
    const emailKey = normalizeEmail(booking.email);
    const phoneKey = normalizePhone(booking.phone);

    const matchingBooking = allBookings.find((candidate) => {
        if (candidate.id === booking.id) return false;

        const candidateEmail = normalizeEmail(candidate.email);
        const candidatePhone = normalizePhone(candidate.phone);
        return Boolean(
            (emailKey && candidateEmail && emailKey === candidateEmail)
            || (phoneKey && candidatePhone && phoneKey === candidatePhone)
        );
    });

    if (matchingBooking?.customerId) return matchingBooking.customerId;
    if (booking.customerId) return booking.customerId;
    return buildCustomerId(emailKey || phoneKey || booking.name || booking.id);
};

const reconcileCustomerIds = (bookings = []) => {
    const identityMap = new Map();

    return bookings.map((booking) => {
        const emailKey = normalizeEmail(booking.email);
        const phoneKey = normalizePhone(booking.phone);
        const candidateKeys = [
            emailKey ? `email:${emailKey}` : null,
            phoneKey ? `phone:${phoneKey}` : null,
        ].filter(Boolean);

        const resolvedCustomerId = candidateKeys
            .map((key) => identityMap.get(key))
            .find(Boolean) || booking.customerId || resolveCustomerId(booking, bookings);

        const finalCustomerId = resolvedCustomerId || buildCustomerId(emailKey || phoneKey || booking.name || booking.id);

        candidateKeys.forEach((key) => identityMap.set(key, finalCustomerId));

        return {
            ...booking,
            email: emailKey || 'unknown@example.com',
            customerId: finalCustomerId,
        };
    });
};

const mergeContactDetails = (customer, booking) => {
    const emails = new Set((customer.emails || []).filter(Boolean).map((email) => normalizeEmail(email)));
    const phones = new Set((customer.phones || []).filter(Boolean).map((phone) => normalizePhone(phone)));

    const emailValue = normalizeEmail(booking.email || customer.email || '');
    const phoneValue = normalizePhone(booking.phone || customer.phone || '');

    if (emailValue) {
        emails.add(emailValue);
    }
    if (phoneValue) {
        phones.add(phoneValue);
    }

    const primaryEmail = customer.email || booking.email || '';
    const primaryPhone = customer.phone || booking.phone || '';

    return {
        ...customer,
        emails: [...emails].filter(Boolean),
        phones: [...phones].filter(Boolean),
        email: primaryEmail || [...emails][0] || 'unknown@example.com',
        phone: primaryPhone || [...phones][0] || '(000) 000-0000',
    };
};

const defaultEmployees = [
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
];

const defaultBookings = [
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
];

const listeners = new Set();

const readStoredBookings = () => {
    if (typeof window === 'undefined') return reconcileCustomerIds(defaultBookings);

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return reconcileCustomerIds(defaultBookings);

        const parsed = JSON.parse(raw);
        const safeParsed = Array.isArray(parsed) && parsed.length ? parsed : defaultBookings;
        return reconcileCustomerIds(safeParsed);
    } catch {
        return reconcileCustomerIds(defaultBookings);
    }
};

const readStoredEmployees = () => {
    if (typeof window === 'undefined') return [...defaultEmployees];

    try {
        const raw = window.localStorage.getItem(EMPLOYEE_STORAGE_KEY);
        if (!raw) return [...defaultEmployees];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : [...defaultEmployees];
    } catch {
        return [...defaultEmployees];
    }
};

const seedDefaultState = () => {
    if (typeof window === 'undefined') return;

    const defaultBookingState = reconcileCustomerIds(defaultBookings);
    const defaultEmployeeState = [...defaultEmployees];

    if (!window.localStorage.getItem(STORAGE_KEY)) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBookingState));
    }

    if (!window.localStorage.getItem(EMPLOYEE_STORAGE_KEY)) {
        window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(defaultEmployeeState));
    }
};

const state = {
    bookings: readStoredBookings(),
    employees: readStoredEmployees(),
};

const refreshFromSharedServer = async () => {
    if (typeof window === 'undefined') return;

    try {
        const response = await fetch(`${SHARED_SERVER_URL}/api/state`, { cache: 'no-store' });
        if (!response.ok) return;

        const payload = await response.json();
        if (!payload || typeof payload !== 'object') return;

        const nextBookings = Array.isArray(payload.bookings) ? payload.bookings : state.bookings;
        const nextEmployees = Array.isArray(payload.employees) ? payload.employees : state.employees;

        state.bookings = reconcileCustomerIds(nextBookings);
        state.employees = nextEmployees;
        persist();
        persistEmployees();
        notify();
    } catch {
        // Ignore server sync failures and keep local state fallback.
    }
};

const syncToSharedServer = async (nextState) => {
    if (typeof window === 'undefined') return;

    try {
        await fetch(`${SHARED_SERVER_URL}/api/state`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextState || { bookings: state.bookings, employees: state.employees }),
        });
    } catch {
        // Ignore server sync failures and keep local storage fallback.
    }
};

seedDefaultState();
state.bookings = readStoredBookings();
state.employees = readStoredEmployees();
if (typeof window !== 'undefined') {
    refreshFromSharedServer();
    const sharedSyncTimer = window.setInterval(() => {
        refreshFromSharedServer();
    }, SHARED_SYNC_INTERVAL_MS);

    window.addEventListener('beforeunload', () => {
        window.clearInterval(sharedSyncTimer);
    });
}

const persist = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
    }
};

const persistEmployees = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(state.employees));
    }
};

const persistAndSyncServer = async () => {
    persist();
    persistEmployees();
    await syncToSharedServer({
        bookings: state.bookings,
        employees: state.employees,
    });
};

const notify = () => {
    const snapshot = {
        bookings: state.bookings,
        employees: state.employees,
    };

    listeners.forEach((listener) => listener(snapshot));

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('detailerz-db-sync', {
            detail: snapshot,
        }));
    }
};

const syncFromExternalState = (payload) => {
    if (!payload) return;

    if (Array.isArray(payload.bookings)) {
        state.bookings = reconcileCustomerIds(payload.bookings);
    }

    if (Array.isArray(payload.employees)) {
        state.employees = payload.employees;
    }

    const snapshot = {
        bookings: state.bookings,
        employees: state.employees,
    };

    listeners.forEach((listener) => listener(snapshot));
};

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (!event.key || event.key === STORAGE_KEY || event.key === EMPLOYEE_STORAGE_KEY) {
            try {
                const nextBookings = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
                const nextEmployees = JSON.parse(window.localStorage.getItem(EMPLOYEE_STORAGE_KEY) || 'null');

                if (Array.isArray(nextBookings)) {
                    state.bookings = reconcileCustomerIds(nextBookings);
                }

                if (Array.isArray(nextEmployees)) {
                    state.employees = nextEmployees;
                }

                const snapshot = {
                    bookings: state.bookings,
                    employees: state.employees,
                };

                listeners.forEach((listener) => listener(snapshot));
            } catch {
                // Ignore malformed persisted data and keep the current in-memory state.
            }
        }
    });

    window.addEventListener('detailerz-db-sync', (event) => {
        syncFromExternalState(event?.detail || null);
    });
}

const normalizeBooking = (input) => {
    const email = normalizeEmail(input.email || 'unknown@example.com');
    const date = input.preferred_date || new Date().toISOString().slice(0, 10);
    const amount = Number(input.amount || estimatePackageValue(input.package || input.service || 'General detail'));
    const phone = input.phone || '(000) 000-0000';
    const customerId = input.customerId || resolveCustomerId({ ...input, email, phone }, state.bookings);
    const status = input.status || 'Pending';

    return {
        id: input.id || makeId('booking'),
        customerId,
        name: input.name || 'Unknown customer',
        email,
        phone,
        vehicle: input.vehicle || 'Unknown vehicle',
        package: input.package || input.service || 'General detail',
        preferred_date: date,
        status,
        amount,
        created: input.created || new Date().toISOString(),
        employeeId: input.employeeId || null,
        employeeName: input.employeeName || '',
        beforeImage: input.beforeImage || '',
        afterImage: input.afterImage || '',
        feedback: input.feedback || null,
        feedbackSent: Boolean(input.feedbackSent || input.feedback?.sent),
        completedAt: input.completedAt || (status === 'Completed' ? new Date().toISOString() : null),
    };
};

const estimatePackageValue = (packageName = '') => {
    const normalized = String(packageName).toLowerCase();

    if (normalized.includes('ceramic')) return 1890;
    if (normalized.includes('paint') || normalized.includes('correction')) return 1240;
    if (normalized.includes('interior')) return 240;
    if (normalized.includes('full detail')) return 690;
    if (normalized.includes('headlight')) return 120;
    if (normalized.includes('wash')) return 89;

    return 250;
};

export const inMemoryDb = {
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    getBookings() {
        return [...state.bookings].sort((a, b) => new Date(b.created) - new Date(a.created));
    },

    getEmployees() {
        return [...state.employees].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    },

    getEmployeeById(employeeId) {
        return this.getEmployees().find((employee) => employee.id === employeeId) || null;
    },

    addEmployee(input = {}) {
        const nextEmployee = {
            id: input.id || makeId('emp'),
            name: String(input.name || 'New employee').trim(),
            email: normalizeEmail(input.email || 'employee@example.com'),
            phone: String(input.phone || ''),
            role: input.role || 'employee',
            password: input.password || 'employee123',
        };

        const duplicate = state.employees.find((employee) => employee.id === nextEmployee.id || normalizeEmail(employee.email) === nextEmployee.email);
        if (duplicate) {
            return this.updateEmployee(duplicate.id, nextEmployee);
        }

        state.employees = [...state.employees, nextEmployee];
        persistEmployees();
        notify();
        return nextEmployee;
    },

    updateEmployee(id, updates = {}) {
        let changed = false;

        state.employees = state.employees.map((employee) => {
            if (employee.id !== id) return employee;
            changed = true;

            return {
                ...employee,
                name: String(updates.name ?? employee.name).trim() || employee.name,
                email: normalizeEmail(updates.email ?? employee.email),
                phone: String(updates.phone ?? (employee.phone || '')),
                role: updates.role ?? employee.role ?? 'employee',
                password: updates.password ?? employee.password ?? 'employee123',
            };
        });

        if (changed) {
            state.bookings = state.bookings.map((booking) => {
                if (booking.employeeId !== id) return booking;
                return {
                    ...booking,
                    employeeName: state.employees.find((employee) => employee.id === id)?.name || booking.employeeName || '',
                };
            });
            persistAndSyncServer();
            notify();
        }

        return this.getEmployeeById(id);
    },

    deleteEmployee(id) {
        const employeeExists = state.employees.some((employee) => employee.id === id);
        if (!employeeExists) return false;

        state.employees = state.employees.filter((employee) => employee.id !== id);
        state.bookings = state.bookings.map((booking) => {
            if (booking.employeeId !== id) return booking;
            return {
                ...booking,
                employeeId: null,
                employeeName: '',
            };
        });
        persistAndSyncServer();
        notify();
        return true;
    },

    getCustomers() {
        const byCustomerId = new Map();

        state.bookings.forEach((booking) => {
            const key = booking.customerId || buildCustomerId(booking.email || '');
            const current = byCustomerId.get(key) || {
                customerId: key,
                name: booking.name,
                email: booking.email,
                phone: booking.phone,
                vehicle: booking.vehicle,
                total: 0,
                bookings: 0,
                lastVisit: booking.created || new Date().toISOString(),
                bookingIds: [],
                emails: [],
                phones: [],
            };

            const nextCustomer = mergeContactDetails(current, booking);
            nextCustomer.total = Number(nextCustomer.total || 0) + Number(booking.amount || 0);
            nextCustomer.bookings = (nextCustomer.bookings || 0) + 1;
            nextCustomer.vehicle = booking.vehicle || nextCustomer.vehicle;
            nextCustomer.bookingIds = [...new Set([...(nextCustomer.bookingIds || []), booking.id])];
            nextCustomer.lastVisit = new Date(booking.created || nextCustomer.lastVisit) > new Date(nextCustomer.lastVisit)
                ? booking.created || nextCustomer.lastVisit
                : nextCustomer.lastVisit;

            byCustomerId.set(key, nextCustomer);
        });

        return [...byCustomerId.values()].sort((a, b) => b.total - a.total);
    },

    getCustomerById(customerId) {
        return this.getCustomers().find((customer) => customer.customerId === customerId) || null;
    },

    getBookingsByCustomerId(customerId) {
        return this.getBookings().filter((booking) => booking.customerId === customerId);
    },

    getStats() {
        const bookings = this.getBookings();
        const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

        return {
            totalRevenue,
            bookings: bookings.length,
            confirmed: bookings.filter((booking) => ['Confirmed', 'Completed'].includes(booking.status)).length,
            pending: bookings.filter((booking) => booking.status === 'Pending').length,
            active: bookings.filter((booking) => booking.status === 'In progress').length,
        };
    },

    getPendingBookings(employeeId = null) {
        const bookings = this.getBookings();
        return bookings.filter((booking) => {
            const matchesEmployee = !employeeId || booking.employeeId === employeeId;
            return matchesEmployee && booking.status !== 'Completed';
        });
    },

    getCompletedBookings(employeeId = null) {
        const bookings = this.getBookings();
        return bookings.filter((booking) => {
            const matchesEmployee = !employeeId || booking.employeeId === employeeId;
            return matchesEmployee && booking.status === 'Completed';
        });
    },

    getEmployeeBookings(employeeId) {
        return this.getBookings().filter((booking) => booking.employeeId === employeeId || booking.employeeName === employeeId);
    },

    getBookingsForEmployee(employeeId, employeeName = '') {
        const normalizedEmployeeId = String(employeeId || '').trim();
        const normalizedEmployeeName = String(employeeName || '').trim();

        return this.getBookings().filter((booking) => {
            const matchesId = normalizedEmployeeId && booking.employeeId === normalizedEmployeeId;
            const matchesName = normalizedEmployeeName && booking.employeeName === normalizedEmployeeName;
            const matchesLegacyName = !normalizedEmployeeId && !normalizedEmployeeName && booking.employeeName === employeeName;
            return matchesId || matchesName || matchesLegacyName;
        });
    },

    assignBookingToEmployee(id, employee) {
        if (!id || !employee) return null;

        const employeeId = employee.id || employee.employeeId || null;
        const employeeName = employee.name || employee.employeeName || '';

        if (!employeeId && !employeeName) return null;

        return this.updateBooking(id, {
            employeeId,
            employeeName,
        });
    },

    addBooking(input = {}) {
        const normalized = normalizeBooking(input);
        state.bookings = reconcileCustomerIds([normalized, ...state.bookings]);
        persistAndSyncServer();
        notify();
        return normalized;
    },

    updateBooking(id, updates = {}) {
        let changed = false;

        state.bookings = state.bookings.map((booking) => {
            if (booking.id !== id) return booking;

            changed = true;
            const nextBooking = normalizeBooking({
                ...booking,
                ...updates,
                id,
                customerId: updates.customerId || booking.customerId || buildCustomerId(updates.email || booking.email || ''),
                employeeId: updates.employeeId ?? booking.employeeId ?? null,
                employeeName: updates.employeeName ?? booking.employeeName ?? '',
                beforeImage: updates.beforeImage ?? booking.beforeImage ?? '',
                afterImage: updates.afterImage ?? booking.afterImage ?? '',
                feedback: updates.feedback ?? booking.feedback ?? null,
                feedbackSent: updates.feedbackSent ?? booking.feedbackSent ?? false,
            });
            return { ...booking, ...nextBooking };
        });

        if (changed) {
            state.bookings = reconcileCustomerIds(state.bookings);
            persistAndSyncServer();
            notify();
        }

        return state.bookings.find((booking) => booking.id === id) || null;
    },

    updateBookingStatus(id, status, extra = {}) {
        const nextStatus = status || 'Pending';
        const booking = this.getBookings().find((item) => item.id === id);
        if (!booking) return null;

        const updated = this.updateBooking(id, {
            ...extra,
            status: nextStatus,
            completedAt: nextStatus === 'Completed' ? extra.completedAt || new Date().toISOString() : null,
        });

        return updated;
    },

    updateBookingImages(id, beforeImage, afterImage) {
       return this.updateBooking(id, {
           beforeImage: beforeImage || '',
           afterImage: afterImage || '',
       });
    },

    submitFeedback(id, payload = {}) {
        const booking = this.getBookings().find((item) => item.id === id);
        if (!booking) return null;

        const feedback = {
            rating: payload.rating || 5,
            message: payload.message || '',
            sentAt: new Date().toISOString(),
            sent: true,
        };

        const updated = this.updateBooking(id, {
            feedback,
            feedbackSent: true,
            status: 'Completed',
            completedAt: new Date().toISOString(),
        });

        if (typeof window !== 'undefined') {
            const mailto = `mailto:${booking.email}?subject=${encodeURIComponent('Your Akaal Detailerz service feedback')} &body=${encodeURIComponent(`Hi ${booking.name},\n\nThank you for choosing Akaal Detailerz Co.\n\nYour feedback: ${feedback.message || 'Thanks for the great service!'}\n\nRating: ${feedback.rating}/5\n\nWe appreciate your business.`)}`;
            console.info('[Customer feedback email]', mailto);
        }

        return updated;
    },

    deleteBooking(id) {
        const existing = state.bookings.find((booking) => booking.id === id);
        if (!existing) return false;

        state.bookings = state.bookings.filter((booking) => booking.id !== id);
        persist();
        notify();
        return true;
    },

    exportCsv() {
        const rows = this.getBookings();
        const headers = ['id', 'customerId', 'name', 'email', 'phone', 'vehicle', 'package', 'preferred_date', 'status', 'amount', 'created'];
        const escapeCsvValue = (value) => {
            const safe = String(value ?? '').replace(/"/g, '""');
            return `"${safe}"`;
        };

        const body = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','));
        return [headers.join(','), ...body].join('\n');
    },

    reset() {
        state.bookings = reconcileCustomerIds([...defaultBookings]);
        state.employees = [...defaultEmployees];
        persistAndSyncServer();
        notify();
    },
};

export default inMemoryDb;
