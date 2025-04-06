declare module 'react-native-webrtc-web-shim' {
  import { Component } from 'react';

  export interface MediaStreamTrack {
    enabled: boolean;
    id: string;
    kind: string;
    label: string;
    muted: boolean;
    readyState: string;
    remote: boolean;
  }

  export class MediaStream {
    constructor(tracks?: MediaStreamTrack[]);
    id: string;
    active: boolean;
    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
    getTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    getAudioTracks(): MediaStreamTrack[];
    clone(): MediaStream;
  }

  export interface RTCDataChannel extends EventTarget {
    label: string;
    ordered: boolean;
    maxPacketLifeTime: number | null;
    maxRetransmits: number | null;
    protocol: string;
    negotiated: boolean;
    id: number | null;
    readyState: RTCDataChannelState;
    bufferedAmount: number;
    bufferedAmountLowThreshold: number;
    close(): void;
    send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  export interface RTCPeerConnection extends EventTarget {
    createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
    createAnswer(
      options?: RTCAnswerOptions
    ): Promise<RTCSessionDescriptionInit>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addTrack(track: MediaStreamTrack, stream?: MediaStream): RTCRtpSender;
    close(): void;
    createDataChannel(
      label: string,
      options?: RTCDataChannelInit
    ): RTCDataChannel;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  export interface RTCViewProps {
    streamURL?: string;
    stream?: MediaStream;
    mirror?: boolean;
    zOrder?: number;
    objectFit?: 'contain' | 'cover';
    style?: any;
  }

  export class RTCView extends Component<RTCViewProps> {}

  export const mediaDevices: {
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  };

  // Additional types
  export type RTCDataChannelState =
    | 'connecting'
    | 'open'
    | 'closing'
    | 'closed';

  export interface RTCOfferOptions {
    iceRestart?: boolean;
    offerToReceiveAudio?: boolean;
    offerToReceiveVideo?: boolean;
  }

  export interface RTCAnswerOptions {
    voiceActivityDetection?: boolean;
  }

  export interface RTCDataChannelInit {
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    protocol?: string;
    negotiated?: boolean;
    id?: number;
  }

  export interface MediaStreamConstraints {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }

  export interface MediaTrackConstraints {
    deviceId?: string;
    groupId?: string;
    autoGainControl?: boolean;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    sampleRate?: number;
    sampleSize?: number;
    volume?: number;
  }

  export interface RTCRtpSender {
    track: MediaStreamTrack | null;
    transport: RTCDtlsTransport | null;
    getParameters(): RTCRtpSendParameters;
    setParameters(parameters: RTCRtpSendParameters): Promise<void>;
    replaceTrack(track: MediaStreamTrack | null): Promise<void>;
  }

  export interface RTCDtlsTransport {
    state: RTCDtlsTransportState;
    getRemoteCertificates(): ArrayBuffer[];
  }

  export type RTCDtlsTransportState =
    | 'new'
    | 'connecting'
    | 'connected'
    | 'closed'
    | 'failed';

  export interface RTCRtpSendParameters {
    encodings: RTCRtpEncodingParameters[];
    transactionId: string;
  }

  export interface RTCRtpEncodingParameters {
    active?: boolean;
    maxBitrate?: number;
    maxFramerate?: number;
    rid?: string;
    scaleResolutionDownBy?: number;
  }
}
