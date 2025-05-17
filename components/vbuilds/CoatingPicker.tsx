import coatingData from "@/data/vbuilds/coatings.json";
import { useBuilder } from "./BuildProvider";

import {
  DropdownSelect,
  DropdownSelectPlaceholder,
} from "./components/DropdownSelect";

export interface Coating {
  id: string;
  name: string;
  image: string;
  arenaCode: string;
}

export type CoatingCollection = Record<string, Coating>;

const coatings: CoatingCollection = coatingData as CoatingCollection;

export function CoatingPicker() {
  const { state, builder } = useBuilder();

  return (
    <DropdownSelect
      options={Object.values(coatings)}
      defaultValue={state.context.coating?.id}
      onSelect={(id) => {
        // builder.send({
        //   type: "ADD_SOURCE",
        //   source: {
        //     id: id,
        //     name: coatings[id].name,
        //     type: "gear",
        //   },
        // });

        builder.send({ type: "ADD_COATING", coating: coatings[id] });
      }}
      placeholder={
        <DropdownSelectPlaceholder
          image={coatings["blood"].image}
          text="Select Coating"
        />
      }
    />
  );
}
