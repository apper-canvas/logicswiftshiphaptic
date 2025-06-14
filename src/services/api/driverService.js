import driversData from '../mockData/drivers.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let drivers = [...driversData];

const driverService = {
  async getAll() {
    await delay(250);
    return [...drivers];
  },

  async getById(id) {
    await delay(200);
    const driver = drivers.find(d => d.id === id);
    return driver ? { ...driver } : null;
  },

  async getAvailable() {
    await delay(200);
    return drivers.filter(d => d.status === 'available').map(d => ({ ...d }));
  },

  async create(driverData) {
    await delay(300);
    const newDriver = {
      ...driverData,
      id: Date.now().toString(),
      status: 'available',
      activeDeliveries: [],
      rating: 5.0,
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      }
    };
    drivers.push(newDriver);
    return { ...newDriver };
  },

  async update(id, updates) {
    await delay(200);
    const index = drivers.findIndex(d => d.id === id);
    if (index !== -1) {
      drivers[index] = { ...drivers[index], ...updates };
      return { ...drivers[index] };
    }
    throw new Error('Driver not found');
  },

  async delete(id) {
    await delay(200);
    const index = drivers.findIndex(d => d.id === id);
    if (index !== -1) {
      drivers.splice(index, 1);
      return true;
    }
    throw new Error('Driver not found');
  },

  async updateLocation(id, location) {
    await delay(100);
    const driver = drivers.find(d => d.id === id);
    if (driver) {
      driver.location = location;
      return { ...driver };
    }
    throw new Error('Driver not found');
  }
};

export default driverService;