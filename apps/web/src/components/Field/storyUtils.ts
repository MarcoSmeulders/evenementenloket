import type { UseFormRegisterReturn } from "react-hook-form";

/** A stand-in for react-hook-form's register() in stories: the inputs work, nothing is stored. */
export function makeStoryRegistration(name: string): UseFormRegisterReturn {
  return {
    name,
    onChange: async () => undefined,
    onBlur: async () => undefined,
    ref: () => undefined,
  };
}
