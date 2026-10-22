import type { Meta, StoryObj } from "@storybook/react-vite";
import { CharacterCount } from "./CharacterCount";

function makeCountText(remaining: number) {
  return remaining >= 0
    ? `U heeft nog ${remaining} tekens`
    : `U heeft ${Math.abs(remaining)} tekens te veel`;
}

const meta = {
  title: "Form/CharacterCount",
  component: CharacterCount,
  args: {
    id: "description",
    label: "Beschrijving",
    hint: "Wat gaat er gebeuren? Gebruik maximaal 1.000 tekens.",
    errorPrefix: "Fout: ",
    text: "",
    maxLength: 1000,
    makeCountText,
  },
} satisfies Meta<typeof CharacterCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const TooLong: Story = {
  args: {
    text: "a".repeat(1012),
    defaultValue: "a".repeat(1012),
    error: "De beschrijving mag maximaal 1.000 tekens lang zijn",
  },
};
