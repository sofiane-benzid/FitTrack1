import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';

const SharedActivities = ({ partnerId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const fetchSharedActivities = async () => {
            try {
                const response = await fetch(`http://localhost:5000/activity/shared/${partnerId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                if (!response.ok) throw new Error('Failed to fetch shared activities');
                const data = await response.json();
                setActivities(data);
            } catch (err) {
                console.error('Error fetching shared activities:', err);
                setFeedback({
                    type: 'error',
                    message: 'Failed to load shared activities'
                });
            } finally {
                setLoading(false);
            }
        };
        if (partnerId) {
            fetchSharedActivities();
        }
    }, [partnerId]);

    

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 p-6 rounded-xl border border-orange-500/20"
        >
            <AnimatePresence>
                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}
            </AnimatePresence>

            <h3 className="text-lg font-medium text-white mb-4">Shared Activities</h3>
            
            {activities.length > 0 ? (
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                                opacity: 1, 
                                x: 0,
                                transition: { delay: index * 0.1 }
                            }}
                            className="bg-black/40 p-4 rounded-lg border border-orange-500/10"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-orange-400 font-medium">
                                        {activity.type}
                                    </span>
                                    <span className="text-white mx-2">•</span>
                                    <span className="text-orange-200/70">
                                        {activity.duration} minutes
                                    </span>
                                    {activity.distance && (
                                        <>
                                            <span className="text-white mx-2">•</span>
                                            <span className="text-orange-200/70">
                                                {activity.distance}km
                                            </span>
                                        </>
                                    )}
                                </div>
                                <span className="text-orange-200/70 text-sm">
                                    {new Date(activity.date).toLocaleDateString()}
                                </span>
                            </div>
                            {activity.notes && (
                                <p className="mt-2 text-orange-200/70 text-sm">
                                    {activity.notes}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-orange-200/70 py-4">
                    No shared activities yet
                </p>
            )}
        </motion.div>
    );
};
SharedActivities.propTypes = {
    partnerId: PropTypes.string.isRequired,
};

export default SharedActivities;