import { ChainIdToName } from "ghommerce-schema/src/chains.schema.ts"

export const ChainInfo = (props: { chainId: number }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <div className="w-10 h-10 rounded-full  flex items-center justify-center">
        <img
          src={`/chain-logo/${ChainIdToName[props.chainId]}.svg`}
          className="w-10 h-10"
          alt={ChainIdToName[props.chainId]}
        />
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-bold">{ChainIdToName[props.chainId]}</div>
      </div>
    </div>
  )
}
