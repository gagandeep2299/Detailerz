export const BUSINESS = {
    name: 'Akaal Detailerz Co.',
    tagline: 'Professional mobile detailing brought to your driveway, home, or workplace across Southwestern Ontario.',
    phone: '(705) 790-1054',
    email: 'azaaldetailerz13@gmail.com',
    address: 'Serving Kitchener, Cambridge, Guelph, Waterloo, Ayr, Woodstock, and Brantford',
    serviceArea: 'Kitchener, Cambridge, Guelph, Waterloo, Ayr, Woodstock, and Brantford, Ontario',
    hours: 'Mon–Fri 12pm–8pm · Sat–Sun 8am–8pm',
};

export const SERVICE_LOCATIONS = ['Kitchener', 'Cambridge', 'Guelph', 'Waterloo', 'Ayr', 'Woodstock', 'Brantford'];

export const EXTERIOR_VEHICLE_TYPES = [
    { value: 'sedan-coupe', label: 'Sedan / Coupe' },
    { value: 'suv-crossover', label: 'SUV / Crossover' },
    { value: 'truck-large-suv-van', label: 'Truck / Large SUV / Van' },
];

export const IMAGES = {
    hero: '/images/hero.png',
    polish: '/images/polish.png',
    interior: '/images/interior.png',
    before: '/images/before.png',
    after: '/images/after.png',
    ceramic: '/images/ceramic.png',
    wheels: '/images/wheels.png',
    owner: '/images/owner.png',
};

export const SERVICES = [
    {
        name: 'Interior Cleaning',
        price: 45,
        time: '45 min',
        icon: 'cabin',
        desc: "We bring deep interior cleaning to your driveway, removing stains, odors, dust, and everyday buildup.",
    },
    {
        name: 'Showroom Exterior Finish',
        price: 149,
        time: '3 hrs',
        icon: 'exterior',
        desc: 'We bring a brilliant shine to your home or workplace with paint-safe washing and protective finishing treatments.',
    },
    {
        name: 'Paint Correction',
        price: 279,
        time: '5–6 hrs',
        icon: 'paint',
        desc: 'Remove swirl marks, scratches, and oxidation to restore depth, clarity, and a mirror-like gloss.',
    },
    {
        name: 'Ceramic Shield Coating',
        price: 449,
        time: '1 day',
        icon: 'ceramic',
        desc: 'Protect your paint with a premium ceramic coating that repels water, dirt, UV rays, and contaminants.',
    },
    {
        name: 'Crystal Clear Headlights',
        price: 1195,
        time: '2 days',
        icon: 'headlights',
        desc: 'Restore faded headlights for improved nighttime visibility and a cleaner, newer-looking front end.',
    },
    {
        name: 'Truck Detailing',
        price: 179,
        time: '4 hrs',
        icon: 'truck',
        desc: 'Give your truck a complete inside-and-out detail built for larger vehicles, tougher buildup, and hard-working interiors.',
    },
];

export const SERVICE_PACKAGES = {
    'Interior Cleaning': [
        {
            name: '(Basic) Interior Refresh',
            price: 99,
            time: '60 min',
            desc: 'A quick reset for lightly used interiors.',
            features: ['Interior stage 1 vacuum', 'Dashboard and console wipe-down', 'Door panel wipe', 'Seat surface wipe', 'Glass Cleaning inside and out','Floor mat cleaning'],
        },
        {
            name: '(Deluxe) Deep Clean',
            price: 149,
            time: '3 hrs',
            desc: 'Our complete interior restoration for everyday stains and buildup.',
            features: ['Everything in (Basic) Interior Refresh', 'Front Two Seat shampooing', 'Full Vacuum 3 stage', 'Dashboard door panels and console detailing', 'Carpet light stains cleaning and salt removing', 'Odor treatment','Interior windows cleaned and polished'],
            featured: true,
        },
        {
            name: '(Premium) Complete Cabin Revival',
            price: 179,
            time: '4 hrs',
            desc: 'The deepest clean for heavily soiled interiors.',
            features: ['Everything in (Deluxe) Deep Clean', 'Full deep vacuum 3 stage(include seats sides)', 'All seats shampooing', 'Steam cleaning for seats & carpets', 'AC vents deep clean (steam)', 'Leather cleaning & conditioning', 'Door panels & trims restored','Light roof strains','Truck vacuumed'],
        },
    ],
    'Showroom Exterior Finish': [
        {
            name: 'Express Exterior Wash',
            price: 50,
            time: '45–60 min',
            desc: 'A quick exterior reset with a careful hand wash and clean finish.',
            vehiclePrices: { 'sedan-coupe': 50, 'suv-crossover': 60, 'truck-large-suv-van': 70 },
            features: ['Hand Wash & Foam Bath', 'Wheels & Tires', 'Soft microfiber hand dry + air blowout', 'Exterior glass and mirror cleaning'],
            featured: true,
        },
        {
            name: 'Decontamination & Protection Wash',
            price: 120,
            time: '2–3 hrs',
            desc: 'A deep exterior clean with paint decontamination and protective finishing.',
            vehiclePrices: { 'sedan-coupe': 120, 'suv-crossover': 140, 'truck-large-suv-van': 155 },
            features: ['Complete Foam & Pre-Soak', 'Deep Wheel & Barrel Cleaning', 'Paint decontamination with iron remover and clay bar', 'Door jambs & trims deep clean', 'Microfiber hand dry + full air blowout'],
        },
    ],
    'Truck Detailing': [
        {
            name: 'Day Cab Interior Refresh',
            price: 179,
            time: '4 hrs',
            desc: 'A complete maintenance detail for trucks and larger vehicles.',
            features: ['Dashboard & Console Steam Sanitation', 'Deep cleaning of vents, cup holders, switches, and door panels', 'Floor & Seat Deep Clean', 'High-powered vacuuming and hot-water spot extraction for floor mats, carpet, and fabric seats', 'Leather & Vinyl Protection', 'Glass & Mirror Polish', 'Odor Neutralization: Cabin-wide deodorizing treatment'],
        },
        {
            name: 'Sleeper Cab "Home Away From Home" Detail',
            price: 249,
            time: '6 hrs',
            desc: 'A total cabin deep-clean for long-haul OTR drivers. We clean, sanitize, and restore your entire bunk and driving area so your truck feels fresh, healthy, and comfortable on long stretches.',
            features: ['Full Cab & Bunk Sanitation: •Steam treatment of driving controls, sleeper storage, cubbies, fridge exterior', 'Mattress & Bed Area Deep Clean', 'Full Carpet & Upholstery Extraction', 'Leather & Trim Conditioning', 'Glass, Cabinet & Mirror Polish', 'Deep Odor & Bacteria Elimination: (Complete cabin deodorization targeting smoke, sweat, and food odors.)'],
            featured: true,
        },
    ],
};

export const SERVICE_ADDONS = {
    'Interior Cleaning': [
        { name: 'Pet Hair Removal', price: 49, icon: 'pet', desc: 'Thorough removal of pet hair from seats, carpets, and hard-to-reach areas.' },
        { name: 'Odor Treatment', price: 19, icon: 'odor', desc: 'Targeted treatment to neutralize persistent interior odors.' },
        { name: '7-Seater, Van, or Pickup Truck', price: 20, icon: 'vehicle-size', desc: 'Additional charge for larger interiors and extra seating capacity.' },
    ],
    'Showroom Exterior Finish': [
        { name: 'Headlight Restoration', price: 60, icon: 'headlights', desc: 'Restore faded headlights for improved nighttime visibility and a cleaner-looking front end.' },
        { name: 'Engine Bay Steam Clean & Dress', price: 60, icon: 'headlights', desc: 'Deep steam cleaning and dressing for the engine bay area.' },
        { name: 'Heavy Bug & Tar / Sap Removal', price: 20, icon: 'caliper', desc: 'Targeted removal of stubborn bug, tar, and sap buildup from the paint.' },
        { name: 'Iron / Salt Removal Upgrade', price: 30, icon: 'caliper', desc: 'Upgrade treatment to remove embedded iron and salt contaminants from the paint.' },
    ],
};

export const PACKAGES = [
    {
        name: 'Maintain',
        price: 89,
        cadence: 'per visit',
        blurb: 'For a daily driver that already looks good.',
        features: ['Two-bucket hand wash', 'Wheels, tires and door jambs', 'Interior vacuum and wipe-down', 'Spray sealant top-up', 'Glass inside and out'],
    },
    {
        name: 'Restore',
        price: 279,
        cadence: 'one time',
        blurb: 'Our most-booked package. Inside and out, top to bottom.',
        features: ['Everything in Maintain', 'Clay bar decontamination', 'Iron fallout treatment', 'Carpet and upholstery extraction', 'Leather conditioning', '6-month paint sealant'],
        featured: true,
    },
    {
        name: 'Protect',
        price: 1195,
        cadence: 'from',
        blurb: 'Correction plus a five-year ceramic coating.',
        features: ['Full Restore service', 'Single-stage paint correction', '5-year ceramic coating', 'Coated wheels and glass', 'Annual inspection', 'Two free maintenance washes'],
    },
];

export const GALLERY = [
    { src: IMAGES.before, label: 'Before — 2016 sedan, three years without a polish', tag: 'Before' },
    { src: IMAGES.after, label: 'After — two-stage correction and sealant', tag: 'After' },
    { src: IMAGES.polish, label: 'Machine polishing a metallic blue clear coat', tag: 'Process' },
    { src: IMAGES.interior, label: 'Leather cleaned, conditioned and protected', tag: 'Interior' },
    { src: IMAGES.ceramic, label: 'Ceramic coating laid down panel by panel', tag: 'Coating' },
    { src: IMAGES.wheels, label: 'Wheel barrels and calipers decontaminated', tag: 'Wheels' },
];

export const TESTIMONIALS = [
    {
        quote: 'I bought a used truck with heavy swirl marks and honestly expected them to just be part of it. Marcus corrected the paint over two days and it looks better than the showroom photos.',
        name: 'Danielle Kwon',
        detail: 'Ram 1500 · Paint correction',
    },
    {
        quote: 'Two kids, one golden retriever, five years of road trips. The interior extraction was worth every dollar — the car smells new and the carpets came back to their original color.',
        name: 'Peter Alvarado',
        detail: 'Honda Pilot · Interior deep clean',
    },
    {
        quote: 'The ceramic coating has been on for eighteen months. Rain sheets off, bug guts wipe away, and the annual check-in was free like they promised. No upselling, no surprises.',
        name: 'Rhiannon Blake',
        detail: 'Tesla Model 3 · 5-year ceramic',
    },
];
