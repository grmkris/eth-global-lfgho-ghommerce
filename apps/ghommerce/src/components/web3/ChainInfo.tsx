import { ChainIdToName } from "ghommerce-schema/src/chains.schema.ts";

export const ChainInfo = (props: {
  chainId: number;
}) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <img
          src={`/icons/${ChainIdToName[props.chainId]}.svg`}
          className="w-6 h-6"
          alt={ChainIdToName[props.chainId]}
        />
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-bold">{ChainIdToName[props.chainId]}</div>
      </div>
    </div>
  );
};
