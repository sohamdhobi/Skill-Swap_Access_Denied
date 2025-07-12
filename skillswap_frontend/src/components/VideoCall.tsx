import React, { useState, useEffect, useRef } from 'react';

interface VideoCallProps {
  meetingId: number;
  participants: { id: number; username: string }[];
  onClose: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ meetingId, participants, onClose }) => {
  console.log('VideoCall component rendered with meetingId:', meetingId);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    initializeVideoCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera/microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }

      // Check permissions first
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (permissions.state === 'denied') {
        setError('Camera access is blocked. Please allow camera access in your browser settings and refresh the page.');
        return;
      }

      // Get user media with fallback options
      let stream: MediaStream;
      try {
        // Try with both video and audio first
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (videoAudioError) {
        console.log('Video+audio failed, trying video only:', videoAudioError);
        try {
          // Fallback to video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (videoOnlyError) {
          console.log('Video only failed, trying audio only:', videoOnlyError);
          try {
            // Fallback to audio only
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            });
          } catch (audioOnlyError) {
            console.log('Audio only failed:', audioOnlyError);
            throw new Error('No camera or microphone access available');
          }
        }
      }

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming remote stream
      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsConnecting(false);
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setIsConnecting(false);
        } else if (peerConnection.connectionState === 'failed') {
          setError('Failed to establish connection. Please try again.');
        }
      };

      // Create and send offer (in a real app, this would be sent through signaling server)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Simulate receiving answer (in real app, this would come from signaling server)
      setTimeout(() => {
        simulateAnswer(peerConnection);
      }, 1000);

    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone access when prompted, then refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please check your device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera or microphone does not meet the required constraints.';
      } else if (err.name === 'TypeError') {
        errorMessage += 'Camera or microphone access is not supported in this browser.';
      } else {
        errorMessage += 'Please check your browser settings and try again.';
      }
      
      setError(errorMessage);
    }
  };

  const simulateAnswer = async (peerConnection: RTCPeerConnection) => {
    try {
      // Simulate receiving an answer from the other participant
      const answer = await peerConnection.createAnswer();
      await peerConnection.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error simulating answer:', err);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(
          s => s.track?.kind === 'video'
        );

        if (sender && peerConnectionRef.current) {
          sender.replaceTrack(videoTrack);
          setLocalStream(screenStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);

          // Stop screen sharing when user stops sharing
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        const videoTrack = cameraStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(
          s => s.track?.kind === 'video'
        );

        if (sender && peerConnectionRef.current) {
          sender.replaceTrack(videoTrack);
          setLocalStream(cameraStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream;
          }
          setIsScreenSharing(false);
        }
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleEndCall = () => {
    cleanup();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Video Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        backgroundColor: '#1a1a1a'
      }}>
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Local Video (Picture-in-Picture) */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '200px',
          height: '150px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Connection Status */}
        {isConnecting && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '10px' }}>🔄</div>
            <div>Connecting to video call...</div>
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              Waiting for other participants
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(220,53,69,0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '24px' }}>❌</div>
            <div style={{ marginBottom: '15px', fontSize: '16px' }}>{error}</div>
            
            <div style={{ 
              marginBottom: '15px', 
              fontSize: '14px', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px' 
            }}>
              <strong>How to fix:</strong>
              <ul style={{ textAlign: 'left', margin: '10px 0', paddingLeft: '20px' }}>
                <li>Click the camera/microphone icon in your browser's address bar</li>
                <li>Select "Allow" for camera and microphone access</li>
                <li>Refresh the page and try again</li>
                <li>Make sure no other app is using your camera</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setError('');
                  setIsConnecting(true);
                  initializeVideoCall();
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={handleEndCall}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                End Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Simplified */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: '20px',
        borderRadius: '50px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        zIndex: 9998
      }}>
        <button
          onClick={() => {
            alert('Mute button clicked!');
            toggleMute();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: isMuted ? '#dc3545' : '#007bff',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          onClick={() => {
            alert('Video button clicked!');
            toggleVideo();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: isVideoOff ? '#dc3545' : '#007bff',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>

        <button
          onClick={() => {
            alert('Screen share button clicked!');
            toggleScreenShare();
          }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: isScreenSharing ? '#28a745' : '#007bff',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          💻
        </button>

        <button
          onClick={() => {
            alert('End call button clicked!');
            handleEndCall();
          }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: '#dc3545',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          📞
        </button>
      </div>

      {/* Meeting Info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Meeting #{meetingId}
        </div>
        <div>
          Participants: {participants.map(p => p.username).join(', ')}
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 