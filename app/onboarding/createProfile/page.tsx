"use client";

import { CreateProfileForm } from "@/components/CreateProfileForm";
import { useEffect } from "react";

export default function OnboardingCreateProfile() {
  useEffect(() => {
    document.title = `Create Profile | LUMINA`;
  }, []);

  return (
    <>
      <div className="flex flex-col items-center py-6 px-6">
        <h1>Step 2: Create Profile</h1>
        <CreateProfileForm />
      </div>
    </>
  );
}
