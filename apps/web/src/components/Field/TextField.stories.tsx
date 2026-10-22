import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Form/TextField",
  component: TextField,
  args: { id: "contactName", label: "Naam contactpersoon", errorPrefix: "Fout: " },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithHint: Story = {
  args: { hint: "De persoon die de gemeente kan benaderen over het evenement." },
};

export const WithError: Story = {
  args: {
    hint: "De persoon die de gemeente kan benaderen over het evenement.",
    error: "Vul de naam van de contactpersoon in",
  },
};
