interface SongProps {
    songTitle: string,
    artist: string,
    url: string,
    spotify: string,
    youtube: string,
    tiktok: string,
    uploadedAt: string,
    handlePlay: (audioElement: HTMLAudioElement) => void,
}

export default function Song(props: SongProps) {
    // Convert uploadedAt string to Date object
    const uploadedAtDate = new Date(props.uploadedAt);

    return (
        <div className="border rounded-lg m-4 p-4">
            <h3>{props.songTitle}</h3>
            <p>{props.artist}</p>
            <span>{uploadedAtDate.toLocaleDateString()}</span>
            <audio controls onPlay={(e) => props.handlePlay(e.currentTarget)}>
                <source src={props.url} type="audio/mpeg" />
            </audio>
        </div>
    )
}
