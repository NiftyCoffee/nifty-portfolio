"use client"

import { ChangeEvent, FormEvent, useState } from 'react';

export default function UploadAudio() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [showSpotifyInput, setShowSpotifyInput] = useState<boolean>(false);
  const [showTiktokInput, setShowTiktokInput] = useState<boolean>(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Set the file to state
      setAudioFile(files[0]);
    } else {
      // Clear the file if no file is selected
      setAudioFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!audioFile) {
      setMessage('Please select a file.');
      return;
    }

    // Extract form data variables
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    const contentType = (e.target as HTMLFormElement).contentType.value;
    formData.append('contentType', contentType);
    const songTitle = (e.target as HTMLFormElement).songTitle.value;
    formData.append('songTitle', songTitle);
    const artist = (e.target as HTMLFormElement).artist.value;
    formData.append('artist', artist);

    // External links
    const spotifyLink = (e.target as HTMLFormElement).spotifyLink?.value;
    if (spotifyLink) formData.append('spotifyLink', spotifyLink);
    const tiktokLink = (e.target as HTMLFormElement).tiktokLink?.value;
    if (tiktokLink) formData.append('tiktokLink', tiktokLink);
    const youtubeLink = (e.target as HTMLFormElement).youtubeLink?.value;
    if (youtubeLink) formData.append('youtubeLink', youtubeLink);

    try {
      const response = await fetch('http://localhost:8080/api/audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully!');
      } else {
        setMessage('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    }
  };

  return (
    <div className="w-full h-full">
      <h1 className="font-bold">Upload Audio File</h1>
      <form onSubmit={handleSubmit} className="flex-column m-auto">
        <input type="file" name="audioFile" accept="audio/*" onChange={handleFileChange} />
        <ul>
          <li>
            <input type="radio" id="fullCover" name="contentType" value="Full Cover" />
            <label htmlFor="fullCover">Full Cover</label>
          </li>
          <li>
            <input type="radio" id="shortCover" name="contentType" value="Short Cover" />
            <label htmlFor="shortCover">Short Cover</label>
          </li>
          <li>
            <input type="radio" id="original" name="contentType" value="Original" />
            <label htmlFor="original">Original</label>
          </li>
        </ul>
        <div>
          <label htmlFor="songTitle">Song Title</label>
          <input type="text" name="songTitle" />
          <label htmlFor="artist">Artist</label>
          <input type="text" name="artist" />
        </div>
        <div>
          <input type="checkbox" id="youtube" onChange={() => setShowYoutubeInput(!showYoutubeInput)} />
          <label htmlFor="youtube">Add YouTube link</label>
          {showYoutubeInput && (
            <input type="text" name="youtubeLink" />
          )}
        </div>
        <div>
          <input type="checkbox" id="tiktok" onChange={() => setShowTiktokInput(!showTiktokInput)} />
          <label htmlFor="tiktok">Add Tiktok link</label>
          {showTiktokInput && (
            <input type="text" name="tiktokLink" />
          )}
        </div>
        <div>
          <input type="checkbox" id="spotify" onChange={() => setShowSpotifyInput(!showSpotifyInput)} />
          <label htmlFor="spotify">Add Spotify link</label>
          {showSpotifyInput && (
            <input type="text" name="spotifyLink" />
          )}
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
