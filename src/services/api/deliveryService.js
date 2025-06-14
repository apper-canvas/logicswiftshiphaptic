import deliveriesData from '../mockData/deliveries.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let deliveries = [...deliveriesData];

const deliveryService = {
  async getAll() {
    await delay(300);
    return [...deliveries];
  },

  async getById(id) {
    await delay(200);
    const delivery = deliveries.find(d => d.id === id);
    return delivery ? { ...delivery } : null;
  },

  async create(deliveryData) {
    await delay(400);
    const newDelivery = {
      ...deliveryData,
      id: Date.now().toString(),
      trackingId: `SW${Date.now().toString().slice(-6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    };
    deliveries.unshift(newDelivery);
    return { ...newDelivery };
  },

  async update(id, updates) {
    await delay(250);
    const index = deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      deliveries[index] = { ...deliveries[index], ...updates };
      return { ...deliveries[index] };
    }
    throw new Error('Delivery not found');
  },

  async delete(id) {
    await delay(200);
    const index = deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      deliveries.splice(index, 1);
      return true;
    }
    throw new Error('Delivery not found');
  },

  async assignDriver(deliveryId, driverId) {
    await delay(300);
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      delivery.driverId = driverId;
      delivery.status = 'assigned';
      return { ...delivery };
    }
    throw new Error('Delivery not found');
  },

  async updateStatus(id, status, proofData = null) {
    await delay(200);
    const delivery = deliveries.find(d => d.id === id);
    if (delivery) {
      delivery.status = status;
      if (proofData) {
        delivery.signature = proofData.signature;
        delivery.proofPhoto = proofData.photo;
      }
      return { ...delivery };
    }
    throw new Error('Delivery not found');
  }
};

export default deliveryService;