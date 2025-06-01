import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";
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
    <div className="text-gray-300">
      <p>
        An elixir that increases{" "}
        {elixir.modifiers
          .map((mod) => `${mod.stat} by +${mod.value}%`)
          .join(" and ")}{" "}
        for 60 Minutes. Effect persists through death.
      </p>
    </div>
  );
};

const HoverInfoCard = ({ children, isVisible = false, description }) => {
  console.log(isVisible);
  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent className="w-96 p-4 bg-zinc-900 text-gray-200">
        {description}
      </HoverCardContent>
    </HoverCard>
  );
};

export const ElixerPicker: React.FC = () => {
  const { state, builder } = useBuilder();
  console.log(state.context.elixir);
  return (
    <HoverInfoCard
      isVisible={state.context.elixir !== null}
      description={<ElixirDescription elixir={state.context.elixir} />}
    >
      <DropdownSelect
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
    </HoverInfoCard>
  );
};
