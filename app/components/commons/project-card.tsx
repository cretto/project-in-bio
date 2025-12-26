"use client";

import { increaseProjectVisits } from "@/app/actions/increase-project-visits";
import { formatterUrl } from "@/app/lib/utils";
import type { ProjectData } from "@/app/server/get-profile-data";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectCard({
  project,
  isOwner,
  name,
  description,
  img,
}: {
  project?: ProjectData;
  isOwner?: boolean;
  img?: string;
  name?: string;
  description?: string;
}) {
  const { profileId } = useParams();

  const formattedUrl = formatterUrl(project?.projectUrl || "");

  async function handleClickLink() {
    if (!profileId || !project?.id || isOwner) {
      return;
    }

    await increaseProjectVisits(profileId as string, project.id);
  }

  return (
    <Link href={formattedUrl} target="_blank" onClick={handleClickLink}>
      <div className="w-85 h-33 flex gap-5 bg-background-secondary p-3 rounded-[20px] border border-transparent hover:border-border-secondary">
        <div className="size-24 rounded-md overflow-hidden shrink-0">
          <img src={img} alt="Projeto" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-2">
          {isOwner && (
            <span className="uppercase text-xs font-bold text-accent-green">
              {project?.totalVisits || 0} cliques
            </span>
          )}
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl">
              {name || project?.projectName}
            </span>
            <span className="text-content-body text-sm ">
              {description || project?.projectDescription}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
