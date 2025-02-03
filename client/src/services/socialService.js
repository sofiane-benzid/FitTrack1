import { API_BASE_URL } from "../../../server/config/env";

const BASE_URL = `${API_BASE_URL}/social`;

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const socialService = {
  // Friends
  async getFriends() {
    const response = await fetch(`${BASE_URL}/friends`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch friends');
    return response.json();
  },

  async sendFriendRequest(recipientId) {
    const response = await fetch(`${BASE_URL}/friends/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientId })
    });
    if (!response.ok) throw new Error('Failed to send friend request');
    return response.json();
  },

  async respondToFriendRequest(requestId, accept) {
    const response = await fetch(`${BASE_URL}/friends/respond/${requestId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accept })
    });
    if (!response.ok) throw new Error('Failed to respond to friend request');
    return response.json();
  },

  // Messages
  async sendMessage(recipientId, content) {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientId, content })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getMessages() {
    const response = await fetch(`${BASE_URL}/messages`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async markMessageAsRead(messageId) {
    const response = await fetch(`${BASE_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return response.json();
  },

  // User Profiles
  async getUserProfile(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}/profile`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  // Search and Other Existing Methods
  async searchUsers(searchTerm) {
    const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(searchTerm)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
  },

  // Friend Requests
  async getFriendRequests() {
    const response = await fetch(`${BASE_URL}/friends/requests`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch friend requests');
    return response.json();
  },

  async cancelFriendRequest(requestId) {
    const response = await fetch(`${BASE_URL}/friends/request/${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to cancel friend request');
    return response.json();
  },

  async removeFriend(friendId) {
    const response = await fetch(`${BASE_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to remove friend');
    return response.json();
  },

  // Notifications
  async getNotifications() {
    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markNotificationAsRead(notificationId) {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  async markAllNotificationsAsRead() {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  },

  async deleteNotification(notificationId) {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  },

  // Challenges
  async getChallenges() {
    const response = await fetch(`${BASE_URL}/challenges`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch challenges');
    return response.json();
  },

  async createChallenge(challengeData) {
    const response = await fetch(`${BASE_URL}/challenges`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(challengeData)
    });
    if (!response.ok) throw new Error('Failed to create challenge');
    return response.json();
  }
};