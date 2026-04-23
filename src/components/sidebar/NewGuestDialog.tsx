import { Dialog } from "radix-ui";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestSchema } from "../../utils/guestParser";
import { Input } from "../ui/input";
import type { Guest } from "../../types";
import { Button } from "../ui/button";
import { useState } from "react";

export function NewGuestDialog({
  children,
  onAddGuest,
}: {
  children: React.ReactNode;
  onAddGuest: (guest: Guest) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(GuestSchema),
  });
  const onSubmit: SubmitHandler<Guest> = (data) => {
    onAddGuest(data);
    setOpen(false);
  };
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] w-[90vw] max-w-[450px] -translate-x-[50%] -translate-y-[50%] rounded-lg bg-surface p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="m-0 text-lg font-medium text-on-surface">
            Add guest
          </Dialog.Title>
          <Dialog.Description className="m-0 text-sm text-on-surface-variant">
            Add a new guest to the list.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <label htmlFor="name">Name</label>
              <Input {...register("name")} id="name" />

              <label htmlFor="surname">Surname</label>
              <Input {...register("surname")} id="surname" />

              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button variant="outline" size="sm" tone="destructive">
                    Cancel
                  </Button>
                </Dialog.Close>

                <Button type="submit" size="sm" loading={isSubmitting}>
                  Add guest
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
