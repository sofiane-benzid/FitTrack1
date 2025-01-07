import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, showBack = true, previousPage = -1 }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center mb-6 space-x-4">
            {showBack && (
                <button
                    onClick={() => navigate(previousPage)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    showBack: PropTypes.bool,
    previousPage: PropTypes.oneOfType([
        PropTypes.number, 
        PropTypes.string
    ])
};

export default PageHeader;