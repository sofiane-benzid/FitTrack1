const { Friendship, Challenge } = require('../models/Social');
const User = require('../models/User');
const Badge = require('../models/Gamification').Badge;
const Activity = require('../models/Activity');
const { createNotification } = require('./notificationController');
const gamificationController = require('./gamificationController');

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    let query = { _id: { $ne: req.userId } }; // Always exclude current user

    // Add search criteria if search term is provided
    if (q) {
      query.$or = [
        { email: { $regex: q, $options: 'i' } },
        { 'profile.fullName': { $regex: q, $options: 'i' } }
      ];
    }

    // Find users
    const users = await User.find(query).select('email profile.fullName');

    // Get current user's friends and pending requests
    const friendships = await Friendship.find({
      $or: [
        { requester: req.userId },
        { recipient: req.userId }
      ]
    });

    // Get IDs of users to exclude (friends and pending requests)
    const excludeIds = friendships.map(f => 
      f.requester.toString() === req.userId.toString() ? f.recipient.toString() : f.requester.toString()
    );

    // Filter out users who are already friends or have pending requests
    const filteredUsers = users
      .filter(user => !excludeIds.includes(user._id.toString()))
      .map(user => ({
        _id: user._id,
        email: user.email,
        fullName: user.profile?.fullName || 'No name set'
      }));

    res.json(filteredUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      message: 'Failed to search users',
      error: error.message 
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // Get basic user info using existing model structure
    const user = await User.findById(req.params.userId)
      .select('email profile fitness')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's badges
    const badges = await Badge.find({ user: req.params.userId })
      .sort({ earnedAt: -1 })
      .lean();

    // Get recent activities
    const activities = await Activity.find({ 
      user: req.params.userId 
    })
    .sort({ date: -1 })
    .limit(10)
    .lean();

    // Format response using existing data structure
    const response = {
      email: user.email,
      fullName: user.profile?.fullName || 'No name set',
      profile: {
        ...user.profile,
        fitnessLevel: user.profile?.fitnessLevel || 'beginner',
        fitnessGoals: user.profile?.fitnessGoals || []
      },
      stats: {
        totalWorkouts: user.fitness?.statistics?.totalWorkouts || 0,
        workoutStreak: user.fitness?.statistics?.workoutStreak || 0,
        totalMinutes: user.fitness?.statistics?.totalMinutes || 0,
        totalCalories: user.fitness?.statistics?.totalCalories || 0
      },
      badges,
      recentActivities: activities.map(activity => ({
        type: activity.type,
        duration: activity.duration,
        date: activity.date,
        calories: activity.calories,
        distance: activity.distance
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: req.userId, recipient: recipientId },
        { requester: recipientId, recipient: req.userId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship request already exists' });
    }

    const requester = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const friendship = new Friendship({
      requester: req.userId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendship.save();

    // Create notification for the recipient
    await createNotification({
      recipient: recipientId,
      type: 'friend_request',
      message: `${requester.profile?.fullName || requester.email} sent you a friend request`,
      relatedUser: req.userId
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendship
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      message: 'Failed to send friend request',
      error: error.message
    });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const friendships = await Friendship.find({
      $or: [
        { requester: req.userId },
        { recipient: req.userId }
      ],
      status: 'accepted'
    }).populate('requester recipient', 'email profile.fullName');

    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === req.userId.toString() 
        ? friendship.recipient 
        : friendship.requester;
      return {
        _id: friend._id,
        email: friend.email,
        fullName: friend.profile?.fullName || 'No name set'
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({
      message: 'Failed to get friends',
      error: error.message
    });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { accept } = req.body;

    const friendship = await Friendship.findOneAndUpdate(
      {
        _id: friendshipId,
        recipient: req.userId,
        status: 'pending'
      },
      {
        status: accept ? 'accepted' : 'declined'
      },
      { new: true }
    ).populate('requester recipient', 'email profile.fullName');

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (accept) {
      // Check for new achievements after accepting friend
      await gamificationController.checkAchievements(req.userId, 'friend');
    }

    // Create notification for the requester
    const message = accept ? 'accepted your friend request' : 'declined your friend request';
    await createNotification({
      recipient: friendship.requester._id,
      type: accept ? 'friend_accepted' : 'friend_declined',
      message: `${friendship.recipient.profile?.fullName || friendship.recipient.email} ${message}`,
      relatedUser: friendship.recipient._id
    });

    res.json({
      message: `Friend request ${accept ? 'accepted' : 'declined'} successfully`,
      friendship
    });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({
      message: 'Failed to respond to friend request',
      error: error.message
    });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    // Get received requests
    const receivedRequests = await Friendship.find({
      recipient: req.userId,
      status: 'pending'
    }).populate('requester', 'email profile.fullName');

    // Get sent requests
    const sentRequests = await Friendship.find({
      requester: req.userId,
      status: 'pending'
    }).populate('recipient', 'email profile.fullName');

    res.json({
      received: receivedRequests,
      sent: sentRequests
    });
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({
      message: 'Failed to get friend requests',
      error: error.message
    });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await Friendship.findOneAndDelete({
      _id: requestId,
      requester: req.userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.json({ message: 'Friend request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({
      message: 'Failed to cancel friend request',
      error: error.message
    });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { requester: req.userId, recipient: friendId },
        { requester: friendId, recipient: req.userId }
      ],
      status: 'accepted'
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Create notification for the removed friend
    await createNotification({
      recipient: friendId,
      type: 'friend_removed',
      message: 'A user has removed you from their friends list'
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      message: 'Failed to remove friend',
      error: error.message
    });
  }
};




exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      $or: [
        { creator: req.userId },
        { 'participants.user': req.userId },
        { endDate: { $gte: new Date() } }
      ]
    }).populate('creator', 'profile.fullName email')
      .populate('participants.user', 'profile.fullName email')
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, type, target, endDate } = req.body;
    
    const challenge = new Challenge({
      title,
      description,
      type,
      target: Number(target),
      creator: req.userId,
      endDate: new Date(endDate),
      participants: [{ 
        user: req.userId,
        progress: 0,
        completed: false
      }]
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Validate challengeId
    if (!challengeId) {
      return res.status(400).json({ message: 'Challenge ID is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if challenge is still active
    if (challenge.status !== 'active') {
      return res.status(400).json({ message: 'This challenge is no longer active' });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = challenge.participants.some(
      p => p.user.toString() === req.userId
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ message: 'Already participating in this challenge' });
    }

    // Add user to participants
    challenge.participants.push({
      user: req.userId,
      progress: 0,
      completed: false,
      joinedAt: new Date()
    });

    await challenge.save();

    // Award points for joining a challenge
    try {
      await gamificationController.awardPoints(req.userId, 'join_challenge');
    } catch (pointsError) {
      console.error('Error awarding points for joining challenge:', pointsError);
      // Continue even if points award fails
    }

    // Return populated challenge data
    const updatedChallenge = await Challenge.findById(challengeId)
      .populate('creator', 'profile.fullName email')
      .populate('participants.user', 'profile.fullName email');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Failed to join challenge' });
  }
};

exports.updateChallengeProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    // Ensure progress is a valid number
    const newProgress = parseInt(progress);
    if (isNaN(newProgress)) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }

    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      'participants.user': req.userId
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found or not participating' });
    }

    const participant = challenge.participants.find(p => 
      p.user.toString() === req.userId
    );

    const oldProgress = participant.progress || 0;
    const wasCompleted = participant.completed;
    const isNowCompleted = newProgress >= challenge.target;

    // Update progress
    const updatedChallenge = await Challenge.findOneAndUpdate(
      {
        _id: req.params.challengeId,
        'participants.user': req.userId
      },
      {
        $set: {
          'participants.$.progress': newProgress,
          'participants.$.completed': isNowCompleted
        }
      },
      { new: true }
    );

    // Award points for progress
    if (newProgress > oldProgress) {
      try {
        // Base points for progress
        await gamificationController.awardPoints(
          req.userId, 
          'challenge_progress'
        );

        // If challenge completed, award bonus points
        if (!wasCompleted && isNowCompleted) {
          await gamificationController.awardPoints(
            req.userId,
            'challenge_complete'
          );

          // Create notification for challenge completion
          await createNotification({
            recipient: req.userId,
            type: 'challenge_completed',
            message: `Congratulations! You've completed the "${challenge.title}" challenge!`
          });
        }
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Continue execution even if points award fails
      }
    }

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ message: error.message });
  }
};