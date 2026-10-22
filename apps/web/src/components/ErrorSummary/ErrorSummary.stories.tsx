import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorSummary } from "./ErrorSummary";

const meta = {
  title: "Form/ErrorSummary",
  component: ErrorSummary,
  args: {
    title: "Er is een probleem",
    errors: [
      { targetId: "contactName", message: "Vul de naam van de contactpersoon in" },
      { targetId: "email", message: "Vul een geldig e-mailadres in, zoals naam@example.org" },
    ],
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <label htmlFor="contactName">Naam contactpersoon</label>
        <input id="contactName" />
        <label htmlFor="email">E-mailadres</label>
        <input id="email" />
      </>
    ),
  ],
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoErrors: Story = {};
