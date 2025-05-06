import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import elixirData from "@/data/vbuilds/elixers.json";

const elixerOptions = Object.values(elixirData);

type ElixerOption = (typeof elixerOptions)[number];
// type ElixerId = ElixerOption["id"];

export const ElixerPicker: React.FC = () => {
  return (
    <DropdownSelect
      options={[...elixerOptions]}
      defaultValue={null}
      placeholder={
        <DropdownSelectPlaceholder
          image="/images/vbuilds/elixirs/elixir-prowler.webp"
          text="Select Elixir"
        />
      }
    />
  );
};
