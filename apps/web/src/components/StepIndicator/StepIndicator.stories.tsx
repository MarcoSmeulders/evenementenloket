import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepIndicator } from "./StepIndicator";

const meta = {
  title: "Form/StepIndicator",
  component: StepIndicator,
  args: { label: "Stappen", steps: ["Organisator", "Evenement", "Controleren"], current: 0 },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};
export const SecondStep: Story = { args: { current: 1 } };
