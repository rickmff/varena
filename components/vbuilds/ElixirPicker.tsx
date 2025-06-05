// import {
//   HoverCard,
//   HoverCardTrigger,
//   HoverCardContent,
// } from "../ui/hover-card";
import { HoverCardDescription, HoverCardTitle } from "../ui/hover-card";
import { useBuilder } from "./BuildProvider";
import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";
import elixirData from "@/data/vbuilds/elixirs.json";

const elixerOptions = Object.values(elixirData);

const ElixirDescription = ({
  elixir,
}: {
  elixir: (typeof elixirData)[keyof typeof elixirData];
}) => {
  return (
    <div className="space-y-4 ">
      <HoverCardTitle>{elixir.name}</HoverCardTitle>
      <HoverCardDescription>
        An elixir that increases{" "}
        {elixir.modifiers
          .map((mod) => `${mod.stat} by +${mod.value}%`)
          .join(" and ")}
      </HoverCardDescription>
      <p></p>
    </div>
  );
};

export const ElixerPicker: React.FC = () => {
  const { state, builder } = useBuilder();
  return (
    <DropdownSelect
      hoverIsVisible={state.context.elixir !== null}
      hoverDescription={<ElixirDescription elixir={state.context.elixir} />}
      hoverOptionDescription={(option: any) => (
        <ElixirDescription elixir={option} />
      )}
      options={[...elixerOptions]}
      defaultValue={state.context.elixir?.id}
      selected={state.context.elixir?.id}
      clear={() => builder.send({ type: "REMOVE_ELIXIR" })}
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
