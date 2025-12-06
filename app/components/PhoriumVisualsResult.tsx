"use client";
import PhoriumLoader from "./PhoriumLoader";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  LayoutTemplate,
  Sparkles,
  Crop,
  Loader2,
  Download,
  Store,
  ZoomIn,
  ZoomOut,
  History,
  Repeat2,
  Palette,
} from "lucide-react";

type CampaignItem = {
  url: string;
  label: string;
  size?: string;
};

type HistoryItem = {
  id: string;
  url: string;
  title?: string;
  createdAt?: string;
};

interface PhoriumVisualsResultProps {
  /** Hovedbilde-URL (siste generering) */
  imageUrl: string | null;
  /** Viser loader på hovedpreview */
  isBusy: boolean;
  /** Feilmelding relatert til generering (valgfritt) */
  error?: string | null;

  /** Kampanjepakke-varianter (hero, square, story osv.) */
  campaignPack: CampaignItem[];

  /** Historikk (siste 3–5 elementer, du bestemmer) */
  history: HistoryItem[];

  /** Vis trygg tekst-sone overlay på hovedbildet */
  showSafeZone: boolean;
  setShowSafeZone: (value: boolean) => void;

  /** Fullscreen-bilde state */
  fullscreenImage: string | null;
  setFullscreenImage: (value: string | null) => void;

  /** Shopify-modus (om vi skal vise “Lagre til Shopify”-knapper) */
  isShopifyMode: boolean;
  productIdFromUrl?: string | null;
  saving: boolean;

  /** Handlers du kobler til eksisterende logikk  */
  onDownload: (url: string) => void;
  onSaveToShopify: (url: string) => void;
  onUseHistoryAgain: (item: HistoryItem) => void;
  onUseHistoryStyle: (item: HistoryItem) => void;
  onClearHistory?: () => void;
}

const PhoriumVisualsResult: React.FC<PhoriumVisualsResultProps> = ({
  imageUrl,
  isBusy,
  error,
  campaignPack,
  history,
  showSafeZone,
  setShowSafeZone,
  fullscreenImage,
  setFullscreenImage,
  isShopifyMode,
  productIdFromUrl,
  saving,
  onDownload,
  onSaveToShopify,
  onUseHistoryAgain,
  onUseHistoryStyle,
  onClearHistory,
}) => {
  const hasImage = !!imageUrl && !isBusy;
  const hasCampaignPack = campaignPack.length > 0;

  return (
    <>
      {/* ------------------------------------------------- */}
      {/*  Forhåndsvisning + kampanjepakke                   */}
      {/* ------------------------------------------------- */}
      <section className="mt-10 border-t border-phorium-off/30 pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-phorium-light">
            <ImageIcon className="h-4 w-4 text-phorium-accent" />
            Forhåndsvisning
          </h2>

          <label className="flex cursor-pointer select-none items-center gap-2 text-[10px] text-phorium-light/65">
            <input
              type="checkbox"
              checked={showSafeZone}
              onChange={(e) => setShowSafeZone(e.target.checked)}
              className="h-3.5 w-3.5 accent-phorium-accent"
            />
            <Crop className="h-3.5 w-3.5" />
            Vis trygg tekst-sone
          </label>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)]">
          {/* ---------------- HOVEDPREVIEW ---------------- */}
          <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4 shadow-[0_22px_65px_rgba(0,0,0,0.6)]">
            <div className="relative mx-auto flex w-full max-w-[720px] flex-col gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-phorium-off/35 bg-phorium-dark/80">
                <div className="relative flex aspect-[4/3] items-center justify-center px-4 py-4">
                  {/* Loader */}
                  {isBusy && (
  <PhoriumLoader />
)}


                  {/* Ingen bilde ennå */}
                  {!isBusy && !imageUrl && !error && (
                    <p className="mx-auto max-w-sm text-center text-[12px] text-phorium-light/70">
                      <span className="mb-1 flex items-center justify-center gap-1.5 text-phorium-light/85">
                        <Sparkles className="h-3.5 w-3.5 text-phorium-accent" />
                        Ingen bildegenereringer ennå
                      </span>
                      Velg modus, fyll inn beskrivelse og trykk{" "}
                      <span className="font-semibold text-phorium-accent">
                        Generer bilde
                      </span>{" "}
                      for å se resultatet her.
                    </p>
                  )}

                  {/* Faktisk bilde */}
                  {!isBusy && imageUrl && (
                    <motion.img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Generert bilde"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setFullscreenImage(imageUrl)}
                      className="mx-auto max-h-[70vh] max-w-full cursor-zoom-in rounded-xl object-contain shadow-2xl"
                    />
                  )}

                  {/* Trygg tekst-sone overlay */}
                  {showSafeZone && imageUrl && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-[72%] w-[78%] rounded-2xl border border-dashed border-phorium-accent/80" />
                    </div>
                  )}
                </div>
              </div>

              {/* Knappelinje under bildet */}
              {hasImage && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onDownload(imageUrl!)}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Last ned
                    </button>

                    {isShopifyMode && productIdFromUrl && (
                      <button
                        type="button"
                        onClick={() => onSaveToShopify(imageUrl!)}
                        disabled={saving}
                        className="btn btn-primary btn-sm inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Lagrer i Shopify…
                          </>
                        ) : (
                          <>
                            <Store className="h-3.5 w-3.5" />
                            Lagre som produktbilde
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-phorium-light/55">
                    Klikk på bildet for å åpne fullskjerm og flere valg.
                  </p>
                </div>
              )}

              {error && (
                <p className="flex items-center gap-1.5 text-[11px] text-phorium-error/90">
                  <Palette className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* --------------- KAMPANJEPAKKE ---------------- */}
          <aside className="space-y-4">
            {hasCampaignPack && (
              <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="flex items-center gap-2 text-[13px] font-semibold text-phorium-light">
                      <LayoutTemplate className="h-3.5 w-3.5 text-phorium-accent" />
                      Kampanjepakke
                    </h3>
                    <p className="text-[11px] text-phorium-light/65">
                      Flere formater til samme budskap – hero, Instagram og
                      stories.
                    </p>
                  </div>
                  <span className="rounded-full bg-phorium-off/15 px-2 py-0.5 text-[10px] text-phorium-light/70">
                    {campaignPack.length} varianter
                  </span>
                </div>

                <div className="space-y-3">
                  {campaignPack.map((item) => (
                    <div
                      key={item.url}
                      className="group flex items-center gap-3 rounded-xl border border-phorium-off/35 bg-phorium-dark/85 p-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => setFullscreenImage(item.url)}
                        className="relative h-16 w-20 overflow-hidden rounded-lg border border-phorium-off/40 bg-phorium-dark/80"
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.04]"
                        />
                        <span className="pointer-events-none absolute inset-0 rounded-lg border border-white/5 group-hover:border-phorium-accent/40" />
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-phorium-light">
                            {item.label}
                          </p>
                          {item.size && (
                            <span className="rounded-full bg-phorium-off/18 px-2 py-0.5 text-[9px] text-phorium-light/65">
                              {item.size}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setFullscreenImage(item.url)}
                            className="btn btn-ghost btn-xs inline-flex items-center gap-1"
                          >
                            <ZoomIn className="h-3 w-3" />
                            Åpne
                          </button>

                          <button
                            type="button"
                            onClick={() => onDownload(item.url)}
                            className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Last ned
                          </button>

                          {isShopifyMode && productIdFromUrl && (
                            <button
                              type="button"
                              onClick={() => onSaveToShopify(item.url)}
                              disabled={saving}
                              className="btn btn-ghost btn-xs inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {saving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Store className="h-3 w-3" />
                                  Til Shopify
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint når vi har hovedbilde men ingen kampanjepakke */}
            {imageUrl && !hasCampaignPack && !isBusy && (
              <div className="rounded-2xl border border-dashed border-phorium-off/40 bg-phorium-dark/40 p-4 text-[11px] text-phorium-light/70">
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-phorium-accent" />
                  Generer en kampanjepakke for å få flere formater til samme
                  budskap – hero, Instagram og stories.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------- */}
      {/*  Historikk                                         */}
      {/* ------------------------------------------------- */}
      <section className="mt-10 border-t border-phorium-off/30 pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-phorium-light">
            <History className="h-4 w-4 text-phorium-accent" />
            Historikk (siste {history.length || 0})
          </h2>

          {history.length > 0 && onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="btn btn-ghost btn-xs inline-flex items-center gap-1 text-[10px]"
            >
              Tøm historikk
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-[11px] text-phorium-light/60">
            Når du genererer bilder, vil de siste vises her slik at du enkelt
            kan bruke igjen eller ta med stil videre.
          </p>
        ) : (
          <div className="grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-phorium-off/40 bg-phorium-dark/80 p-3 shadow-[0_14px_40px_rgba(0,0,0,0.5)]"
              >
                <button
                  type="button"
                  onClick={() => setFullscreenImage(item.url)}
                  className="relative mb-3 overflow-hidden rounded-xl border border-phorium-off/35 bg-phorium-dark/80"
                >
                  <img
                    src={item.url}
                    alt={item.title || "Tidligere generert bilde"}
                    className="w-full object-cover transition duration-200 hover:scale-[1.02]"
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 hover:border-phorium-accent/40" />
                </button>

                <div className="mb-2 space-y-0.5">
                  <p className="text-[11px] font-medium text-phorium-light">
                    {item.title || "Tidligere generert bilde"}
                  </p>
                  {item.createdAt && (
                    <p className="text-[10px] text-phorium-light/55">
                      {item.createdAt}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUseHistoryAgain(item)}
                    className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                  >
                    <Repeat2 className="h-3 w-3" />
                    Bruk igjen
                  </button>
                  <button
                    type="button"
                    onClick={() => onUseHistoryStyle(item)}
                    className="btn btn-ghost btn-xs inline-flex items-center gap-1"
                  >
                    <Palette className="h-3 w-3" />
                    Bruk stil
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(item.url)}
                    className="btn btn-ghost btn-xs inline-flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Last ned
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------- */}
      {/*  FULLSCREEN LIGHTBOX                               */}
      {/* ------------------------------------------------- */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.img
              src={fullscreenImage}
              alt="Forstørret bilde"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[90vh] max-w-[95vw] rounded-2xl border border-phorium-accent/50 object-contain shadow-2xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onDownload(fullscreenImage)}
                className="btn btn-secondary btn-sm inline-flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Last ned
              </button>
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="btn btn-ghost btn-sm inline-flex items-center gap-1"
              >
                <ZoomOut className="h-3.5 w-3.5" />
                Lukk
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhoriumVisualsResult;
