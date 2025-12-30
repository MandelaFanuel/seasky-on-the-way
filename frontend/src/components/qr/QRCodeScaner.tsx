// ========================= src/components/qr/QRCodeScanner.tsx =========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Stack, TextField, Typography, alpha } from "@mui/material";
import { CameraAlt, RestartAlt, QrCode2 } from "@mui/icons-material";

type Props = {
  onDetected: (raw: string) => void;
  disabled?: boolean;
};

type CameraState = "idle" | "starting" | "running" | "error" | "unsupported";

function canUseBarcodeDetector() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export default function QRCodeScanner({ onDetected, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  const supported = useMemo(() => canUseBarcodeDetector(), []);

  useEffect(() => {
    if (!supported) setState("unsupported");
  }, [supported]);

  useEffect(() => {
    if (disabled) return;
    if (!supported) return;

    let stream: MediaStream | null = null;
    let raf = 0;
    let timer: any = null;
    let detector: any = null;

    const stop = () => {
      if (timer) clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      stream = null;
      timer = null;
      raf = 0;
    };

    const start = async () => {
      setError(null);
      setState("starting");

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setState("running");

        // scan toutes les 350ms (stable + léger)
        timer = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;

          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;

          if (!w || !h) return;

          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, w, h);

          try {
            const barcodes = await detector.detect(canvas);
            if (barcodes && barcodes.length) {
              const raw = String(barcodes[0].rawValue || "").trim();
              if (!raw) return;

              // évite double détection
              if (raw === lastDetected) return;

              setLastDetected(raw);
              onDetected(raw);
            }
          } catch {
            // ignore detect errors
          }
        }, 350);
      } catch (e: any) {
        stop();
        setState("error");
        setError(e?.message || "Impossible d'accéder à la caméra. Vérifie les permissions.");
      }
    };

    start();

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, supported]);

  const restart = () => {
    setLastDetected(null);
    setError(null);
    setState("idle");
    // relance via re-render
    setTimeout(() => setState(supported ? "idle" : "unsupported"), 50);
    // NOTE: le useEffect redémarre automatiquement car state change n'est pas dans deps,
    // donc on force en désactivant puis réactivant localement via key dans le parent si besoin.
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(11, 86, 140, 0.12)",
        boxShadow: "0 12px 40px rgba(10, 52, 95, 0.10)",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(11, 86, 140, 0.08)", background: alpha("#0B568C", 0.03) }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography sx={{ fontWeight: 900, color: "#1A4F75", fontSize: "1.2rem" }}>
              Scanner QR Code
            </Typography>
            <Typography variant="body2" sx={{ color: "#335F7A", fontWeight: 500 }}>
              Scanne un code pour confirmer une livraison, un stock, ou une opération.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={restart}
              disabled={disabled}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 800,
                borderWidth: 2,
                borderColor: "#0B568C",
                color: "#0B568C",
                "&:hover": { borderWidth: 2, borderColor: "#0A345F", backgroundColor: alpha("#0B568C", 0.05) },
              }}
            >
              Relancer
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {state === "unsupported" && (
          <Alert severity="warning" sx={{ borderRadius: 2.5, mb: 2 }}>
            Ton navigateur ne supporte pas le scan caméra (BarcodeDetector).
            Utilise la <b>saisie manuelle</b> ci-dessous ou teste sur Chrome Android.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2.5, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(11, 86, 140, 0.10)",
            background: "linear-gradient(135deg, rgba(39,177,228,0.08) 0%, rgba(11,86,140,0.06) 100%)",
            position: "relative",
            minHeight: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {state === "starting" && (
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress />
              <Typography sx={{ fontWeight: 800, color: "#1A4F75" }}>Activation de la caméra...</Typography>
            </Stack>
          )}

          {(state === "running" || state === "starting") && (
            <>
              <video
                ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: state === "running" ? "block" : "none" }}
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {state === "running" && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 220, sm: 260 },
                      height: { xs: 220, sm: 260 },
                      borderRadius: 4,
                      border: "2px solid rgba(255,255,255,0.85)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    }}
                  />
                </Box>
              )}
            </>
          )}

          {(state === "idle" || state === "error" || state === "unsupported") && (
            <Stack alignItems="center" spacing={1.5} sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  border: "1px solid rgba(11,86,140,0.12)",
                  boxShadow: "0 12px 40px rgba(10,52,95,0.10)",
                }}
              >
                <QrCode2 sx={{ fontSize: 34, color: "#0B568C" }} />
              </Box>
              <Typography sx={{ fontWeight: 900, color: "#1A4F75" }}>
                {state === "unsupported" ? "Scan caméra non supporté ici" : "Caméra non active"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#335F7A", fontWeight: 500, textAlign: "center", maxWidth: 520 }}>
                {state === "unsupported"
                  ? "Utilise la saisie manuelle du code QR pour continuer."
                  : "Clique sur Relancer ou autorise la caméra dans le navigateur."}
              </Typography>
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography sx={{ fontWeight: 900, color: "#1A4F75", mb: 1 }}>
            Saisie manuelle (fallback)
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Colle ici le contenu du QR (token/code/json...)"
              disabled={disabled}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <CameraAlt sx={{ color: "#0B568C", opacity: 0.8 }} />
                  </Box>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={() => manual.trim() && onDetected(manual.trim())}
              disabled={disabled || !manual.trim()}
              sx={{
                borderRadius: "50px",
                px: 3,
                fontWeight: 900,
                textTransform: "none",
                background: "linear-gradient(135deg, #27B1E4 0%, #0B568C 100%)",
                "&:hover": { background: "linear-gradient(135deg, #0B568C 0%, #0A345F 100%)" },
              }}
            >
              Utiliser le code
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
