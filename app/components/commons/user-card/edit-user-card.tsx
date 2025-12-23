"use client";

import { ArrowUpFromLine, UserPen } from "lucide-react";
import { startTransition, useState } from "react";
import Modal from "../../ui/modal";
import TextInput from "../../ui/text-input";
import TextArea from "../../ui/text-area";
import Button from "../../ui/button";
import {
  compressFiles,
  handleImageInput,
  triggerImageInput,
} from "@/app/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { saveProfile } from "@/app/actions/save-profile";
import type { ProfileData } from "@/app/server/get-profile-data";

export default function EditUserCard({
  profileData,
}: {
  profileData?: ProfileData;
}) {
  const router = useRouter();
  const { profileId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [yourName, setYourName] = useState(profileData?.name || "");
  const [yourDescription, setYourDescription] = useState(
    profileData?.description || ""
  );

  async function handleSaveProfile() {
    if (!profileId) {
      return;
    }

    setIsSavingProfile(true);

    const imagesInput = document.getElementById(
      "profile-pic-input"
    ) as HTMLInputElement;

    if (!imagesInput.files) {
      return;
    }

    const compressedFile = await compressFiles(Array.from(imagesInput.files));

    const formData = new FormData();
    formData.append("profileId", profileId as string); // You might want to set the actual profileId here
    formData.append("file", compressedFile[0]);
    formData.append("yourName", yourName);
    formData.append("yourDescription", yourDescription);

    await saveProfile(formData);

    startTransition(() => {
      setIsModalOpen(false);
      setIsSavingProfile(false);

      router.refresh();
    });
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        <UserPen />
      </button>
      <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen}>
        <div className="bg-background-primary p-8 rounded-[20px] flex flex-col justify-between gap-10">
          <p className="text-white font-bold text-xl">Editar perfil</p>
          <div className="flex gap-10">
            <div className="flex flex-col items-center gap-3 text-xs">
              <div className="w-25 h-25 rounded-xl bg-background-tertiary overflow-hidden">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile Picture"
                    className="object-cover object-center"
                  />
                ) : (
                  <button
                    className="w-full h-full"
                    onClick={() => triggerImageInput("profile-pic-input")}
                  >
                    100x100
                  </button>
                )}
              </div>
              <button
                onClick={() => triggerImageInput("profile-pic-input")}
                className="text-white flex items-center gap-2"
              >
                <ArrowUpFromLine className="size-4" />
                <span>Adicionar Foto</span>
              </button>
              <input
                id="profile-pic-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setProfilePic(handleImageInput(e))}
              />
            </div>
            <div className="flex flex-col gap-4 w-73.95">
              <div className="flex flex-col gap-1">
                <label htmlFor="your-name" className="text-white font-bold">
                  Seu nome
                </label>
                <TextInput
                  id="your-name"
                  placeholder="Digite seu nome"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="your-description">Descrição</label>
                <TextArea
                  id="your-description"
                  placeholder="Fale um pouco sobre você"
                  value={yourDescription}
                  onChange={(e) => setYourDescription(e.target.value)}
                  className="h-36"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="font-bold text-white"
            >
              Voltar
            </button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
