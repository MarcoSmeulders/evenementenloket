import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { PageShell } from "./PageShell";

const meta = {
  title: "Components/PageShell",
  component: PageShell,
  parameters: { layout: "fullscreen" },
  args: {
    text: {
      skipLink: "Naar de inhoud",
      service: "Evenementenloket",
      municipality: "Gemeente Kranswijk",
      homeLinkHint: ", naar de startpagina",
      footer: "Gemeente Kranswijk bestaat niet. Dit is een portfolioproject.",
    },
    children: (
      <>
        <h1>Paginatitel</h1>
        <p>Inhoud van de pagina.</p>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
