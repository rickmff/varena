import { useBuilder } from "./BuildProvider";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import elixirData from "@/data/vbuilds/elixirs.json";

const elixerOptions = Object.values(elixirData);

type ElixerOption = (typeof elixerOptions)[number];
// type ElixerId = ElixerOption["id"];

export const ElixerPicker: React.FC = () => {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      options={[...elixerOptions]}
      defaultValue={state.context.elixir?.id}
      onSelect={(id: string) => {
        const elixirId = id as keyof typeof elixirData;
        builder.send({ type: "ADD_ELIXIR", elixir: elixirData[elixirId] });
      }}
      placeholder={
        <DropdownSelectPlaceholder
          image="/images/vbuilds/elixirs/elixir-prowler.webp"
          text="Select Elixir"
        />
      }
    />
  );
};
