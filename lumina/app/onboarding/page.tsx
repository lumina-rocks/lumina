"use client";

import { CreateSecretKeyForm } from "@/components/onboarding/createSecretKeyForm";
import { useEffect } from "react";

export default function OnboardingHome() {
  useEffect(() => {
    document.title = `Onboarding | LUMINA`;
  }, []);

  return (
    <>
      <div className="flex flex-col items-center py-6 px-6">
        <h1>Step 1: Create your secret key</h1>
        <CreateSecretKeyForm />
      </div>
    </>
  );
}
