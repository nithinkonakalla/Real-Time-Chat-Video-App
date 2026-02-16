import { useEffect, useRef } from 'react';

export const VideoPanel = ({ localStreamRef, remoteStreamRef, onStart, onEnd, onShare }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = localStreamRef.current;
    if (remoteVideo.current) remoteVideo.current.srcObject = remoteStreamRef.current;
  }, [localStreamRef, remoteStreamRef]);

  return (
    <div className="video-panel">
      <video ref={localVideo} autoPlay playsInline muted className="video" />
      <video ref={remoteVideo} autoPlay playsInline className="video" />
      <div className="video-actions">
        <button onClick={onStart}>Start Call</button>
        <button onClick={onShare}>Share Screen</button>
        <button onClick={onEnd}>End Call</button>
      </div>
    </div>
  );
};
