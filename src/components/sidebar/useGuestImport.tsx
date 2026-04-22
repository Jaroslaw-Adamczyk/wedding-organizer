import { useCallback, useRef, useState } from "react";
import { parseGuestFile } from "../../utils/guestParser";
import { useSeating } from "../../context/seating-context";

type ImportStatus = "idle" | "loading" | "error" | "success";

export function useGuestImport() {
  const { importGuests } = useSeating();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setStatus("loading");
      try {
        importGuests(await parseGuestFile(file));
        setError(null);
        setStatus("success");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown import error.");
        setStatus("error");
      }
    },
    [importGuests],
  );

  return { inputRef, status, error, openPicker, handleFileChange };
}
