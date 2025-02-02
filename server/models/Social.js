const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, { timestamps: true });

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['workout', 'nutrition', 'social'],
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, { timestamps: true });


// Message Schema for Chat
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'activity_share', 'workout_reminder'],
    default: 'text'
  },
  relatedActivity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }]
}, { timestamps: true });

// Chat Room Schema
const ChatRoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'workout_partners', 'group'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  name: String,
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'activity_share', 'workout_reminder'],
      default: 'text'
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: Date
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Workout Partnership Schema
const WorkoutPartnershipSchema = new mongoose.Schema({
  partners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active'
  },
  achievements: [{
    type: String,
    date: Date,
    description: String
  }],
  stats: {
    workoutsTogether: Number,
    totalMinutes: Number,
    streakDays: Number
  },
  sharedGoals: [{
    title: String,
    description: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  reminderPreferences: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    customDays: [String],
    time: String
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom'
  }
}, { timestamps: true });
// Activity Comment Schema (Extension to existing Activity model)
const ActivityCommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'encouragement', 'advice'],
    default: 'comment'
  }
}, { timestamps: true });


module.exports = {
  Friendship: mongoose.model('Friendship', FriendshipSchema),
  Challenge: mongoose.model('Challenge', ChallengeSchema),
  ChatRoom: mongoose.model('ChatRoom', ChatRoomSchema),
  WorkoutPartnership: mongoose.model('WorkoutPartnership', WorkoutPartnershipSchema),
  ActivityComment: mongoose.model('ActivityComment', ActivityCommentSchema)
};