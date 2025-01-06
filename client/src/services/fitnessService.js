const API_URL = 'http://localhost:5000/activity';

export const fitnessService = {
  async logActivity(activityData) {
    const response = await fetch(`${API_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(activityData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to log activity');
    }
    
    return response.json();
  },

  async getActivities(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_URL}/list?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    return response.json();
  },

  async getActivitySummary() {
    const response = await fetch(
      `${API_URL}/summary`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity summary');
    }
    
    return response.json();
  }
};