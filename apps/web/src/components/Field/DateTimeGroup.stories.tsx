import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeGroup } from "./DateTimeGroup";
import { makeStoryRegistration } from "./storyUtils";

const meta = {
  title: "Form/DateTimeGroup",
  component: DateTimeGroup,
  args: {
    id: "start",
    legend: "Begin",
    dateLabel: "Datum",
    timeLabel: "Tijd",
    date: { id: "startDate", registration: makeStoryRegistration("startDate"), isInvalid: false },
    time: { id: "startTime", registration: makeStoryRegistration("startTime"), isInvalid: false },
    errorPrefix: "Fout: ",
  },
} satisfies Meta<typeof DateTimeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithError: Story = {
  args: {
    error: "Het begin moet in de toekomst liggen",
    date: { id: "startDate", registration: makeStoryRegistration("startDate"), isInvalid: true },
  },
};
