"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

export default function FirebaseStatus() {
    const [isConfigured, setIsConfigured] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const checkFirebaseConfig = () => {
            const hasValidConfig =
                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project' &&
                process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
                process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo_api_key';

            setIsConfigured(!!hasValidConfig);
        };

        checkFirebaseConfig();
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-lg shadow-lg cursor-pointer ${isConfigured
                        ? 'bg-green-100 border border-green-200'
                        : 'bg-yellow-100 border border-yellow-200'
                    }`}
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="flex items-center space-x-2">
                    {isConfigured ? (
                        <CheckCircle className="text-green-600" size={20} />
                    ) : (
                        <AlertCircle className="text-yellow-600" size={20} />
                    )}
                    <span className={`text-sm font-medium ${isConfigured ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                        {isConfigured ? 'Firebase Connected' : 'Demo Mode'}
                    </span>
                    <Settings className={`${isConfigured ? 'text-green-600' : 'text-yellow-600'
                        }`} size={16} />
                </div>

                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-gray-200"
                    >
                        <div className="text-xs space-y-1">
                            {isConfigured ? (
                                <>
                                    <p className="text-green-700">✅ Firebase Authentication</p>
                                    <p className="text-green-700">✅ Firestore Database</p>
                                    <p className="text-green-700">✅ Production Ready</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-yellow-700">⚠️ Using Mock Authentication</p>
                                    <p className="text-yellow-700">⚠️ No Database Persistence</p>
                                    <p className="text-yellow-700">ℹ️ See FIREBASE_COMPLETE_SETUP.md</p>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}