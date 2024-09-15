"use client"

import Song from "@/components/music/Song";
import { useState, useEffect, useRef } from "react";

interface AudioFile {
    name: string,
    songTitle: string,
    artist: string,
    url: string,
    contentType: string,
    externalLinks: {
        spotify: string,
        youtube: string,
        tiktok: string,
    },
    uploadedAt: string,
}

export default function MusicPage() {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null); // Stores the audio that is currently playing

    useEffect(() => {
        getAudioFiles();
    }, []);

    const getAudioFiles = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/audio', {
                method: 'GET',
            });

            if (!res.ok) {
                throw new Error("Failed to fetch audio files");
            }

            const res_json = await res.json();
            setAudioFiles(res_json);
            return res_json;
        } catch (error) {
            console.log("Error:", error);
        }
    }

    // Only one file can play at a time
    const handlePlay = (audioElement: HTMLAudioElement) => {
        if (audioRef.current && audioRef.current !== audioElement) {
            audioRef.current.pause();
            // Set current play time to beginning of file
            audioRef.current.currentTime = 0;
        }
        audioRef.current = audioElement;
    }

    return (
        <section>
            <ul className="flex flex-wrap">
                {audioFiles.map((audioFile, index) => (
                    <li key={index}>
                        {/* <audio controls onPlay={(e) => handlePlay(e.currentTarget)}>
                            <source src={audioFile.url} type="audio/mpeg" />
                        </audio> */}
                        <Song 
                        songTitle={audioFile.songTitle}
                        artist={audioFile.artist}
                        url={audioFile.url}
                        spotify={audioFile.externalLinks.spotify}
                        youtube={audioFile.externalLinks.youtube}
                        tiktok={audioFile.externalLinks.tiktok}
                        uploadedAt={audioFile.uploadedAt}
                        handlePlay={handlePlay}
                        />
                    </li>
                ))}
            </ul>
        </section>
    )
}
