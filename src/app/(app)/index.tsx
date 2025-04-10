import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { StopCircleIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCView,
} from 'react-native-webrtc-web-shim';

import { Button } from '@/components/ui';
import { Waveform } from '@/components/ui/icons/waveform';

export default function Chat() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [transcript, setTranscript] = useState('');
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [dataChannel, setDataChannel] = useState<null | ReturnType<
    RTCPeerConnection['createDataChannel']
  >>(null);
  const peerConnection = useRef<null | RTCPeerConnection>(null);
  const [localMediaStream, setLocalMediaStream] = useState<null | MediaStream>(
    null
  );
  const remoteMediaStream = useRef<MediaStream>(new MediaStream());
  const isVoiceOnly = true;

  async function startSession() {
    if (!ephemeralKey) {
      console.log('No ephemeral key available');
      return;
    }

    // Enable audio
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    // Create a peer connection
    const pc = new RTCPeerConnection();
    // Set up some event listeners
    pc.addEventListener('connectionstatechange', (e) => {
      console.log('connectionstatechange', e);
    });
    pc.addEventListener('track', (event) => {
      if (event.track) remoteMediaStream.current.addTrack(event.track);
    });

    // Add local audio track for microphone input in the browser
    const ms = await mediaDevices.getUserMedia({
      audio: true,
    });
    if (isVoiceOnly) {
      let videoTrack = await ms.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = false;
    }

    setLocalMediaStream(ms);
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel('oai-events');
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer({});
    await pc.setLocalDescription(offer);

    const baseUrl = 'https://api.openai.com/v1/realtime';
    const model = 'gpt-4o-realtime-preview-2024-12-17';
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    const answer = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  async function fetchEphemeralKey() {
    try {
      const tokenResponse = await fetch(
        'https://2ec4-203-117-133-106.ngrok-free.app/api/session',
        { method: 'POST' }
      );
      const data = await tokenResponse.json();
      const key = data.client_secret.value;
      setEphemeralKey(key);
      return key;
    } catch (e) {
      console.log(e);
      setEphemeralKey(null);
    }
  }

  useEffect(() => {
    fetchEphemeralKey();
  }, []);

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      // TODO: load types from OpenAI SDK.
      dataChannel.addEventListener('message', async (e: any) => {
        const data = JSON.parse(e.data);
        console.log('dataChannel message', data);
        setEvents((prev) => [data, ...prev]);
        // Get transcript.
        console.log('data', data);
        if (data.type === 'response.audio_transcript.done') {
          setTranscript(data.transcript);
        }
      });
      // Set session active when the data channel is opened
      dataChannel.addEventListener('open', () => {
        setIsSessionActive(true);
        setEvents([]);
        // Configure the client side tools
      });
    }
  }, [dataChannel]);

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <View className="mb-4 w-auto">
            {!isSessionActive ? (
              <Button
                onPress={startSession}
                disabled={isSessionActive || !ephemeralKey}
                variant="outline"
                className="w-auto"
              >
                <Waveform />
              </Button>
            ) : (
              <Button
                onPress={stopSession}
                disabled={!isSessionActive}
                variant="outline"
                className="w-auto"
              >
                <StopCircleIcon color="#000" />
              </Button>
            )}
          </View>
          <RTCView stream={remoteMediaStream.current} />
          <Text className="mt-4 text-center text-2xl">{transcript}</Text>
        </View>
      </SafeAreaView>
    </>
  );
}
