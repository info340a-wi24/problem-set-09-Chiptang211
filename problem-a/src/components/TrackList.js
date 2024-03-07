import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const TRACK_QUERY_TEMPLATE = 'https://itunes.apple.com/lookup?id={collectionId}&limit=50&entity=song'

export default function TrackList({setAlertMessage}) { //setAlertMessage callback as prop
  const [trackData, setTrackData] = useState([]); //tracks to show
  const [isQuerying, setIsQuerying] = useState(false); //for spinner
  const [previewAudio, setPreviewAudio] = useState(null); //for playing previews!

  const urlParams = useParams(); //get album from URL

  //YOUR CODE GOES HERE
  const { collectionId } = useParams();

  useEffect(() => {
    setIsQuerying(true);
    const requestUrl = TRACK_QUERY_TEMPLATE.replace("{collectionId}", collectionId);

    fetch(requestUrl)
      .then(response => response.json())
      .then(data => {
        if (data.resultCount <= 1) {
          throw new Error("No tracks found for album.");
        } else {
          setTrackData(data.results.slice(1));
        }
      })
      .catch(error => {
        setAlertMessage(error.message);
      })
      .finally(() => {
        setIsQuerying(false);
      });
  }, [collectionId, setAlertMessage]);

  const togglePlayingPreview = (previewUrl) => {
    if(!previewAudio) {
      const newPreview = new Audio(previewUrl);
      newPreview.addEventListener('ended', () => setPreviewAudio(null)) //stop on end
      setPreviewAudio(newPreview);
      newPreview.play();
    } else {
      previewAudio.pause();
      setPreviewAudio(null);
    }
  }

  //sort by track number
  trackData.sort((trackA, trackB) => trackA.trackNumber - trackB.trackNumber)

  //render the track elements
  const trackElemArray = trackData.map((track) => {
    let classList = "track-record";
    if(previewAudio && previewAudio.src === track.previewUrl){
      classList += " fa-spin"; //spin if previewing
    }

    return (
      <div key={track.trackId}>
        <div role="button" className={classList} onClick={() => togglePlayingPreview(track.previewUrl)}>
          <p className="track-name">{track.trackName}</p>
          <p className="track-artist">({track.artistName})</p>
        </div>
        <p className="text-center">Track {track.trackNumber}</p>
      </div>      
    )
  })

  return (
    <div>
      {isQuerying && <FontAwesomeIcon icon={faSpinner} spin size="4x" aria-label="Loading..." aria-hidden="false"/>}
      <div className="d-flex flex-wrap">
        {trackElemArray}
      </div>
    </div>
  )
}
