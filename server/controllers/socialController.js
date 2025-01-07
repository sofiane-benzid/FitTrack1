const { Friendship, Challenge } = require('../models/Social');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

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



exports.createChallenge = async (req, res) => {
  try {
    const { title, description, target, endDate, participantIds } = req.body;

    // Verify all participants exist and are friends
    const friendships = await Friendship.find({
      $or: [
        { requester: req.userId },
        { recipient: req.userId }
      ],
      status: 'accepted'
    });

    const friendIds = friendships.map(f => 
      f.requester.toString() === req.userId ? f.recipient.toString() : f.requester.toString()
    );

    const invalidParticipants = participantIds.filter(id => !friendIds.includes(id));
    if (invalidParticipants.length > 0) {
      return res.status(400).json({ message: 'Some participants are not in your friends list' });
    }

    const challenge = new Challenge({
      creator: req.userId,
      title,
      description,
      target,
      endDate,
      participants: [
        { user: req.userId },
        ...participantIds.map(id => ({ user: id }))
      ]
    });

    await challenge.save();

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create challenge',
      error: error.message
    });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.userId,
      status: 'active'
    }).populate('creator participants.user', 'email profile.fullName');

    res.json(challenges);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get challenges',
      error: error.message
    });
  }
};