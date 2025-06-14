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
  },

  async getPerformanceMetrics(id) {
    await delay(150);
    const driver = drivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    
    const performance = {
      driverId: id,
      totalDeliveries: driver.totalDeliveries || 0,
      rating: driver.rating || 0,
      efficiency: Math.min(100, (driver.totalDeliveries / 1000) * 100),
      onTimeRate: Math.random() * 0.2 + 0.8, // 80-100%
      avgDeliveryTime: Math.random() * 60 + 90, // 90-150 minutes
      avgDistance: Math.random() * 5 + 5, // 5-10 km
      customerSatisfaction: driver.rating / 5 * 100,
      completionRate: Math.random() * 0.1 + 0.9, // 90-100%
      fuelEfficiency: Math.random() * 2 + 8, // 8-10 km/l
      vehicleType: driver.vehicleType,
      status: driver.status,
      performanceScore: Math.round((driver.rating * 20) + (driver.totalDeliveries / 10))
    };
    
    return performance;
  },

  async getDriverEfficiency(timeFrame = '30d') {
    await delay(200);
    const efficiencyData = drivers.map(driver => ({
      id: driver.id,
      name: driver.name,
      totalDeliveries: driver.totalDeliveries,
      rating: driver.rating,
      efficiency: Math.min(100, (driver.totalDeliveries / 1000) * 100),
      deliveriesPerDay: Math.round(driver.totalDeliveries / 30),
      avgRevenue: Math.round(driver.totalDeliveries * 15 + Math.random() * 500),
      performanceScore: Math.round((driver.rating * 20) + (driver.totalDeliveries / 10)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.round(Math.random() * 15 + 5)
    }));
    
    return efficiencyData.sort((a, b) => b.performanceScore - a.performanceScore);
  },

  async getPerformanceComparison() {
    await delay(180);
    const comparison = {
      topPerformer: drivers.reduce((top, driver) => 
        driver.totalDeliveries > (top?.totalDeliveries || 0) ? driver : top, null),
      averageRating: drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length,
      totalActiveDrivers: drivers.filter(d => d.status !== 'offline').length,
      performanceDistribution: {
        excellent: drivers.filter(d => d.rating >= 4.5).length,
        good: drivers.filter(d => d.rating >= 4.0 && d.rating < 4.5).length,
        average: drivers.filter(d => d.rating >= 3.5 && d.rating < 4.0).length,
        needsImprovement: drivers.filter(d => d.rating < 3.5).length
      }
    };
    
    return comparison;
  },

  async getPerformanceTrends(driverId, days = 30) {
    await delay(150);
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        deliveries: Math.floor(Math.random() * 10) + 2,
        rating: Math.random() * 0.5 + 4.0,
        efficiency: Math.random() * 20 + 70
      });
    }
    return trends;
  }
};

export default driverService;