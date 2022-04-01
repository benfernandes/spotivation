import React, { useContext, useEffect, useState } from "react";
import { SpotifyContext } from "../../contexts/SpotifyContext";
import AlbumArt from "./AlbumArt";
import SongInfo from "./SongInfo";

const NowPlaying = () => {
    const spotifyContext = useContext(SpotifyContext);
    const [artworkUrl, setArtworkUrl] = useState("");
    const [songTitle, setSongTitle] = useState("");
    const [songArtist, setSongArtist] = useState("");
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);

    useEffect(() => {
        setInterval(() => {
            spotifyContext.getCurrentTrackStatus().then((data) => {
                data.item && setArtworkUrl(data.item.album.images[0].url);
                data.item && setSongTitle(data.item.name);
                data.item && setSongArtist(data.item.artists[0].name);
                data.progress_ms && setProgressMs(data.progress_ms);
                data.item && setDurationMs(data.item.duration_ms);
            });
        }, 2000);
    }, [spotifyContext]);

    return (
        <div className="text-white rounded-md grid gap-4 grid-cols-2 grid-rows-1 p-8">
            <AlbumArt src={artworkUrl} />
            <SongInfo
                songTitle={songTitle}
                songArtist={songArtist}
                progressMs={progressMs}
                durationMs={durationMs}
            />
        </div>
    );
};

export default NowPlaying;
