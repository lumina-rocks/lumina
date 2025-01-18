"use client";

import { CreateSecretKeyForm } from "@/components/onboarding/createSecretKeyForm";

export default function OnboardingHome() {
  return (
    <>
      <div className="flex flex-col items-center py-6 px-6">
        <h1>Step 1: Create your secret key</h1>
        <CreateSecretKeyForm />
      </div>
    </>
  );
}
