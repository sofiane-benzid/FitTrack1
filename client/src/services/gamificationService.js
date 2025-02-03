import { API_BASE_URL } from "../../../server/config/env";

const BASE_URL = `${API_BASE_URL}/gamification`;

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const gamificationService = {
  async getPoints() {
    const response = await fetch(`${BASE_URL}/points`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch points');
    return response.json();
  },

  async getBadges() {
    const response = await fetch(`${BASE_URL}/badges`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch badges');
    return response.json();
  },

  async getLeaderboard() {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }
};