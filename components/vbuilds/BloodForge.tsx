import React, { Dispatch, useEffect, useState, SetStateAction } from "react";
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
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useSelector } from "@xstate/react";
import { Blood } from "@/types/blood";

const SlotTrigger = ({ children }: { children?: React.ReactNode }) => {
  const { builder } = useBuilder();

  return (
    <DialogTrigger
      className={`w-20 h-20 bg-zinc-900 text-gray-200 rounded-md flex items-center justify-center relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-100`}
      onClick={() => {
        builder.send({ type: "goto.bloodForge" });
      }}
    >
      {children}
    </DialogTrigger>
  );
};

const PrimaryBloodDisplay = ({ blood }: { blood: Blood }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
        <span className="mr-2">{blood.name}</span>
        <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
          All effects included
        </div>
      </h3>
      <div className="space-y-2">
        {Object.values(blood.effects).map((effect, index) => (
          <div
            key={index}
            className="bg-green-900/20 border border-green-900/30 p-3 rounded-md"
          >
            <div className="flex items-center">
              <div className="bg-green-500/20 text-green-300 text-xs p-1.5 rounded-full mr-2">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-sm text-white">
                {index + 1}. {effect.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SecondaryBloodDisplay = ({ blood, setInfusion, infusion }: { blood: Blood; setInfusion?: (value: string) => void; infusion?: string }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
        <span className="mr-2">{blood.name}</span>
        <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
          Choose One Effect ( 1 - 3 )
        </div>
      </h3>
      <div className="space-y-2">
        {/* Selectable effects (1-3) */}
        {Object.entries(blood.effects)
          .slice(0, 3)
          .map(([key, effect], index) => (
            <div
              key={key}
              className={`flex items-center p-3 rounded-md transition-all cursor-pointer ${key === infusion
                ? "bg-red-900/50 border border-red-500/50"
                : "bg-black/30 border border-red-900/30 hover:bg-black/40"
                }`}
              onClick={() => setInfusion && setInfusion(key)}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center border ${infusion === key
                  ? "bg-red-500/50 border-red-400"
                  : "bg-black/50 border-gray-600"
                  }`}
              >
                {infusion === key && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-white">
                {index + 1}. {effect.description}
              </p>
            </div>
          ))}

        {/* Always included 4th perk */}
        <div className="bg-green-900/20 border border-green-900/30 p-3 rounded-md">
          <div className="flex items-center">
            <div className="bg-green-500/20 text-green-300 text-xs p-1.5 rounded-full mr-2">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-sm text-white">
              4. {blood.effects["IV"].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BloodSlotPlaceholder: React.FC<{
  placeholderImage?: string;
  blood: {
    primary: keyof typeof bloodData;
    secondary: keyof typeof bloodData;
    infusion: string;
  } | null;
}> = ({ placeholderImage, blood }) => {
  const { state, builder } = useBuilder();

  if (!blood) {
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
  }

  return (
    <div className="relative w-20 h-20">
      <img
        src={bloodData[blood.primary].image}
        alt="Primary Blood"
        className="pointer-events-none w-10 h-10 absolute top-1.5 left-1.5"
      />
      <img
        src={bloodData[blood.secondary].image}
        alt="Secondary Blood"
        className="pointer-events-none w-10 h-10 absolute bottom-1.5 right-1.5"
      />
      <span
        className="absolute text-red-600 text-xl bottom-0 right-0 w-8 h-8 0"
        style={{
          textShadow: `2px 2px 0 #000, -2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000`,
        }}
      >
        {blood.infusion}
      </span>
    </div>
  );
};

const bloodList = Object.values(bloodData);

type BloodValue = keyof typeof bloodData | "";

const BloodTabs = <T extends BloodValue>({
  setValue,
  setInfusion,
  primarySelectedValue,
  infusion,
  value,
  type,
}: {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  setInfusion?: Dispatch<SetStateAction<string | undefined>>;
  infusion?: string;
  primarySelectedValue?: keyof typeof bloodData | null;
  type: "primary" | "secondary";
}) => {
  return (
    <Tabs
      value={value}
      onValueChange={(value) => {
        if (type === "secondary") {
          setInfusion?.(undefined);
        }

        setValue(value as T);
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
            <div className="flex flex-col gap-4">
              {type === "primary" && <PrimaryBloodDisplay blood={blood} />}
              {type === "secondary" && (
                <SecondaryBloodDisplay
                  blood={blood}
                  setInfusion={setInfusion}
                  infusion={infusion}
                />
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

  const blood = useSelector(builder, (state) => state.context.blood);
  const [primaryBlood, setPrimaryBlood] = useState<keyof typeof bloodData>(blood?.primary || "rogue");
  const [secondaryBlood, setSecondaryBlood] = useState<keyof typeof bloodData | "">(blood?.secondary || "");
  const [secondaryBloodInfusion, setSecondaryBloodInfusion] = useState<string | undefined>(
    blood?.infusion || undefined
  );

  useEffect(() => {
    if (primaryBlood === secondaryBlood) {
      setSecondaryBloodInfusion("");
    }
  }, [primaryBlood, secondaryBlood, setSecondaryBloodInfusion]);

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
        <BloodSlotPlaceholder
          placeholderImage="/images/vbuilds/blood/rogue-blood.webp"
          blood={state.context.blood}
        />
      </SlotTrigger>
      <DialogContent className="w-full max-w-5xl" aria-describedby="Passives">
        <DialogDescription />
        <DialogTitle />
        <div className="grid grid-cols-2 gap-16">
          <div>
            <h2 className="text-lg font-bold text-gray-200 mb-4">
              Primary Blood
            </h2>
            <BloodTabs<keyof typeof bloodData>
              setValue={setPrimaryBlood}
              value={primaryBlood}
              type="primary"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200 mb-4">
              Secondary Blood
            </h2>
            <BloodTabs<keyof typeof bloodData | "">
              type="secondary"
              value={primaryBlood === secondaryBlood ? "" : secondaryBlood}
              setValue={setSecondaryBlood}
              setInfusion={setSecondaryBloodInfusion}
              infusion={secondaryBloodInfusion}
              primarySelectedValue={primaryBlood}
            />
          </div>
        </div>
        {secondaryBloodInfusion && (
          <Button
            variant="outline"
            className="w-full text-white relative overflow-hidden group border-red-900/70 bg-red-900/50 hover:bg-red-800"
            onClick={() => {
              builder.send({
                type: "ADD_BLOOD",
                primary: primaryBlood,
                secondary: secondaryBlood,
                infusion: secondaryBloodInfusion,
              });
            }}
          >
            CREATE BLOOD INFUSION
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
