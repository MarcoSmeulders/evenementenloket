import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertMessage } from "./AlertMessage";

const meta = {
  title: "Form/AlertMessage",
  component: AlertMessage,
  args: {
    title: "Opslaan is niet gelukt",
    message:
      "Uw antwoorden zijn niet opgeslagen. Ze staan nog in het formulier. Probeer het opnieuw.",
  },
} satisfies Meta<typeof AlertMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaveFailed: Story = {};
