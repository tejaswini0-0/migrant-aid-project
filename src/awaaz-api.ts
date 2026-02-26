import type { SubmissionPayload } from './components/VoiceRecordScreen';

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5173';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalysisResponse {
  sessionId: string;
  incidentType: 'wage_theft' | 'unsafe_conditions' | 'document_confiscation' | 'physical_abuse' | 'pre_employment' | 'other';
  confidence: number;
  language: string;
  evidenceChecklist: string[];
  rightsText: string;
  relevantLaws: { act: string; section: string; description: string }[];
  complaintDraft: string;
  nearbyAuthorities: { name: string; address: string; phone: string; hours: string }[];
  pdfUrl?: string;
  audioResponseUrl?: string;   // IndicTTS response
  referToNgo: boolean;
  rawTranscript: string;
}

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

// ─── Main submission function ─────────────────────────────────────────────────

/**
 * Submits the worker's problem to the backend.
 * 
 * The backend expects either:
 *   a) multipart/form-data with audio file + metadata (when audioBlob is present)
 *   b) application/json with transcript + metadata (text-only fallback)
 * 
 * Your FastAPI endpoint should be:
 *   POST /api/v1/submit
 */
export async function submitToAwaazBackend(
  payload: SubmissionPayload
): Promise<{ data?: AnalysisResponse; error?: ApiError }> {
  try {
    let response: Response;

    if (payload.audioBlob) {
      // ── Send audio + transcript together ──────────────────────────────────
      // Backend runs IndicWav2Vec2/Whisper on the audio for highest accuracy,
      // and uses the transcript as a fallback/cross-check.
      const form = new FormData();
      form.append('audio', payload.audioBlob, `recording_${Date.now()}.webm`);
      form.append('transcript', payload.transcript);
      form.append('language', payload.language);
      form.append('language_code', payload.languageCode);
      form.append('input_method', payload.inputMethod);
      form.append('audio_duration_ms', String(payload.audioDurationMs ?? 0));
      form.append('confidence', String(payload.confidence ?? 0));
      form.append('timestamp', payload.timestamp);

      response = await fetch(`${API_BASE}/api/v1/submit`, {
        method: 'POST',
        body: form,
        // Note: do NOT set Content-Type header — browser sets it automatically
        // with the correct multipart boundary when using FormData
      });
    } else {
      // ── Text-only fallback ─────────────────────────────────────────────────
      response = await fetch(`${API_BASE}/api/v1/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: payload.transcript,
          language: payload.language,
          language_code: payload.languageCode,
          input_method: payload.inputMethod,
          timestamp: payload.timestamp,
        }),
      });
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return {
        error: {
          code: String(response.status),
          message: errBody?.detail ?? `Server error ${response.status}`,
          retryable: response.status >= 500,
        },
      };
    }

    const data: AnalysisResponse = await response.json();
    return { data };

  } catch (err) {
    // Network failure or CORS
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server. Please check your connection and try again.',
        retryable: true,
      },
    };
  }
}

// ─── WebSocket streaming alternative (for real-time voice) ───────────────────

/**
 * Opens a WebSocket to the backend for real-time audio streaming.
 * Use this instead of submitToAwaazBackend when you want sub-4s latency.
 * 
 * Your FastAPI endpoint should be:
 *   WS /api/v1/stream
 */
export function openAwaazStream(
  languageCode: string,
  onPartialResult: (text: string) => void,
  onFinalResult: (analysis: AnalysisResponse) => void,
  onError: (error: string) => void
): { sendChunk: (chunk: Blob) => void; close: () => void } {
  const wsUrl = `${API_BASE.replace(/^http/, 'ws')}/api/v1/stream?lang=${languageCode}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'partial') {
        onPartialResult(msg.transcript);
      } else if (msg.type === 'final') {
        onFinalResult(msg as AnalysisResponse);
      } else if (msg.type === 'error') {
        onError(msg.message);
      }
    } catch {
      onError('Malformed server response');
    }
  };

  ws.onerror = () => onError('WebSocket connection failed');
  ws.onclose = (e) => {
    if (!e.wasClean) onError('Connection dropped');
  };

  return {
    sendChunk: (chunk: Blob) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    },
    close: () => ws.close(1000, 'done'),
  };
}

// ─── Helper: poll for case status ────────────────────────────────────────────

/**
 * Polls the backend for the status of an existing case.
 * Maps to UC-06 (Follow-Up on Existing Case).
 * 
 * FastAPI endpoint: GET /api/v1/case/{sessionId}
 */
export async function getCaseStatus(sessionId: string): Promise<AnalysisResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/case/${sessionId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}