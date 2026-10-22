import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";
import { TextField } from "./TextField";
import { makeStoryRegistration } from "./storyUtils";

const meta = {
  title: "Form/RadioGroup",
  component: RadioGroup,
  args: {
    name: "organiserType",
    legend: "Meldt u als particulier of namens een organisatie?",
    options: [
      { value: "private", label: "Particulier" },
      { value: "organisation", label: "Namens een organisatie" },
    ],
    registration: makeStoryRegistration("organiserType"),
    errorPrefix: "Fout: ",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithError: Story = {
  args: { error: "Kies of u meldt als particulier of namens een organisatie" },
};

/** The extra question below "Namens een organisatie" while that option is chosen. */
export const WithConditionalQuestion: Story = {
  args: {
    conditional: {
      value: "organisation",
      isShown: true,
      content: (
        <TextField id="organisationName" label="Naam van de organisatie" errorPrefix="Fout: " />
      ),
    },
  },
};
