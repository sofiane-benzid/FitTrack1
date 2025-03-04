// Mock authentication data
const mockUser = {
    id: 'user123',
    email: 'demo@example.com',
    profile: {
        fullName: 'Demo User',
        age: 28,
        weight: 75,
        height: 180,
        fitnessLevel: 'intermediate'
    },
    fitness: {
        statistics: {
            totalWorkouts: 24,
            totalMinutes: 1320,
            totalCalories: 12500,
            workoutStreak: 3
        }
    }
};

// Mock authentication service
export const authService = {
    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    resolve({
                        token: 'mock-token-xyz',
                        user: mockUser
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 800); // Simulate network delay
        });
    },

    logout: async () => {
        return new Promise((resolve) => {
            setTimeout(resolve, 300);
        });
    }
};

// Mock activities for dashboard
export const activityService = {
    getRecentActivities: async () => {
        return [
            {
                id: 1,
                name: 'Morning Run',
                time: '2 hours ago',
                color: 'bg-red-500',
                highlight: true,
                stats: '5.2 km'
            },
            {
                id: 2,
                name: 'Weight Training',
                time: 'Yesterday',
                color: 'bg-orange-500',
                stats: '320 calories'
            },
            {
                id: 3,
                name: 'Yoga Session',
                time: '2 days ago',
                color: 'bg-red-500',
                stats: '45 minutes'
            }
        ];
    }
};