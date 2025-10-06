// eslint-disable-next-line no-undef
/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

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
    updateDoc
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


// --- Constants ---
const TABS = {
    PROFILE: 'profile',
    CONNECT: 'connect',
    LEADERBOARD: 'leaderboard',
    MESSAGES: 'messages',
    SETTINGS: 'settings', // New Settings Tab
};

const INITIAL_PROFILE = {
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
    profileViews: 124, // New Metric
    likesCount: 35, // New Metric
    profileImage: "https://placehold.co/800x450/171717/d4d4d4?text=USER+PROFILE", // Placeholder for profile image
};

// Mock data for profiles (Sorted by score descending for leaderboard)
const mockProfiles = [
    { id: 4, name: "Ben Carter", score: 250, major: "Aerospace Eng.", year: "4th Year", likes: ["Chess", "3D Printing"], dislikes: ["Networking events"], location: "Tech Lab" },
    { id: 2, name: "Alex Chen", score: 210, major: "Business Analyst", year: "4th Year", likes: ["Basketball", "Startups", "Data Science"], dislikes: ["Long meetings", "Waiting in line"], location: "Off-Campus Apartment" },
    { id: 6, name: "David Kim", score: 195, major: "Data Science", year: "Grad Student", likes: ["Big data", "Podcasts"], dislikes: ["Slow internet"], location: "Library Annex" },
    { id: 1, name: "Jane Doe", score: 185, major: "Electrical Eng.", year: "3rd Year", likes: ["Sci-Fi", "Hiking", "Vintage Film"], dislikes: ["Waking up early", "Crowds"], location: "North Wing Dorms" },
    { id: 3, name: "Maria S.", score: 140, major: "Architecture", year: "2nd Year", likes: ["Drawing", "Coffee", "Modernist Design"], dislikes: ["Loud Music", "Big parties"], location: "Central Residence" },
    { id: 5, name: "Lisa Wong", score: 120, major: "Visual Arts", year: "3rd Year", likes: ["Painting", "Museums"], dislikes: ["Loud parties"], location: "Art Studio" },
];


// --- Firebase Initialization and Auth/DB Handlers (MOCKED) ---
let db = null;
let auth = null;
let appId = 'focal-app-local';

const initFirebase = () => {
    // THIS FUNCTION IS NOW A NO-OP (NO OPERATION) FOR LOCAL DEV
    console.log("Firebase init skipped for local development.");
}

// --- Utility: Clipboard Copy ---
const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log("Copied to clipboard via modern API!");
        });
    }
};


// --- Gemini API Call Functions ---
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


// --- Component: Settings View (New) ---
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


// --- Component: Messages View (Placeholder) ---
const MessagesView = ({ isDevMode }) => (
    <div className="view-container messages-view">
        <h1 className="view-title">Messages</h1>
        <div className="card placeholder-card">
            <p className="placeholder-text">Real-time messaging is coming soon!</p>
            <p className="placeholder-subtext">Chat with your connections and matches here.</p>
        </div>
    </div>
);


// --- Main App Component ---
export default function App() {
    const [currentTab, setCurrentTab] = useState(TABS.PROFILE);
    const [profile, setProfile] = useState(INITIAL_PROFILE);
    const [isAuthReady, setIsAuthReady] = useState(true); // INSTANT LOAD FIX
    const [userId, setUserId] = useState(crypto.randomUUID());
    const [authState, setAuthState] = useState({
        // Force fully loaded state immediately
        isInitializing: false,
        error: "DEV MODE: Firebase is inactive. Data is NOT saved.",
    });
    const isDevMode = true;


    // --- Initialization (Now instant and mocked) ---
    useEffect(() => {
        // This runs instantly, forcing the app to render the UI immediately.
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
                return <MessagesView isDevMode={isDevMode} />;
            case TABS.SETTINGS:
                return <SettingsView profile={profile} setProfile={setProfile} saveProfileData={saveProfileData} />;
            default:
                return <ProfileView profile={profile} userId={userId} setProfile={setProfile} isDevMode={isDevMode} saveProfileData={saveProfileData} />;
        }
    };


    // This conditional render block is removed to prevent the stuck loading screen
    /*
    if (authState.isInitializing) {
        return <div className="loading-screen">FOCAL Loading...</div>;
    }
    */

    return (
        <div className={`app-container desktop-grid ${profile.isDatingEnabled ? 'dating-theme' : 'prof-theme'}`}>
            
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
                {isDevMode && (
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
