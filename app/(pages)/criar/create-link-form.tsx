"use client";

import { createLink } from "@/app/actions/create-link";
import { verifyLink } from "@/app/actions/verify-link";
import Button from "@/app/components/ui/button";
import TextInput from "@/app/components/ui/text-input";
import { sanitezeLink } from "@/app/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

export function CreateLinkForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [link, setLink] = useState(
    sanitezeLink(searchParams.get("link") || "")
  );
  const [error, setError] = useState<string | null>(null);

  function handleLinkChange(e: ChangeEvent<HTMLInputElement>) {
    setLink(sanitezeLink(e.target.value));
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (link.length === 0) {
      return setError("O link não pode ser vazio.");
    }

    const isLinkTaken = await verifyLink(link);

    if (isLinkTaken) {
      return setError("Esse link já está em uso. Tente outro.");
    }

    const isLinkCreated = await createLink(link);

    if (!isLinkCreated) {
      return setError("Houve um erro ao criar seu link. Tente novamente.");
    }

    router.push(`/${link}`);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
        <span className="text-white">projectinbio.com/</span>
        <TextInput value={link} onChange={handleLinkChange} />
        <Button className="w-31.5">Criar</Button>
      </form>
      <div className="">
        <span className="text-accent-pink">{error}</span>
      </div>
    </>
  );
}
