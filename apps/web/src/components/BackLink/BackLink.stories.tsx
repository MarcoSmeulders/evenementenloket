import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { BackLink } from "./BackLink";

const meta = {
  title: "Form/BackLink",
  component: BackLink,
  args: { to: "/aanvraag/voorbeeld/organisator", label: "Vorige stap" },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};
