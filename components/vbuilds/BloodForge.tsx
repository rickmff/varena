import { Dispatch, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useBuilder } from "./BuildProvider";
import bloodData from "@/data/vbuilds/bloodtypes.json";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";

const SlotTrigger = ({ children }: { children?: React.ReactNode }) => {
  const { state, builder } = useBuilder();

  return (
    <DialogTrigger
      className={`w-20 h-20 bg-gray-800 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden`}
      onClick={() => {
        builder.send({ type: "goto.bloodForge" });
      }}
    >
      {children}
    </DialogTrigger>
  );
};

export const BloodSlotPlaceholder: React.FC<{
  placeholderImage?: string;
}> = ({ placeholderImage }) => {
  const { state, builder } = useBuilder();

  return (
    <div className="relative">
      <img
        src={placeholderImage}
        alt="Select Weapon"
        className="grayscale brightness-50 opacity-60 pointer-events-none"
      />
      <span className="absolute inset-0 flex items-center justify-center text-white">
        Select Blood
      </span>
    </div>
  );
};

//   return (
//     <div className={`relative rounded-md overflow-hidden`}>
//       <img src={weaponInSlot?.img} className="w-20 h-20" />
//       {weaponInSlot.infusion && (
//         <div className="overflow-hidden w-10 h-10 rounded-md bg-black/80 flex items-center justify-center absolute right-0 bottom-0 border-l-2 border-t-2 border-purple-500 rounded-bl-none rounded-tr-none">
//           <img
//             src={`/images/vbuilds/spellschools/${weaponInSlot.infusion}.png`}
//             className={`spellSchool spellSchool-${weaponInSlot.infusion} w-8 h-8`}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

const bloodList = Object.values(bloodData);

const BloodTabs = ({
  setValue,
  setInfusion,
  primarySelectedValue,
  defaultValue,
  type,
}: {
  defaultValue?: string;
  setValue: Dispatch<React.SetStateAction<any>>;
  setInfusion?: Dispatch<React.SetStateAction<any>>;
  primarySelectedValue?: string | null;
  type: "primary" | "secondary";
}) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={(value) => {
        setValue(value);
      }}
    >
      <TabsList className="flex mb-8">
        {bloodList.map((blood) => (
          <TabsTrigger
            value={blood.id}
            key={blood.id}
            className="disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            disabled={primarySelectedValue === blood.id}
          >
            <img src={blood.image} className="w-8 h-8" alt={blood.name} />
          </TabsTrigger>
        ))}
      </TabsList>
      {bloodList.map((blood) => (
        <TabsContent value={blood.id} key={blood.id} className="space-y-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-200">{blood.name}</h2>
            </div>
            <div className="flex flex-col gap-4">
              <RadioGroup
                defaultValue="I"
                className="space-y-4"
                onValueChange={() => {
                  setInfusion && setInfusion(blood.id);
                }}
              >
                {Object.entries(blood.effects)
                  .filter(([key]) => {
                    if (type === "secondary") {
                      return !["IV", "V"].includes(key);
                    }
                    return true;
                  })
                  .map(([effectKey, effectValue]) => {
                    if (type === "primary") {
                      return (
                        <div key={effectKey} className="text-gray-500">
                          <strong>{effectKey}:</strong>{" "}
                          {effectValue.description}
                        </div>
                      );
                    }
                    return (
                      <div
                        className="flex gap-4 items-center text-gray-500"
                        key={effectKey}
                      >
                        <RadioGroupItem
                          id={`${blood.id} - ${effectKey}`}
                          value={effectKey}
                        />
                        <Label htmlFor={`${blood.id} - ${effectKey}`}>
                          <strong>{effectKey}:</strong>{" "}
                          {effectValue.description}
                        </Label>
                      </div>
                    );
                  })}
              </RadioGroup>
              {type === "secondary" && (
                <div className="border border-red-500 p-4 rounded-md">
                  {blood.effects["IV"].description}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export const BloodForge = () => {
  const { state, builder } = useBuilder();

  const [primaryBlood, setPrimaryBlood] = useState("rogue");
  const [secondaryBlood, setSecondaryBlood] = useState(null);
  const [secondaryBloodInfusion, setSecondaryBloodInfusion] = useState<any>();

  return (
    <Dialog
      open={state.matches("bloodForge")}
      onOpenChange={(open) => {
        if (!open) {
          builder.send({ type: "goto.overview" });
        }
      }}
    >
      <SlotTrigger>
        <BloodSlotPlaceholder placeholderImage="/images/vbuilds/blood/rogue-blood.webp" />
      </SlotTrigger>
      <DialogContent className="w-full max-w-5xl" aria-describedby="Passives">
        <DialogDescription />
        <DialogTitle />
        <div className="grid grid-cols-2 gap-16">
          <div>
            <h2 className="text-lg font-bold text-gray-200 mb-4">
              Primary Blood
            </h2>
            <BloodTabs
              setValue={setPrimaryBlood}
              defaultValue="rogue"
              type="primary"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200 mb-4">
              Secondary Blood
            </h2>
            <BloodTabs
              type="secondary"
              setValue={setSecondaryBlood}
              setInfusion={setSecondaryBloodInfusion}
              primarySelectedValue={primaryBlood}
            />
          </div>
        </div>
        {secondaryBloodInfusion && <Button>Create Blood Infusion</Button>}
      </DialogContent>
    </Dialog>
  );
};
