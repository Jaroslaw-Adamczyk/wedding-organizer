import { Button } from "../ui/button";
import { ACCEPT_ATTRIBUTE } from "../../utils/guestParser";
import { useGuestImport } from "./useGuestImport";

export function GuestImport() {
  const { inputRef, status, error, openPicker, handleFileChange } =
    useGuestImport();

  return (
    <div className=" grid gap-1.5">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        loading={status === "loading"}
        onClick={openPicker}
      >
        Import guests
      </Button>
      {error ? (
        <p role="alert" className="m-0 text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
