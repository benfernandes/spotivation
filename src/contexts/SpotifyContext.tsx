import { createContext, useEffect, useState } from "react";
import pkceChallenge from "pkce-challenge";
import {
    REDIRECT_URL,
    SPOTIFY_AUTH_STATE_KEY,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_CODE_VERIFIER_KEY,
} from "../apis/spotify/constants";
import { getTokens } from "../apis/spotify/accounts";
import {
    CurrentlyPlaying,
    getCurrentTrackStatusNew,
    getQueueNew,
    Queue,
} from "../apis/spotify/api";
import { getLocalAccessToken, removeAuthTokens, setAuthTokens } from "../services/tokenService";

const SPOTIFY_AUTH_BASE_URL = "https://accounts.spotify.com";

const generateState = () => {
    let text = "";
    const length = 16;
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }
    return text;
};

const SpotifyContext = createContext<{
    isSignedIn: boolean;
    initiateSignIn: () => Promise<void>;
    requestTokens: (code: string, state: string) => Promise<void>;
    signOut: () => void;
    getCurrentTrackStatus: () => Promise<CurrentlyPlaying>;
    getQueue: () => Promise<Queue>;
}>({
    isSignedIn: false,
    initiateSignIn: async () => {},
    requestTokens: async (_code: string, _state: string) => {},
    signOut: () => {},
    getCurrentTrackStatus: async (): Promise<any> => {},
    getQueue: async (): Promise<any> => {},
});

const SpotifyProvider: React.FC = (props) => {
    const [isSignedIn, setIsSignedIn] = useState(false);

    // on page load
    useEffect(() => {
        const bearerToken = getLocalAccessToken();
        setIsSignedIn(bearerToken !== null);
    }, []);

    const initiateSignIn = async () => {
        const { code_verifier: codeVerifier, code_challenge: codeChallenge } = pkceChallenge(128);
        window.localStorage.setItem(SPOTIFY_CODE_VERIFIER_KEY, codeVerifier);

        const state = generateState();
        window.localStorage.setItem(SPOTIFY_AUTH_STATE_KEY, state);

        const authorizeUrl = new URL("authorize", SPOTIFY_AUTH_BASE_URL).toString();
        const searchParams = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: "code",
            redirect_uri: REDIRECT_URL,
            state: state,
            scope: "user-read-playback-state",
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
        }).toString();

        window.location.href = `${authorizeUrl}?${searchParams}`;
    };

    const requestTokens = async (code: string, state: string) => {
        const storedState = window.localStorage.getItem(SPOTIFY_AUTH_STATE_KEY);
        const storedCodeVerifier = window.localStorage.getItem(SPOTIFY_CODE_VERIFIER_KEY) || "";

        if (state !== storedState) {
            // TODO - Do some error handling
        }

        window.localStorage.removeItem(SPOTIFY_AUTH_STATE_KEY);

        try {
            const { access_token, refresh_token } = await getTokens(
                code,
                storedCodeVerifier,
                SPOTIFY_CLIENT_ID,
                SPOTIFY_CLIENT_SECRET
            );
            window.localStorage.removeItem(SPOTIFY_CODE_VERIFIER_KEY);
            setAuthTokens(access_token, refresh_token);
            setIsSignedIn(true);
        } catch (error) {
            console.error(error);
            // setIsSignedIn(false);
        }
    };

    const signOut = () => {
        window.localStorage.removeItem(SPOTIFY_AUTH_STATE_KEY);
        window.localStorage.removeItem(SPOTIFY_CODE_VERIFIER_KEY);
        removeAuthTokens();
        setIsSignedIn(false);
    };

    const getCurrentTrackStatus = async (): Promise<any> => {
        try {
            return await getCurrentTrackStatusNew();
        } catch (error) {
            console.error(error);
        }
    };

    const getQueue = async (): Promise<any> => {
        try {
            return await getQueueNew();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SpotifyContext.Provider
            value={{
                isSignedIn,
                initiateSignIn,
                requestTokens,
                signOut,
                getCurrentTrackStatus,
                getQueue,
            }}
        >
            {props.children}
        </SpotifyContext.Provider>
    );
};

export { SpotifyContext, SpotifyProvider };
