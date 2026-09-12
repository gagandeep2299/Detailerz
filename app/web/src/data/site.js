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
    'Truck Detailing': [
        {
            name: 'Truck Essential',
            price: 179,
            time: '4 hrs',
            desc: 'A complete maintenance detail for trucks and larger vehicles.',
            features: ['Hand wash and foam pre-soak', 'Wheels, tires and wheel wells cleaned', 'Interior vacuum and wipe-down', 'Dashboard, console and door panels cleaned', 'Interior and exterior glass cleaned'],
        },
        {
            name: 'Truck Complete',
            price: 299,
            time: '6 hrs',
            desc: 'Our deepest truck service for heavy road grime and a full interior reset.',
            features: ['Everything in Truck Essential', 'Clay bar decontamination', 'Carpet and upholstery extraction', 'Heavy bug, tar and grime removal', 'Trim and tire dressing', '6-month paint sealant'],
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
        { name: 'Caliper Rust Clean', price: 39, icon: 'caliper', desc: 'Specialized cleaning to remove rust buildup from brake calipers.' },
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
