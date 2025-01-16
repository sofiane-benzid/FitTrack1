import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const ThemedDatePicker = ({ selectedDate, onDateChange, minDate }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
        selectedDate ? new Date(selectedDate) : new Date()
    );
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const startDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        onDateChange(newDate.toISOString().split('T')[0]);
        setShowCalendar(false);
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const startDay = startDayOfMonth(currentMonth);
        const minimumDate = minDate ? new Date(minDate) : new Date();
        minimumDate.setHours(0, 0, 0, 0);

        // Add empty cells for days before the start of the month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8" />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
            );
            const isDisabled = date < minimumDate;
            const isSelected = selectedDate &&
                new Date(selectedDate).toDateString() === date.toDateString();

            days.push(
                <motion.button
                    key={day}
                    whileHover={!isDisabled ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isDisabled
                            ? 'text-gray-600 cursor-not-allowed'
                            : isSelected
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                : 'text-orange-200 hover:bg-orange-500/20'
                        }
          `}
                    disabled={isDisabled}
                >
                    {day}
                </motion.button>
            );
        }

        return days;
    };

    return (
        <div className="relative">
            <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-black/20 border border-orange-500/20 rounded-lg px-4 py-2 text-white cursor-pointer"
            >
                {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </div>

            <AnimatePresence>
                {showCalendar && (
                    <motion.div
                        ref={calendarRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 mt-2 w-full bg-black/95 border border-orange-500/20 rounded-lg p-4 shadow-xl"
                    >
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={prevMonth}
                                className="p-1 rounded-full hover:bg-orange-500/20"
                            >
                                <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>

                            <span className="text-orange-200 font-medium">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={nextMonth}
                                className="p-1 rounded-full hover:bg-orange-500/20"
                            >
                                <svg className="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="h-8 flex items-center justify-center text-orange-200/50 text-sm">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendarDays()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ThemedDatePicker.propTypes = {
    selectedDate: PropTypes.string,
    onDateChange: PropTypes.func.isRequired,
    minDate: PropTypes.string
};

export default ThemedDatePicker;