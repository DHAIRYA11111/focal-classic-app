// eslint-disable-next-line no-undef
/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect, useCallback } from 'react';

// We keep the Firebase imports here for future integration, but they are mocked below.
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    initializeApp
} from 'firebase/app';
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot,
    collection,
    query,
    where,
    updateDoc,
    addDoc,
    Timestamp,
    getDocs,
    serverTimestamp,
    orderBy, // Added for message sorting
    limit, // Added for message limit
} from 'firebase/firestore';

// --- Icon Imports (Inline SVG for simplicity) ---
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Connect = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.74 1.74"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const Mail = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const Heart = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const Sparkle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12h2"/><path d="M12 20v2"/><path d="M12 2h0.01"/><path d="m20 20-1.4-1.4"/><path d="m4 4 1.4 1.4"/><path d="M21 15.5H16.5L15 21l-3.5-3.5L8 21l-1.5-5.5H2l3.5-3.5L2 8l5.5-1.5L8 2l3.5 3.5L15 2l1.5 5.5H21l-3.5 3.5L21 15.5z"/></svg>;
const Settings = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Trophy = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M12 15V9"/><path d="M12 20a6 6 0 0 0-6-6v-3a6 6 0 1 0 12 0v3a6 6 0 0 0-6 6z"/></svg>;
const Search = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const Fire = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5a2.5 2.5 0 0 0 0-5C6.5 7 5 3.5 5 3.5c.378 1.5 1.5 3 2.5 4.5 1.5 2.5 4 2.5 4 2.5v12c0 .5.25 1 .5 1s.5-.5.5-1v-2"/><path d="M16 17c0 1.5-2.5 3-5 3s-5-1.5-5-3c0-.5.25-1 .5-1s.5.5.5 1"/></svg>;
const Check = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const Edit = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const Send = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M15 9l-6 6"/></svg>;

// --- Constants ---
const TABS = {
    PROFILE: 'profile',
    CONNECT: 'connect',
    LEADERBOARD: 'leaderboard',
    MESSAGES: 'messages',
    SETTINGS: 'settings',
};

const INITIAL_PROFILE = {
    id: 'local_user_id',
    name: "Campus User",
    major: "Computer Science",
    year: "4th Year",
    bio: "Future-focused engineer building the next big campus platform.",
    focalScore: 100,
    meritBreakdown: {
        academics: 50,
        internships: 20,
        projects: 30,
    },
    isDatingEnabled: false,
    profileViews: 124,
    likesCount: 35,
    profileImage: "https://placehold.co/800x450/171717/d4d4d4?text=USER+PROFILE",
};

// Mock data for profiles (Sorted by score descending for leaderboard)
const mockProfiles = [
    { id: 'user4', name: "Ben Carter", score: 250, major: "Aerospace Eng.", year: "4th Year", likes: ["Chess", "3D Printing"], dislikes: ["Networking events"], location: "Tech Lab", profileImage: "https://placehold.co/100x100/171717/d4d4d4?text=BC" },
    { id: 'user2', name: "Alex Chen", score: 210, major: "Business Analyst", year: "4th Year", likes: ["Basketball", "Startups", "Data Science"], dislikes: ["Long meetings", "Waiting in line"], location: "Off-Campus Apartment", profileImage: "https://placehold.co/100x100/171717/d4d4d4?text=AC" },
    { id: 'user6', name: "David Kim", score: 195, major: "Data Science", year: "Grad Student", likes: ["Big data", "Podcasts"], dislikes: ["Slow internet"], location: "Library Annex", profileImage: "https://placehold.co/100x100/171717/d4d4d4?text=DK" },
    { id: 'user1', name: "Jane Doe", score: 185, major: "Electrical Eng.", year: "3rd Year", likes: ["Sci-Fi", "Hiking", "Vintage Film"], dislikes: ["Waking up early", "Crowds"], location: "North Wing Dorms", profileImage: "https://placehold.co/100x100/171717/d4d4d4?text=JD" },
];

// Mock message data structure (used only if Firebase fails)
const MOCK_CONVERSATIONS = [
    { id: 'chat1', recipientId: 'user2', name: 'Alex Chen', lastMessage: 'See you at the hackathon!', timestamp: new Date(Date.now() - 3600000) },
    { id: 'chat2', recipientId: 'user4', name: 'Ben Carter', lastMessage: 'Did you solve the chess puzzle?', timestamp: new Date(Date.now() - 120000) },
];
const MOCK_MESSAGES_DATA = {
    'chat1': [
        { senderId: 'user2', text: 'Hey, I saw your post about the new data course!', timestamp: new Date(Date.now() - 3600000) },
        { senderId: 'local_user_id', text: 'Oh, awesome! Are you thinking of taking it?', timestamp: new Date(Date.now() - 3500000) },
        { senderId: 'user2', text: 'Definitely. See you at the hackathon!', timestamp: new Date(Date.now() - 3400000) },
    ],
    'chat2': [
        { senderId: 'user4', text: 'Did you solve the chess puzzle?', timestamp: new Date(Date.now() - 120000) },
    ]
};

// --- GLOBAL FIREBASE INSTANCES ---
let db_instance = null;
let auth_instance = null;
let app_id_global = 'focal-app-local';

const initFirebase = () => {
    // THIS IS THE CONDITIONAL INIT LOGIC FOR LIVE/DEV
    try {
        const global_app_id = typeof __app_id !== 'undefined' ? __app_id : null;
        const global_firebase_config = typeof __firebase_config !== 'undefined' ? __firebase_config : null;

        // FIX: If running on a public domain (like GitHub Pages), skip the secure config check
        // and allow the app to initialize the Firebase services (required for onSnapshot/addDoc)
        // even if no secure keys are present. The client logic below will handle the rest.
        const isPublicDomain = window.location.hostname.includes('github.io') || window.location.hostname.includes('localhost');
        
        if (global_app_id && global_firebase_config) {
            // Live Canvas Environment
            const firebaseConfig = JSON.parse(global_firebase_config);
            const app = initializeApp(firebaseConfig);
            db_instance = getFirestore(app);
            auth_instance = getAuth(app);
            app_id_global = global_app_id;
            console.log("Firebase initialized successfully for Canvas/Live.");
        } else if (isPublicDomain) {
            // Placeholder/Public Domain Setup (Prevents crash but doesn't connect)
            // We use this block to indicate we are ready for data functions without crashing.
            throw new Error("Missing Canvas Globals - Running Mock Live.");
        } else {
            throw new Error("Missing Canvas Globals - Entering DEV MODE.");
        }
    } catch (e) {
        console.warn("Firebase init skipped. Running in mock/DEV MODE.");
    }
}


// --- Utility: Clipboard Copy (Robust for iframe environments) ---
const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    }
};


// --- Gemini API Call Functions (Simplified) ---
const exponentialBackoffFetch = async (url, options, maxRetries = 5) => {
    const apiKey = "";
    const finalUrl = `${url}?key=${apiKey}`;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(finalUrl, options);
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429 && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                const errorText = await response.text();
                throw new Error(`API call failed with status ${response.status}: ${errorText}`);
            }
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
        }
    }
};

const callGeminiAPI = async (systemPrompt, userQuery) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    const result = await exponentialBackoffFetch(apiUrl, options);
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini API returned no content.");
    }
    return text;
};


// --- Component: Merit Score Card ---
const MeritScoreCard = ({ title, score, details }) => (
    <div className="score-card card">
        <div className="score-header">
             <h3 className="score-title">{title}</h3>
        </div>
        <p className="score-value">{score}</p>
        <div className="merit-details">
            {Object.entries(details).map(([key, value]) => (
                <div key={key} className="merit-item">
                    <span className="merit-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="merit-points">{value} pts</span>
                </div>
            ))}
        </div>
    </div>
);

// --- Component: Merit Editor Modal (In Settings View) ---
const MeritEditorModal = ({ currentProfile, onSave, onClose }) => {
    const [formData, setFormData] = useState(currentProfile);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMeritChange = (category, value) => {
        const numericValue = parseInt(value) || 0;
        setFormData(prev => {
            const newMerit = { ...prev.meritBreakdown, [category]: numericValue };
            const newScore = Object.values(newMerit).reduce((sum, val) => sum + val, 0);
            return { ...prev, meritBreakdown: newMerit, focalScore: newScore };
        });
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">Edit Profile & Merit Data</h2>
                
                <div className="modal-section-group">
                    {/* General Info */}
                    <div className="modal-section">
                        <h3 className="section-title">General Info</h3>
                        <label className="input-label">Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" />
                        <label className="input-label">Major:</label>
                        <input type="text" name="major" value={formData.major} onChange={handleInputChange} className="input-field" />
                        <label className="input-label">Year:</label>
                        <input type="text" name="year" value={formData.year} onChange={handleInputChange} className="input-field" />
                        <label className="input-label">Bio:</label>
                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="input-field input-textarea" rows="3" />
                    </div>

                    {/* Merit Breakdown */}
                    <div className="modal-section">
                        <h3 className="section-title">Merit Points</h3>
                        {Object.entries(formData.meritBreakdown).map(([category, value]) => (
                            <div key={category} className="input-group">
                                <label className="input-label capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleMeritChange(category, e.target.value)}
                                    className="input-field-small"
                                    min="0"
                                />
                            </div>
                        ))}
                        <div className="merit-tip">Adjusting scores here updates your Focal Influence Score instantly.</div>
                    </div>
                </div>

                <div className="score-preview">
                    Current Focal Score: <span className="score-preview-value">{formData.focalScore}</span>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="button-secondary">Cancel</button>
                    <button onClick={handleSave} className="button-primary">Save Changes</button>
                </div>
            </div>
        </div>
    );
};


// --- Component: Profile View ---
const ProfileView = ({ profile, userId, setProfile, isDevMode, saveProfileData }) => {
    const [narrative, setNarrative] = useState(profile.bio);
    const [isLoading, setIsLoading] = useState(false);
    
    // Recalculate score logic is handled by effect in App component, used here for display
    const focalScore = profile.focalScore;

    useEffect(() => {
        const newFocalScore = Object.values(profile.meritBreakdown).reduce((sum, val) => sum + val, 0);
        if (profile.focalScore !== newFocalScore) {
            setProfile(prev => ({ ...prev, focalScore: newFocalScore }));
        }
    }, [profile.meritBreakdown, profile.focalScore, setProfile]);


    const generateNarrative = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setNarrative("Generating...");

        const meritList = Object.entries(profile.meritBreakdown)
            .map(([key, value]) => `${key}: ${value} points`)
            .join(', ');

        const systemPrompt = "You are a world-class LinkedIn profile generator. Create a concise, high-impact, single-paragraph bio (3-4 sentences max). Focus on achievements, impact, and future goals.";
        const userQuery = `Generate a professional bio for a student named ${profile.name} in ${profile.year} of ${profile.major}. Their merit breakdown is: ${meritList}. The profile should frame their merit score (${focalScore}) as a ranking of success.`;

        try {
            const result = await callGeminiAPI(systemPrompt, userQuery);
            setNarrative(result);
            setProfile(prev => ({ ...prev, bio: result }));
        } catch (e) {
            setNarrative("Narrative generation failed. Try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [focalScore, isLoading, profile.meritBreakdown, profile.major, profile.name, profile.year, setProfile]);


    return (
        <div className="view-container profile-view">

            <div className="profile-card-section">
                <div className="profile-card-image" style={{ backgroundImage: `url(${profile.profileImage})` }} onError={(e) => e.target.src = "https://placehold.co/800x450/171717/d4d4d4?text=USER+PROFILE"}>
                    <div className="profile-card-overlay">
                        <h1 className="profile-name">{profile.name}</h1>
                        <p className="profile-detail">{profile.major} - {profile.year}</p>
                        
                        <div className="profile-metrics">
                            <span className="metric-item">
                                <Fire className="icon-small metric-fire" />
                                {profile.profileViews} Views
                            </span>
                            <span className="metric-item">
                                <Heart className="icon-small metric-heart" />
                                {profile.likesCount} Likes
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card profile-bio-details">
                    <p className="profile-bio-text">{profile.bio}</p>
                </div>
            </div>
            
            <div className="profile-merit-section">
                <MeritScoreCard
                    title="Focal Influence Score"
                    score={focalScore}
                    details={profile.meritBreakdown}
                    // Edit button removed from home page as requested
                />

                <div className="card narrative-card">
                    <h2 className="card-title">Merit Narrative Assistant</h2>
                    <div className="narrative-content">
                        <p className="narrative-text">{narrative}</p>
                    </div>
                    <div className="narrative-actions">
                        <button
                            onClick={generateNarrative}
                            disabled={isLoading}
                            className="button-primary"
                        >
                            <Sparkle className="icon-small" /> {isLoading ? 'Generating...' : 'Generate New Bio'}
                        </button>
                        <button
                            onClick={() => setNarrative(profile.bio)}
                            className="button-secondary"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>

                <div className="card redemption-card">
                    <h2 className="card-title">Redemption & Growth</h2>
                    <p className="redemption-text">Logged: Failed $CS-101$ in Year 1. Subsequent performance: A in all advanced $CS$ modules. <span className="merit-bonus">+$15$ Bonus Merit Points.</span></p>
                </div>
            </div>
        </div>
    );
};

// --- Component: Connect View (Main Feed) ---
const ConnectView = ({ profile, setProfile, isDevMode }) => {
    const [datingMessage, setDatingMessage] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleDating = () => {
        setProfile(prev => ({ ...prev, isDatingEnabled: !prev.isDatingEnabled }));
    };

    const generateIcebreaker = useCallback(async (targetUser) => {
        if (isGenerating) return;

        setIsGenerating(true);
        setDatingMessage(prev => ({ ...prev, [targetUser.id]: "Drafting..." }));

        const likes = targetUser.likes.join(', ');
        const dislikes = targetUser.dislikes.join(', ');

        const systemPrompt = "You are a professional, charming, and highly effective dating icebreaker AI. Write a short, personalized, single-sentence opening message (under 15 words) based ONLY on the user's profile info. Reference a specific interest or major.";
        const userQuery = `Write an icebreaker for a ${targetUser.year} ${targetUser.major} who likes ${likes} and dislikes ${dislikes}. Start with a relevant comment/question about their interests.`;

        try {
            const result = await callGeminiAPI(systemPrompt, userQuery);
            setDatingMessage(prev => ({ ...prev, [targetUser.id]: result }));
        } catch (e) {
            setDatingMessage(prev => ({ ...prev, [targetUser.id]: "Icebreaker failed." }));
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating]);


    const handleCopy = (text) => {
        copyToClipboard(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Filter profiles based on search term
    const filteredProfiles = mockProfiles.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.major.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`view-container connect-view ${profile.isDatingEnabled ? 'dating-mode' : ''}`}>
            <div className="connect-header">
                <h1 className="view-title">{profile.isDatingEnabled ? 'Focal Connect: Matches' : 'Focal Connect: Professional Feed'}</h1>
                <div className="connect-toggle-container">
                    <span className="connect-toggle-label">Enable Dating Mode</span>
                    <button
                        onClick={toggleDating}
                        className={`toggle-button ${profile.isDatingEnabled ? 'toggle-on' : 'toggle-off'}`}
                        role="switch"
                        aria-checked={profile.isDatingEnabled}
                    >
                        <span className="toggle-handle"></span>
                    </button>
                </div>
            </div>

            <div className="search-bar-container">
                <Search className="icon-search" />
                <input
                    type="text"
                    placeholder="Search by name, major, or interests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="connect-feed">
                {filteredProfiles.length > 0 ? (
                    filteredProfiles.map(user => (
                        <ProfileCard
                            key={user.id}
                            user={user}
                            datingMessage={datingMessage[user.id] || "Tap 'Generate' to craft a perfect opener."}
                            generateIcebreaker={generateIcebreaker}
                            handleCopy={handleCopy}
                            isGenerating={isGenerating}
                            isCopied={isCopied}
                        />
                    ))
                ) : (
                    <div className="card placeholder-card">
                        <p className="placeholder-text">No users match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for ConnectView to keep it clean
const ProfileCard = ({ user, datingMessage, generateIcebreaker, handleCopy, isGenerating, isCopied }) => {
    const message = datingMessage;
    const isMessageGenerated = message !== "Tap 'Generate' to craft a perfect opener." && message !== "Drafting...";

    return (
        <div className="user-profile-card card">
            <div className="profile-summary">
                <User className="icon-medium" />
                <div className="profile-text">
                    <p className="user-name">{user.name} <span className="user-score">Score: {user.score}</span></p>
                    <p className="user-major">{user.major}, {user.year}</p>
                </div>
                <button className="like-button">
                    <Heart className="icon-small" />
                </button>
            </div>

            <div className="profile-details-grid">
                <div className="detail-item">
                    <span className="detail-label">Likes:</span>
                    <div className="detail-tags">
                        {user.likes.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Dislikes:</span>
                    <div className="detail-tags">
                        {user.dislikes.map(tag => <span key={tag} className="tag tag-dislike">{tag}</span>)}
                    </div>
                </div>
            </div>

            <div className="icebreaker-section">
                <p className="icebreaker-label">Icebreaker</p>
                <div className="icebreaker-box">
                    <p className={`icebreaker-text ${isMessageGenerated ? 'generated-text' : 'placeholder-text'}`}>
                        {message}
                    </p>
                    <button
                        onClick={() => generateIcebreaker(user)}
                        disabled={isGenerating}
                        className="generate-button"
                    >
                        <Sparkle className="icon-small" /> {message === "Drafting..." ? '...' : 'Generate'}
                    </button>
                    {isMessageGenerated && (
                        <button onClick={() => handleCopy(message)} className="copy-button">
                            {isCopied ? <Check className="icon-small" /> : <svg className="icon-small" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Component: Leaderboard View ---
const LeaderboardView = ({ isDevMode }) => {
    // Sort mock profiles by score descending for the leaderboard
    const leaderboardData = [...mockProfiles, INITIAL_PROFILE]
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({ ...p, rank: index + 1 }));

    return (
        <div className="view-container leaderboard-view">
            <h1 className="view-title">Focal Leaderboard</h1>
            <p className="leaderboard-subtitle">Top students by Focal Influence Score (FIS)</p>
            
            <div className="leaderboard-grid">
                <div className="leaderboard-header">
                    <span className="leaderboard-rank-header">#</span>
                    <span className="leaderboard-name-major-header">Student / Major</span>
                    <span className="leaderboard-score-header">FIS</span>
                </div>
                {leaderboardData.map((user, index) => (
                    <div key={user.id || user.rank} className={`leaderboard-row ${index < 3 ? 'top-rank' : ''}`}>
                        <span className="leaderboard-rank">{user.rank}</span>
                        <span className="leaderboard-name-major">
                            <span className="leaderboard-name">{user.name}</span>
                            <span className="leaderboard-major">{user.major}</span>
                        </span>
                        <span className="leaderboard-score">{user.score}</span>
                    </div>
                ))}
            </div>
            
            {isDevMode && <div className="card placeholder-card" style={{marginTop: '20px'}}>Note: Data is mock and includes your local profile.</div>}
        </div>
    );
};

// --- Component: Chat Window ---
const ChatWindow = ({ conversation, userId }) => {
    const [messages, setMessages] = useState(MOCK_MESSAGES_DATA[conversation.id] || []);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Mock Real-time Update (simulates onSnapshot)
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageToSend = {
            senderId: userId,
            text: newMessage.trim(),
            timestamp: new Date(),
        };

        // Mock saving message (in a real app, this would be addDoc(collectionRef, messageToSend))
        setMessages(prev => [...prev, messageToSend]);
        setNewMessage('');

        // Simulate opponent reply shortly after
        setTimeout(() => {
            const reply = {
                senderId: conversation.userId,
                text: "Got it! That's a good point.",
                timestamp: new Date(Date.now() + 500),
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : date; // Already a Date object in mock
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-window-container">
            <div className="chat-header-bar">
                <div className="chat-avatar-small">
                    <User className="icon-small" />
                </div>
                <h3 className="chat-name">{conversation.name}</h3>
                <span className="chat-status">Active</span>
            </div>

            <div className="message-list">
                {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.senderId === userId ? 'mine' : 'theirs'}`}>
                        <div className="message-bubble">
                            <p className="message-text">{msg.text}</p>
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="message-input-field"
                />
                <button type="submit" className="message-send-button" disabled={!newMessage.trim()}>
                    <Send className="icon-small" />
                </button>
            </form>
        </div>
    );
};

// --- Component: Messages View (New) ---
const MessagesView = ({ userId }) => {
    const [conversations] = useState(MOCK_CONVERSATIONS);
    const [selectedChat, setSelectedChat] = useState(MOCK_CONVERSATIONS[0]);

    const ConversationItem = ({ chat }) => (
        <div
            className={`conversation-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => setSelectedChat(chat)}
        >
            <div className="chat-avatar-small">
                <User className="icon-small" />
            </div>
            <div className="chat-info">
                <span className="chat-contact-name">{chat.name}</span>
                <p className="chat-last-message">{chat.lastMessage}</p>
            </div>
            <span className="chat-last-time">{chat.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>
    );

    return (
        <div className="view-container messages-view-grid">
            <div className="chat-list-panel">
                <h2 className="panel-header">Chats</h2>
                {conversations.map(chat => (
                    <ConversationItem key={chat.id} chat={chat} />
                ))}
            </div>

            <div className="chat-window-panel">
                {selectedChat ? (
                    <ChatWindow conversation={selectedChat} userId={userId} />
                ) : (
                    <div className="chat-placeholder">
                        Select a conversation to begin chatting.
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Component: Settings View ---
const SettingsView = ({ profile, setProfile, saveProfileData }) => {
    const [isEditingMerit, setIsEditingMerit] = useState(false);
    const toggleDating = () => setProfile(prev => ({ ...prev, isDatingEnabled: !prev.isDatingEnabled }));

    const handleSaveMerit = (newProfileData) => {
        setProfile(newProfileData);
        saveProfileData(newProfileData);
        setIsEditingMerit(false);
    };

    return (
        <div className="view-container settings-view">
            {isEditingMerit && (
                <MeritEditorModal
                    currentProfile={profile}
                    onSave={handleSaveMerit}
                    onClose={() => setIsEditingMerit(false)}
                />
            )}
            <h1 className="view-title">Account Settings</h1>

            <div className="settings-section">
                <h2 className="settings-section-title">Profile & Merit Management</h2>

                <div className="settings-item card">
                    <div className="settings-label-group">
                        <span className="settings-label">Edit Profile Details & Bio</span>
                        <span className="settings-description">Update your name, major, year, and personal biography.</span>
                    </div>
                    <button onClick={() => setIsEditingMerit(true)} className="button-secondary">
                        <Edit className="icon-small" /> Edit Details
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Focal Connect Settings</h2>

                <div className="settings-item card">
                    <div className="settings-label-group">
                        <span className="settings-label">Dating Mode Status</span>
                        <span className="settings-description">When enabled, your profile appears in the Connect: Matches feed.</span>
                    </div>
                    <div className="toggle-switch-group">
                        <span className="connect-toggle-label">{profile.isDatingEnabled ? 'ACTIVE' : 'INACTIVE'}</span>
                        <button
                            onClick={toggleDating}
                            className={`toggle-button ${profile.isDatingEnabled ? 'toggle-on' : 'toggle-off'}`}
                            role="switch"
                            aria-checked={profile.isDatingEnabled}
                        >
                            <span className="toggle-handle"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [currentTab, setCurrentTab] = useState(TABS.PROFILE);
    const [profile, setProfile] = useState(INITIAL_PROFILE);
    const [userId] = useState('local_user_id'); // Set local_user_id for mock senderId comparison
    const [authState] = useState({
        isInitializing: false,
        error: "DEV MODE: Firebase is inactive. Data is NOT saved.",
    });
    const isDevMode = true;

    // --- Initialization (Now instant and mocked) ---
    useEffect(() => {
        initFirebase();
    }, []);

    // --- Data Fetching and Persistence (MOCKED) ---
    const saveProfileData = useCallback(async (dataToSave) => {
        console.log("Saving mock data in DEV MODE:", dataToSave);
    }, []);


    // --- UI Logic ---
    const getAccentColor = () => profile.isDatingEnabled ? 'var(--color-rose)' : 'var(--color-white)';

    const SidebarButton = ({ tab, icon: Icon, label }) => {
        const isActive = currentTab === tab;
        const buttonClass = `sidebar-button ${isActive ? 'active' : ''} ${profile.isDatingEnabled ? 'dating' : 'prof'}`;
        
        return (
            <button
                onClick={() => setCurrentTab(tab)}
                className={buttonClass}
                style={{
                    color: isActive ? getAccentColor() : 'var(--color-gray-400)',
                    borderRightColor: isActive ? getAccentColor() : 'transparent',
                }}
            >
                <Icon className="icon-medium" />
                <span className="tab-label">{label}</span>
            </button>
        );
    };

    const renderView = () => {
        switch (currentTab) {
            case TABS.PROFILE:
                return <ProfileView profile={profile} userId={userId} setProfile={setProfile} isDevMode={isDevMode} saveProfileData={saveProfileData} />;
            case TABS.CONNECT:
                return <ConnectView profile={profile} setProfile={setProfile} isDevMode={isDevMode} />;
            case TABS.LEADERBOARD:
                return <LeaderboardView isDevMode={isDevMode} />;
            case TABS.MESSAGES:
                return <MessagesView userId={userId} />;
            case TABS.SETTINGS:
                return <SettingsView profile={profile} setProfile={setProfile} saveProfileData={saveProfileData} />;
            default:
                return <ProfileView profile={profile} userId={userId} setProfile={setProfile} isDevMode={isDevMode} saveProfileData={saveProfileData} />;
        }
    };


    return (
        <div className="app-container desktop-grid">
            
            <style jsx="true">{`
                /* --- Variables and Global Reset (INLINED CSS) --- */
                :root {
                    --color-black: #000000;
                    --color-gray-950: #0a0a0a;
                    --color-gray-900: #171717;
                    --color-gray-800: #262626;
                    --color-gray-700: #3f3f46;
                    --color-gray-500: #737373;
                    --color-gray-300: #d4d4d4;
                    --color-white: #ffffff;
                    
                    --color-rose: #e11d48; 
                    
                    --accent-color: ${getAccentColor()};
                    
                    --transition-speed: 300ms;
                    --sidebar-width: 250px;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    transition: background-color var(--transition-speed), border-color var(--transition-speed), color var(--transition-speed), transform var(--transition-speed);
                }

                body {
                    background-color: var(--color-gray-950);
                }

                /* --- App Layout (PC/Desktop Grid) --- */
                .app-container {
                    color: var(--color-white);
                }
                .app-container.desktop-grid {
                    display: grid;
                    grid-template-columns: var(--sidebar-width) 1fr;
                    min-height: 100vh;
                    width: 100%;
                    max-width: none;
                    margin: 0;
                    border: none;
                    background-color: var(--color-gray-950); /* Main app background */
                }

                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: var(--sidebar-width);
                    background-color: var(--color-gray-900);
                    border-right: 1px solid var(--color-gray-800);
                    padding: 24px 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .logo {
                    font-size: 1.8rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 32px;
                    letter-spacing: 2px;
                    color: var(--accent-color);
                }

                .sidebar-group {
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-button {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    text-align: left;
                    padding: 12px 24px;
                    background: none;
                    border: none;
                    border-right: 4px solid transparent; /* Used for active indicator */
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    gap: 12px;
                    color: var(--color-gray-400);
                }

                .sidebar-button:hover:not(.active) {
                    background-color: var(--color-gray-800);
                    color: var(--color-white);
                }

                .sidebar-button.active {
                    background-color: var(--color-gray-800);
                    font-weight: 700;
                    color: var(--accent-color);
                    border-right-color: var(--accent-color);
                }

                .sidebar-footer {
                    padding-top: 20px;
                    border-top: 1px solid var(--color-gray-800);
                }

                /* --- Main Content Panel --- */
                .main-content-panel {
                    grid-column: 2 / 3;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--color-gray-950);
                }

                .content-area {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 0 40px 40px 40px; 
                }

                .view-container {
                    padding-top: 24px;
                    max-width: 1000px; 
                    margin: 0 auto;
                }

                .card {
                    background-color: var(--color-gray-900);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 1px solid var(--color-gray-800);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                }

                .card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--color-white);
                    margin-bottom: 12px;
                }

                .button-primary { 
                    background-color: var(--accent-color);
                    color: var(--color-black);
                    padding: 10px 20px;
                    border: 1px solid var(--accent-color);
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .button-primary:hover:not(:disabled) {
                    background-color: transparent;
                    color: var(--accent-color);
                }

                .button-secondary {
                    background-color: var(--color-gray-800);
                    color: var(--color-white);
                    padding: 10px 20px;
                    border: 1px solid var(--color-gray-800);
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .button-secondary:hover:not(:disabled) {
                    background-color: var(--color-gray-700);
                    border-color: var(--color-gray-700);
                }

                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .icon-small { width: 16px; height: 16px; }
                .icon-medium { width: 24px; height: 24px; }
                .icon-large { width: 48px; height: 48px; }

                .dev-mode-banner {
                    background-color: var(--color-gray-800);
                    color: var(--color-gray-300);
                    font-size: 0.8rem;
                    padding: 8px 24px;
                    text-align: center;
                    border-bottom: 1px solid var(--color-gray-700);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                /* --- Profile View Specifics (Two-Column Layout) --- */
                .profile-view {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr; 
                    gap: 40px;
                }

                .profile-card-section {
                    grid-column: 1 / 2;
                }

                .profile-merit-section {
                    grid-column: 2 / 3;
                }

                .profile-card-image {
                    height: 300px; 
                    border-radius: 12px;
                    background-color: var(--color-gray-800);
                    background-size: cover;
                    background-position: center;
                    border: 1px solid var(--color-gray-800);
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 20px;
                }

                .profile-card-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
                    color: var(--color-white);
                }

                .profile-name {
                    font-size: 2rem;
                    font-weight: 900;
                    line-height: 1.1;
                    color: var(--color-white);
                }

                .profile-detail {
                    font-size: 1rem;
                    color: var(--color-gray-300);
                    margin-top: 4px;
                    margin-bottom: 8px;
                }

                .profile-metrics {
                    display: flex;
                    gap: 16px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--color-gray-300);
                }

                .metric-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .metric-fire { color: var(--color-rose); }
                .metric-heart { color: var(--color-rose); }

                .profile-bio-details {
                    padding: 16px 20px;
                }

                .profile-bio-text {
                    font-size: 1rem;
                    line-height: 1.5;
                    color: var(--color-gray-300);
                }

                .score-card { border-left: 3px solid var(--accent-color); margin-bottom: 24px; }
                .score-value { font-size: 3.5rem; font-weight: 800; }
                .merit-details { margin-top: 10px; border-top: 1px dashed var(--color-gray-800); padding-top: 10px; display: grid; gap: 8px; }
                .merit-item { display: flex; justify-content: space-between; font-size: 0.875rem; }
                .merit-label { color: var(--color-gray-400); }
                .merit-points { color: var(--color-gray-300); font-weight: 600; font-family: monospace; }
                .narrative-card { border-left: 3px solid var(--color-gray-500); }
                .narrative-text { font-size: 0.95rem; line-height: 1.5; color: var(--color-gray-300); }
                .narrative-actions { display: flex; gap: 12px; margin-top: 16px; }
                .redemption-card { border-left: 3px solid var(--color-gray-700); }
                .redemption-text { font-size: 0.9rem; color: var(--color-gray-400); }
                .merit-bonus { color: var(--color-white); font-weight: 700; }
                .connect-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .connect-toggle-container { display: flex; align-items: center; gap: 10px; }
                .connect-toggle-label { font-size: 0.9rem; color: var(--color-gray-400); }
                .search-bar-container { display: flex; align-items: center; background-color: var(--color-gray-800); border: 1px solid var(--color-gray-700); border-radius: 8px; padding: 10px 16px; margin-bottom: 24px; }
                .icon-search { width: 20px; height: 20px; color: var(--color-gray-500); margin-right: 12px; }
                .search-input { flex-grow: 1; background: none; border: none; color: var(--color-white); font-size: 1rem; outline: none; }
                .connect-feed { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
                .user-profile-card { padding: 16px; }
                .profile-summary { display: flex; align-items: center; border-bottom: 1px solid var(--color-gray-800); padding-bottom: 12px; margin-bottom: 12px; }
                .profile-summary .icon-medium { color: var(--accent-color); margin-right: 12px; }
                .profile-text { flex-grow: 1; }
                .user-name { font-size: 1.125rem; font-weight: 700; color: var(--color-white); }
                .user-score { font-size: 0.75rem; font-weight: 500; color: var(--color-gray-500); margin-left: 8px; }
                .user-major { font-size: 0.875rem; color: var(--color-gray-400); }
                .like-button { background-color: var(--color-gray-800); border: none; color: var(--color-rose); padding: 8px; border-radius: 50%; cursor: pointer; }
                .like-button:hover { background-color: var(--color-rose); color: var(--color-white); }
                .profile-details-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; }
                .detail-label { font-weight: 600; color: var(--color-gray-300); display: block; margin-bottom: 4px; }
                .detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
                .tag { background-color: var(--color-gray-800); color: var(--color-white); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
                .tag-dislike { background-color: var(--color-gray-950); color: var(--color-gray-500); border: 1px solid var(--color-gray-800); }
                .icebreaker-section { border-top: 1px solid var(--color-gray-800); padding-top: 12px; }
                .icebreaker-label { font-size: 0.75rem; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                .icebreaker-box { display: flex; align-items: center; background-color: var(--color-gray-800); padding: 8px; border-radius: 8px; }
                .icebreaker-text { flex-grow: 1; font-size: 0.9rem; padding-right: 8px; }
                .placeholder-text { color: var(--color-gray-500); font-style: italic; }
                .generated-text { color: var(--color-gray-300); font-weight: 500; }
                .generate-button { background-color: var(--color-gray-950); color: var(--accent-color); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--color-gray-800); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; cursor: pointer; }
                .copy-button { background: none; border: none; color: var(--color-gray-500); padding: 4px; cursor: pointer; }
                .leaderboard-grid { display: grid; grid-template-columns: 50px 3fr 1fr; border: 1px solid var(--color-gray-800); border-radius: 12px; overflow: hidden; }
                .leaderboard-header { background-color: var(--color-gray-700); padding: 12px 16px; font-weight: 700; color: var(--color-white); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--color-gray-800); }
                .leaderboard-header span { display: flex; align-items: center; padding-left: 10px; }
                .leaderboard-rank-header { justify-content: center; }
                .leaderboard-score-header { justify-content: flex-end; }
                .leaderboard-row:nth-child(odd) > span { background-color: var(--color-gray-900); }
                .leaderboard-row:nth-child(even) > span { background-color: var(--color-gray-950); }
                .leaderboard-row:hover > span { background-color: var(--color-gray-800); }
                .leaderboard-row span { padding: 12px 16px; border-top: 1px solid var(--color-gray-800); font-size: 0.95rem; display: flex; align-items: center; }
                .leaderboard-rank { font-weight: 700; color: var(--accent-color); justify-content: center; }
                .top-rank .leaderboard-rank { font-size: 1.1rem; background-color: var(--color-gray-700) !important; color: var(--color-white); }
                .leaderboard-name-major { flex-direction: column; align-items: flex-start; }
                .leaderboard-name { font-weight: 600; color: var(--color-white); }
                .leaderboard-major { font-size: 0.8rem; color: var(--color-gray-500); margin-top: 2px; }
                .leaderboard-score { font-weight: 700; color: var(--color-gray-300); justify-content: flex-end; font-family: monospace; }
                .settings-view { padding-top: 24px; max-width: 700px; }
                .settings-section-title { font-size: 1.3rem; font-weight: 700; color: var(--accent-color); margin-top: 24px; margin-bottom: 16px; }
                .input-field { width: 100%; background-color: var(--color-gray-800); border: 1px solid var(--color-gray-700); padding: 8px 12px; color: var(--color-white); border-radius: 6px; font-size: 1rem; outline: none; }
                .input-field-small { width: 80px; background-color: var(--color-gray-800); border: 1px solid var(--color-gray-700); padding: 6px 10px; color: var(--color-white); border-radius: 6px; font-size: 0.9rem; text-align: right; outline: none; }
                
                /* --- MESSAGING CSS (FINAL STYLED) --- */
                .messages-view-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    min-height: calc(100vh - 70px);
                    max-width: none;
                    padding: 0;
                    gap: 1px;
                    background-color: var(--color-gray-800);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--color-gray-800);
                }

                .chat-list-panel {
                    grid-column: 1 / 2;
                    background-color: var(--color-gray-900);
                    padding: 16px 0;
                    overflow-y: auto;
                }
                
                .chat-window-panel {
                    grid-column: 2 / 3;
                    background-color: var(--color-gray-950);
                    display: flex;
                    flex-direction: column;
                }

                .chat-window-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                
                /* Conversation Item */
                .conversation-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    cursor: pointer;
                    border-left: 3px solid transparent;
                }
                
                .conversation-item:hover { background-color: var(--color-gray-800); }
                
                .conversation-item.active {
                    background-color: var(--color-gray-800);
                    border-left-color: var(--accent-color);
                }
                
                .chat-contact-name { font-weight: 600; font-size: 0.95rem; color: var(--color-white); display: block; }
                .chat-last-message { font-size: 0.8rem; color: var(--color-gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .chat-last-time { font-size: 0.7rem; color: var(--color-gray-500); }

                /* Chat Window Header */
                .chat-header-bar {
                    display: flex; align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid var(--color-gray-800);
                    background-color: var(--color-gray-900);
                }
                
                .chat-name { font-size: 1.1rem; font-weight: 700; margin-right: 10px; }
                .chat-status { font-size: 0.75rem; color: var(--color-rose); border: 1px solid var(--color-rose); padding: 2px 6px; border-radius: 4px; font-weight: 600; }

                /* Message List */
                .message-list {
                    flex-grow: 1; overflow-y: auto;
                    padding: 20px;
                    display: flex; flex-direction: column; gap: 12px;
                }
                
                .message-row { display: flex; width: 100%; }
                .message-row.mine { justify-content: flex-end; }
                
                .message-bubble {
                    max-width: 70%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 0.95rem; line-height: 1.4;
                    position: relative;
                }
                
                .message-row.mine .message-bubble {
                    background-color: var(--accent-color);
                    color: var(--color-black); /* High contrast text on accent color */
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
                
                .message-row.theirs .message-bubble {
                    background-color: var(--color-gray-700);
                    color: var(--color-white); /* High contrast text on dark gray */
                    border-bottom-left-radius: 4px;
                }

                .message-text { margin-bottom: 4px; }

                .message-time {
                    display: block; font-size: 0.65rem; text-align: right;
                    color: rgba(0, 0, 0, 0.6); /* Darkened for contrast on accent bubble */
                }

                .message-row.theirs .message-time {
                    color: var(--color-gray-400); /* Lighter for contrast on dark bubble */
                }

                /* Message Input */
                .message-input-area {
                    padding: 15px 20px; border-top: 1px solid var(--color-gray-800);
                    display: flex; gap: 10px;
                    background-color: var(--color-gray-900);
                }
                
                .message-input-field {
                    flex-grow: 1; padding: 10px 15px;
                    background-color: var(--color-gray-800);
                    border: 1px solid var(--color-gray-700);
                    border-radius: 20px;
                    color: var(--color-white); font-size: 1rem; outline: none;
                }
                
                .message-send-button {
                    background-color: var(--accent-color);
                    color: var(--color-black); border: none;
                    border-radius: 50%; width: 40px; height: 40px;
                    display: flex; justify-content: center; align-items: center; cursor: pointer;
                }
            `}</style>
            
            {/* --- Left Navigation Sidebar --- */}
            <nav className="sidebar">
                <h1 className="logo">FOCAL</h1>
                <div className="sidebar-group">
                    <SidebarButton tab={TABS.PROFILE} icon={User} label="Profile" />
                    <SidebarButton tab={TABS.CONNECT} icon={Connect} label="Connect" />
                    <SidebarButton tab={TABS.LEADERBOARD} icon={Trophy} label="Leaderboard" />
                    <SidebarButton tab={TABS.MESSAGES} icon={Mail} label="Messages" />
                </div>
                <div className="sidebar-footer">
                    <SidebarButton tab={TABS.SETTINGS} icon={Settings} label="Settings" />
                </div>
            </nav>

            {/* --- Main Content Panel --- */}
            <main className="main-content-panel">
                {authState.error && (
                    <div className="dev-mode-banner">
                        <p>{authState.error}</p>
                    </div>
                )}
                <div className="content-area">
                    {renderView()}
                </div>
            </main>
        </div>
    );
}
