import { NETWORK } from "@/constants";
import { Aptos, AptosConfig, MoveModule } from "@aptos-labs/ts-sdk";

export const aptos = new Aptos(new AptosConfig({ network: NETWORK as any }));

export function useABI(abi: MoveModule) {
  return {
    view: new Proxy({} as any, {
      get: (_, prop) => {
        const functionName = prop.toString();
        const func = abi.exposed_functions.find((f:any) => f.is_view && f.name === functionName);
        //console.log('view function:', func);
        if (!func) throw new Error(`${functionName} method not found`);
        return (payload: {typeArguments: any[], functionArguments: any[]}) => {
          //console.log('payload:', payload);
          return aptos.view({
            payload: {
              function: `${abi.address}::${abi.name}::${func.name}`,
              functionArguments: payload.functionArguments,
              typeArguments: payload.typeArguments,
            }
          });
        }
      }
    }),
  };
}

