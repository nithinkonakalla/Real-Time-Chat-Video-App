import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export const useWebRTC = (roomId) => {
  const { socket } = useSocket();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return undefined;

    const onOffer = async ({ offer }) => {
      await ensureConnection();
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit('call:answer', { roomId, answer });
      setInCall(true);
    };

    const onAnswer = async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(answer);
      setInCall(true);
    };

    const onCandidate = async ({ candidate }) => {
      if (candidate) await pcRef.current?.addIceCandidate(candidate);
    };

    const onEnd = () => endCall();

    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onCandidate);
    socket.on('call:end', onEnd);

    return () => {
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onCandidate);
      socket.off('call:end', onEnd);
    };
  }, [socket, roomId]);

  const ensureConnection = async () => {
    if (pcRef.current) return;
    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) socket?.emit('call:ice-candidate', { roomId, candidate: event.candidate });
    };

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStreamRef.current.addTrack(track));
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  };

  const startCall = async () => {
    await ensureConnection();
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket?.emit('call:offer', { roomId, offer });
  };

  const shareScreen = async () => {
    if (!pcRef.current) return;
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const [videoTrack] = stream.getVideoTracks();
    const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
    if (sender && videoTrack) sender.replaceTrack(videoTrack);
  };

  const endCall = () => {
    socket?.emit('call:end', { roomId });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setInCall(false);
  };

  return { startCall, endCall, shareScreen, localStreamRef, remoteStreamRef, inCall };
};
