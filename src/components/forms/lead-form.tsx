"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import { shortLeadSchema, type LeadInput, type ShortLeadInput } from "@/lib/validation";
import { TOURNAMENT } from "@/lib/constants";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { showNavigationLoading } from "@/components/app/loading-overlay";

const initial: ShortLeadInput = {
  name: "",
  email: "",
  city: "Bangalore",
  phone: "+91",
  organization: "",
  corporateConsent: false,
  website: "",
};

const fieldClass = "h-11 bg-white";

type Attribution = Partial<Pick<LeadInput, "utmSource" | "utmMedium" | "utmCampaign" | "utmTerm" | "utmContent" | "referralCode" | "landingPage" | "referrer">>;

export function LeadForm({ attribution = {} }: { attribution?: Attribution }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ShortLeadInput>({
    resolver: zodResolver(shortLeadSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    const payload: LeadInput = {
      captainName: values.name,
      displayName: values.name,
      phone: values.phone,
      whatsapp: values.phone,
      email: values.email,
      company: values.organization,
      relationship: "Corporate team eligibility confirmed",
      city: values.city,
      teamSize: "Not provided",
      preferredMonth: "Flexible",
      companyApproval: "Eligibility to be verified",
      source: "Website",
      campaign: "",
      futureInterests: [],
      message: "Pure corporate team confirmed on the short registration form.",
      operationalConsent: true,
      marketingConsent: false,
      website: values.website,
      ...attribution,
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as { reference?: string; error?: string };
    if (!response.ok || !result.reference) {
      setServerError(result.error ?? "We could not save your registration. Please try again.");
      return;
    }
    analytics.track("enquiry_submitted", { city: values.city, source: "Website", marketingConsent: false });
    showNavigationLoading("Saving your registration");
    router.push(`/register/success?reference=${encodeURIComponent(result.reference)}`);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-8" noValidate>
      <div>
        <p className="eyebrow text-[#8d672c]">Team registration</p>
        <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-[#081326]">Tell us where to reach you</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Just the essentials. We’ll collect team and player details after eligibility verification.</p>
      </div>

      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" error={errors.name?.message} register={register} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={errors.email?.message} register={register} />

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="phone">Phone number</FieldLabel>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                className={cn("PhoneInput--one-dream", errors.phone && "PhoneInput--invalid")}
                defaultCountry="in"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                forceDialCode
                preferredCountries={["in"]}
                inputProps={{ id: "phone", autoComplete: "tel", "aria-invalid": Boolean(errors.phone), "aria-label": "Phone number" }}
              />
            )}
          />
          <FieldDescription>India (+91) is selected. Use the flag menu for any other country.</FieldDescription>
          <FieldError>{errors.phone?.message}</FieldError>
        </Field>

        <TextField label="Organization" name="organization" autoComplete="organization" error={errors.organization?.message} register={register} />

        <FieldSet className="sm:col-span-2" data-invalid={Boolean(errors.city)}>
          <FieldLegend className="text-sm">Tournament location</FieldLegend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-slot="radio-group">
            {TOURNAMENT.cities.map((city) => (
              <label key={city} className="group relative cursor-pointer">
                <input className="peer sr-only" type="radio" value={city} defaultChecked={city === initial.city} {...register("city")} />
                <span className="flex min-h-12 items-center justify-center rounded-lg border border-input bg-white px-3 text-center text-sm font-semibold text-[#081326] transition-colors group-hover:border-[#d7aa54] peer-checked:border-[#d7aa54] peer-checked:bg-[#081326] peer-checked:text-[#e6c27d] peer-focus-visible:ring-3 peer-focus-visible:ring-[#d7aa54]/35">{city}</span>
              </label>
            ))}
          </div>
          <FieldError>{errors.city?.message}</FieldError>
        </FieldSet>

        <Field orientation="horizontal" data-invalid={Boolean(errors.corporateConsent)} className="rounded-lg border border-[#d7aa54]/45 bg-[#d7aa54]/8 p-4 sm:col-span-2">
          <input
            id="corporateConsent"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-[#081326] outline-none focus-visible:ring-3 focus-visible:ring-[#d7aa54]/35"
            aria-invalid={Boolean(errors.corporateConsent)}
            {...register("corporateConsent")}
          />
          <div>
            <FieldLabel htmlFor="corporateConsent">I confirm this is a genuine corporate team and agree to be contacted about registration. <span aria-hidden="true">*</span></FieldLabel>
            <FieldDescription>This confirmation helps us keep the tournament for genuine corporate teams.</FieldDescription>
            <FieldError>{errors.corporateConsent?.message}</FieldError>
          </div>
        </Field>
      </FieldGroup>

      <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" {...register("website")} />
      {serverError ? <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{serverError}</p> : null}
      <div className="flex flex-col items-start justify-between gap-5 border-t pt-6 sm:flex-row sm:items-center">
        <p className="flex max-w-md items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Your details are used only for tournament registration and operations.</p>
        <Button type="submit" disabled={isSubmitting} className="h-12 w-full bg-[#d7aa54] px-6 font-bold text-[#081326] hover:bg-[#e3bb6c] focus-visible:ring-[#d7aa54]/40 sm:w-auto">
          {isSubmitting ? "Submitting…" : "Register my team"}<ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

type Register = ReturnType<typeof useForm<ShortLeadInput>>["register"];

function TextField({ label, name, type = "text", autoComplete, error, register }: { label: string; name: "name" | "email" | "organization"; type?: string; autoComplete?: string; error?: string; register: Register }) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} type={type} autoComplete={autoComplete} className={fieldClass} aria-invalid={Boolean(error)} {...register(name)} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
