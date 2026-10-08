import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { SkipLink } from "./SkipLink";

const meta = {
  title: "Components/SkipLink",
  component: SkipLink,
  args: { label: "Naar de inhoud", targetId: "main" },
  decorators: [
    (Story) => (
      <>
        <Story />
        <main id="main" tabIndex={-1}>
          <p>Hoofdinhoud</p>
        </main>
      </>
    ),
  ],
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hidden until it receives keyboard focus. */
export const Normal: Story = {};

/** As shown after the first Tab on a page. */
export const Focused: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Naar de inhoud" });
    link.focus();
    await expect(link).toHaveFocus();
  },
};
