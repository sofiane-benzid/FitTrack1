import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import QrScanner from 'qr-scanner';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../../../server/config/env';

// QR Code Generator Component
export const QRCodeGenerator = ({ userId }) => {
    const [showQR, setShowQR] = useState(false);
    const qrValue = `${API_BASE_URL}/social/add-friend/${userId}`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-black/40 rounded-lg border border-orange-500/20"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQR(!showQR)}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 
                   text-white rounded-lg mb-4"
            >
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </motion.button>

            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="p-4 bg-white rounded-lg">
                            <QRCodeSVG
                                value={qrValue}
                                size={200}
                                level="H"
                                className="rounded-lg"
                            />
                        </div>
                        <p className="mt-2 text-sm text-orange-200">
                            Scan this code to add me as a friend
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// QR Code Scanner Component
export const QRCodeScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = React.useRef(null);

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);
            const scanner = new QrScanner(
                videoRef.current,
                result => {
                    const url = result.data;
                    const userId = url.split('/').pop();
                    onScan(userId);
                    stopScanning();
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );
            await scanner.start();
            return () => scanner.stop();
        } catch {
            setError('Failed to start camera. Please make sure you have granted camera permissions.');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={stopScanning}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-black/90 p-6 rounded-xl border border-orange-500/20 max-w-sm w-full mx-4"
            >
                <h2 className="text-xl font-bold text-white mb-4">Scan QR Code</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopScanning}
                        className="px-4 py-2 bg-black/40 text-white rounded-lg border border-orange-500/20"
                    >
                        Cancel
                    </motion.button>
                    {!isScanning && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startScanning}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                        >
                            Start Scanning
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

QRCodeGenerator.propTypes = {
    userId: PropTypes.string.isRequired
};

QRCodeScanner.propTypes = {
    onScan: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};