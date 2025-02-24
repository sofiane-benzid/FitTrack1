import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import QrScanner from 'qr-scanner';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../../../server/config/env';

// Debug logs helper component
const DebugLogs = ({ logs }) => (
    <div className="text-xs font-mono bg-black/90 text-orange-200 p-2 max-h-32 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
            <div key={i} className="border-b border-orange-500/20 py-1">
                {new Date(log.time).toLocaleTimeString()}: {log.message}
            </div>
        ))}
    </div>
);

DebugLogs.propTypes = {
    logs: PropTypes.arrayOf(PropTypes.shape({
        time: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired
    })).isRequired
};

// QR Code Generator
export const QRCodeGenerator = ({ userId }) => {
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const friendLink = `${API_BASE_URL}/social/add-friend/${userId}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(friendLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="p-4 bg-black/40 rounded-lg border border-orange-500/20">
            <div className="flex flex-col gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowQR(!showQR)}
                    className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                >
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyLink}
                    className="relative w-full py-2 bg-black/40 text-white rounded-lg border border-orange-500/20"
                >
                    {copied ? 'Copied!' : 'Copy Friend Link'}
                    {copied && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-green-500/20 rounded-lg"
                        />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center mt-4"
                    >
                        <div className="p-4 bg-white rounded-lg">
                            <QRCodeSVG
                                value={friendLink}
                                size={200}
                                level="H"
                                includeMargin
                                className="rounded-lg"
                            />
                        </div>
                        <p className="mt-2 text-sm text-orange-200">
                            Scan this code to add me as a friend
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

QRCodeGenerator.propTypes = {
    userId: PropTypes.string.isRequired
};

// QR Code Scanner
export const QRCodeScanner = ({ onScan, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [showDebug, setShowDebug] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [feedback, setFeedback] = useState(null);
    const videoRef = React.useRef(null);
    const scannerRef = React.useRef(null);

    const addLog = (message) => {
        setLogs(logs => [...logs, { time: Date.now(), message }].slice(-50));
    };

    useEffect(() => {
        addLog('Initializing...');
        checkEnvironment();

        return () => {
            if (scannerRef.current) {
                addLog('Cleaning up scanner');
                scannerRef.current.stop();
            }
        };
    }, []);

    const checkEnvironment = () => {
        addLog('Checking environment...');

        // Check if we're in a secure context
        if (!window.isSecureContext) {
            addLog('Not in secure context - camera unavailable');
            setError(
                'Camera access requires HTTPS.\nOptions:\n' +
                '1. Use localhost instead of IP\n' +
                '2. Enable HTTPS\n' +
                '3. Enter friend code manually'
            );
            return;
        }

        // Check camera support
        if (!navigator.mediaDevices?.getUserMedia) {
            addLog('Camera API not supported');
            setError('Camera not supported in this browser. Please enter friend code manually.');
            return;
        }

        addLog('Environment check passed');
    };

    const startScanner = async () => {
        try {
            addLog('Requesting camera...');

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', true);

                scannerRef.current = new QrScanner(
                    videoRef.current,
                    result => {
                        addLog('QR code detected');
                        const userId = result.data.split('/').pop();
                        onScan(userId);
                    },
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true
                    }
                );

                await scannerRef.current.start();
                setIsScanning(true);
                addLog('Scanner started');
            }
        } catch (err) {
            addLog(`Camera error: ${err.message}`);
            setError('Failed to access camera. Please try manual input.');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualCode.trim()) {
            setFeedback({
                type: 'error',
                message: 'Please enter a friend code'
            });
            return;
        }

        onScan(manualCode.trim());
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-black/90 p-6 rounded-xl border border-orange-500/20 w-full max-w-sm mx-4"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Add Friend</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="p-2 text-orange-500 hover:text-orange-400"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 whitespace-pre-line">
                        {error}
                    </div>
                )}

                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="mb-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-orange-200 mb-1">
                            Friend Code
                        </label>
                        <input
                            type="text"
                            value={manualCode}
                            onChange={e => setManualCode(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-orange-500/20 rounded-lg text-white placeholder-gray-500 focus:border-orange-500"
                            placeholder="Enter friend code..."
                        />
                    </div>

                    {feedback && (
                        <div className={`p-3 rounded-lg border ${feedback.type === 'error'
                                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                : 'bg-green-500/20 border-green-500/40 text-green-400'
                            }`}>
                            {feedback.message}
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                    >
                        Add Friend
                    </motion.button>
                </form>

                {/* Camera Section */}
                {window.isSecureContext && !error && (
                    <>
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-black/40">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            {!isScanning ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <span className="text-orange-200">Camera preview</span>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-orange-500 animate-pulse" />
                                </div>
                            )}
                        </div>

                        {!isScanning && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startScanner}
                                className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                            >
                                Start Scanner
                            </motion.button>
                        )}
                    </>
                )}

                {/* Debug Logs */}
                <AnimatePresence>
                    {showDebug && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 overflow-hidden"
                        >
                            <DebugLogs logs={logs} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

QRCodeScanner.propTypes = {
    onScan: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default { QRCodeGenerator, QRCodeScanner };