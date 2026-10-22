import type { Meta, StoryObj } from "@storybook/react-vite";
import { LinkBox } from "./LinkBox";

const LINK =
  "https://evenementenloket.example.org/aanvraag/_Q_NL3Gbh7YHOiVPFcjABOm90VmaA78o1D7x76yIGaI";

const meta = {
  title: "Form/LinkBox",
  component: LinkBox,
  args: {
    label: "Uw persoonlijke link",
    link: LINK,
    warning:
      "Let op: de gemeente kan een kwijtgeraakte link niet opnieuw sturen. Zonder link kunt u niet verder met uw melding.",
    copyLabel: "Kopieer link",
    copiedText: "De link is gekopieerd.",
    copyFailedText: "Kopiëren lukte niet. Selecteer de link en kopieer hem zelf.",
    mailLabel: "Mail de link naar uzelf",
    mailHref: `mailto:?subject=Mijn%20melding&body=${encodeURIComponent(LINK)}`,
  },
} satisfies Meta<typeof LinkBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

/** At 320px wide the long link breaks over several lines and the buttons fill the row. */
export const Narrow: Story = {
  globals: { viewport: { value: "mobile1" } },
};
