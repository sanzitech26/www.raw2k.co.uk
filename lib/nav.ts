export const makes = ['Audi', 'BMW', 'Ford', 'Mercedes', 'Peugeot', 'Renault', 'Vauxhall', 'Volkswagen', 'Seat', 'Nissan', 'Honda', 'Citroen', 'Toyota']
export const areas = ['East Midlands', 'East Anglia', 'North East', 'North West', 'Northern Ireland', 'Scotland', 'South East', 'South West', 'Wales', 'West Midlands', 'Yorkshire']
export const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
export const types = [['Car/Van', '/car-auctions'], ['Bikes/Quads', '/bikes-auctions'], ['HGV/Caravans', '/caravans-auctions'], ['Plant/Machinery', '/machinery-auctions']]
export const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
