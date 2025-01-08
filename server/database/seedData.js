const generateDummyData = (userIds) => {
    // Assuming userIds is an array of MongoDB ObjectIds for user1@gmail.com, user2@gmail.com, etc.

    // Activities
    const activities = [];
    const activityTypes = ['running', 'walking', 'cycling', 'swimming', 'weightlifting', 'yoga'];

    userIds.forEach(userId => {
        // Generate activities for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Add 1-3 activities per day
            const numActivities = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numActivities; j++) {
                const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                const duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes

                let activity = {
                    user: userId,
                    type,
                    duration,
                    calories: Math.floor(Math.random() * 400) + 100, // 100-500 calories
                    date,
                    notes: `${type} session #${j + 1} for the day`
                };

                // Add activity-specific data
                if (type === 'running' || type === 'cycling' || type === 'walking') {
                    activity.distance = Number((Math.random() * 10 + 2).toFixed(2)); // 2-12 km
                    activity.pace = Number((duration / activity.distance).toFixed(2));
                } else if (type === 'weightlifting') {
                    activity.sets = [
                        {
                            exercise: 'Bench Press',
                            weight: Math.floor(Math.random() * 40) + 40, // 40-80kg
                            reps: Math.floor(Math.random() * 5) + 8 // 8-12 reps
                        },
                        {
                            exercise: 'Squats',
                            weight: Math.floor(Math.random() * 60) + 60, // 60-120kg
                            reps: Math.floor(Math.random() * 5) + 8
                        },
                        {
                            exercise: 'Deadlift',
                            weight: Math.floor(Math.random() * 80) + 60, // 60-140kg
                            reps: Math.floor(Math.random() * 5) + 6 // 6-10 reps
                        }
                    ];
                }

                activities.push(activity);
            }
        }
    });

    // Meals
    const meals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const foodItems = [
        { name: 'Chicken Breast', protein: 25, carbs: 0, fat: 3, calories: 165 },
        { name: 'Brown Rice', protein: 5, carbs: 45, fat: 2, calories: 216 },
        { name: 'Salmon', protein: 22, carbs: 0, fat: 13, calories: 208 },
        { name: 'Sweet Potato', protein: 2, carbs: 27, fat: 0, calories: 103 },
        { name: 'Greek Yogurt', protein: 17, carbs: 6, fat: 0, calories: 100 },
        { name: 'Banana', protein: 1, carbs: 27, fat: 0, calories: 105 },
        { name: 'Almonds', protein: 6, carbs: 6, fat: 14, calories: 164 },
        { name: 'Eggs', protein: 6, carbs: 0, fat: 5, calories: 70 }
    ];

    userIds.forEach(userId => {
        // Generate meals for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Add 3-5 meals per day
            const numMeals = Math.floor(Math.random() * 3) + 3;

            for (let j = 0; j < numMeals; j++) {
                const type = mealTypes[Math.floor(Math.random() * mealTypes.length)];
                const numFoods = Math.floor(Math.random() * 3) + 1;
                const foods = [];

                for (let k = 0; k < numFoods; k++) {
                    const food = foodItems[Math.floor(Math.random() * foodItems.length)];
                    const quantity = Math.floor(Math.random() * 2) + 1; // 1-3 servings

                    foods.push({
                        name: food.name,
                        quantity,
                        unit: 'serving',
                        calories: food.calories * quantity,
                        protein: food.protein * quantity,
                        carbs: food.carbs * quantity,
                        fat: food.fat * quantity
                    });
                }

                const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
                const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
                const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
                const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);

                meals.push({
                    user: userId,
                    name: `${type} #${j + 1}`,
                    type,
                    foods,
                    totalCalories,
                    totalProtein,
                    totalCarbs,
                    totalFat,
                    date,
                    notes: `Regular ${type}`
                });
            }
        }
    });

    // Friendships (each user is friends with the next user in sequence)
    const friendships = [];
    for (let i = 0; i < userIds.length - 1; i++) {
        friendships.push({
            requester: userIds[i],
            recipient: userIds[i + 1],
            status: 'accepted'
        });
    }

    // Points and badges
    const points = userIds.map(userId => ({
        user: userId,
        total: Math.floor(Math.random() * 1000) + 500, // 500-1500 points
        history: [
            {
                amount: 50,
                reason: 'Completed workout streak',
                date: new Date()
            },
            {
                amount: 30,
                reason: 'Logged meals consistently',
                date: new Date()
            }
        ]
    }));

    const badges = [];
    const badgeTypes = [
        { name: 'Workout Warrior', type: 'workout', description: 'Completed 10 workouts' },
        { name: 'Nutrition Master', type: 'nutrition', description: 'Logged meals for 7 days straight' },
        { name: 'Social Butterfly', type: 'social', description: 'Made 3 fitness friends' },
        { name: 'Goal Crusher', type: 'challenge', description: 'Completed first fitness challenge' }
    ];

    userIds.forEach(userId => {
        // Give each user 2-4 random badges
        const numBadges = Math.floor(Math.random() * 3) + 2;
        const userBadges = [...badgeTypes]
            .sort(() => 0.5 - Math.random())
            .slice(0, numBadges)
            .map(badge => ({
                user: userId,
                ...badge,
                earnedAt: new Date()
            }));

        badges.push(...userBadges);
    });

    return {
        activities,
        meals,
        friendships,
        points,
        badges
    };
};

module.exports = { generateDummyData };