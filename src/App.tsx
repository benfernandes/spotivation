import { useState } from "react";
import Header from "./components/Header";
import NowPlaying from "./components/NowPlaying";
import Upcoming from "./components/Upcoming";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import { ChannelColor, getGradientFromColor, getNextColor } from "./utils";

const App = () => {
    const [channelColor, setChannelColor] = useState<ChannelColor>("red");

    const changeChannelColor = () => {
        setChannelColor(getNextColor(channelColor));
    };

    return (
        <SpotifyProvider>
            <div
                className={`grid grid-cols-1 grid-rows-3 absolute inset-0 bg-gradient-to-b to-black ${getGradientFromColor(
                    channelColor
                )}`}
            >
                <Header
                    channelColor={channelColor}
                    changeChannelColor={changeChannelColor}
                />
                <NowPlaying />
                <Upcoming />
            </div>
        </SpotifyProvider>
    );
};

export default App;
